import { create } from 'zustand';
import { supabase as supabaseClient } from '@/lib/supabase';
const supabase = supabaseClient as any;
import type { User, Session } from '@supabase/supabase-js';
import type { UserProfile } from '@hashtribe/shared/types';

interface AuthState {
    user: User | null;
    profile: UserProfile | null;
    session: Session | null;
    loading: boolean;
    initialized: boolean;

    // Actions
    initialize: () => Promise<void>;
    signInWithGitHub: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string, username: string, fullName: string) => Promise<void>;
    signOut: () => Promise<void>;
    updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    profile: null,
    session: null,
    loading: true,
    initialized: false,

    initialize: async () => {
        try {
            // Get initial session
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                // Fetch user profile
                const { data: profile } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                set({
                    user: session.user,
                    session,
                    profile: profile || null,
                    loading: false,
                    initialized: true,
                });
            } else {
                set({ loading: false, initialized: true });
            }

            // Listen for auth changes
            supabase.auth.onAuthStateChange(async (event: any, session: any) => {
                console.log('Auth state changed:', event);

                if (session?.user) {
                    // Fetch or create user profile
                    let { data: profile } = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    // If profile doesn't exist, it should be created by the database trigger
                    // We can just refetch if needed or wait for the subscription (realtime) if we implemented it
                    if (!profile && event === 'SIGNED_IN') {
                        // Retry fetching profile after a brief delay in case trigger is slow
                        setTimeout(async () => {
                            const { data: retryProfile } = await supabase
                                .from('users')
                                .select('*')
                                .eq('id', session.user.id)
                                .single();

                            if (retryProfile) {
                                set({ profile: retryProfile });
                            }
                        }, 1000);
                    }

                    set({
                        user: session.user,
                        session,
                        profile: profile || null,
                        loading: false,
                    });
                } else {
                    set({
                        user: null,
                        session: null,
                        profile: null,
                        loading: false,
                    });
                }
            });
        } catch (error) {
            console.error('Error initializing auth:', error);
            set({ loading: false, initialized: true });
        }
    },

    signInWithGitHub: async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                scopes: 'read:user user:email',
            },
        });

        if (error) {
            console.error('Error signing in with GitHub:', error);
            throw error;
        }
    },

    signInWithEmail: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('Error signing in with email:', error);
            throw error;
        }
    },

    signUpWithEmail: async (email, password, username, fullName) => {
        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                    full_name: fullName,
                },
            },
        });

        if (signUpError) {
            console.error('Error signing up:', signUpError);
            throw signUpError;
        }

        if (data.user) {
            // User created in Auth. Database Trigger 'on_auth_user_created' should create the public profile.
        }
    },

    signOut: async () => {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Error signing out:', error);
            throw error;
        }

        set({
            user: null,
            session: null,
            profile: null,
        });
    },

    updateProfile: async (updates) => {
        const { profile } = get();
        if (!profile) return;

        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', profile.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating profile:', error);
            throw error;
        }

        set({ profile: data });
    },
}));
