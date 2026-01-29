import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string, username: string, fullName: string) => Promise<void>;
    signOut: () => Promise<void>;
    updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
    refreshSession: () => Promise<void>;
}

// Track if we're in the browser
const isBrowser = typeof window !== 'undefined';

// Create a singleton subscription manager
class AuthSubscriptionManager {
    private static instance: AuthSubscriptionManager;
    private subscription: any = null;
    private isSubscribed = false;

    private constructor() {}

    static getInstance(): AuthSubscriptionManager {
        if (!AuthSubscriptionManager.instance) {
            AuthSubscriptionManager.instance = new AuthSubscriptionManager();
        }
        return AuthSubscriptionManager.instance;
    }

    subscribe(callback: (event: string, session: Session | null) => void) {
        if (this.isSubscribed) return;

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event: string, session: Session | null) => {
                console.log('Auth state changed:', event, session?.user?.id);
                callback(event, session);
            }
        );

        this.subscription = subscription;
        this.isSubscribed = true;
    }

    unsubscribe() {
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
            this.isSubscribed = false;
        }
    }
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            profile: null,
            session: null,
            loading: true,
            initialized: false,

            initialize: async () => {
                // Don't initialize if already initialized
                if (get().initialized) {
                    set({ loading: false });
                    return;
                }

                try {
                    // First, try to refresh the session
                    const { data: { session: refreshedSession }, error: refreshError } = 
                        await supabase.auth.getSession();

                    if (refreshError) {
                        console.error('Error refreshing session:', refreshError);
                        throw refreshError;
                    }

                    let userProfile = null;
                    
                    if (refreshedSession?.user) {
                        // Fetch user profile
                        const { data: profile, error: profileError } = await supabase
                            .from('users')
                            .select('*')
                            .eq('id', refreshedSession.user.id)
                            .single();

                        if (profileError && profileError.code !== 'PGRST116') {
                            console.error('Error fetching profile:', profileError);
                        }

                        userProfile = profile;
                    }

                    set({
                        user: refreshedSession?.user || null,
                        session: refreshedSession,
                        profile: userProfile,
                        loading: false,
                        initialized: true,
                    });

                    // Set up auth state change listener
                    const authManager = AuthSubscriptionManager.getInstance();
                    authManager.subscribe(async (event: string, session: Session | null) => {
                        console.log('Auth event:', event);
                        
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
                            });

                            // If this is a SIGNED_IN event and profile is missing, retry after delay
                            if (!profile && event === 'SIGNED_IN') {
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
                    set({ 
                        user: null, 
                        session: null, 
                        profile: null, 
                        loading: false, 
                        initialized: true 
                    });
                }
            },

            refreshSession: async () => {
                set({ loading: true });
                
                try {
                    const { data: { session }, error } = await supabase.auth.getSession();
                    
                    if (error) {
                        console.error('Error refreshing session:', error);
                        throw error;
                    }

                    if (session?.user) {
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
                        });
                    } else {
                        set({
                            user: null,
                            session: null,
                            profile: null,
                            loading: false,
                        });
                    }
                } catch (error) {
                    console.error('Error in refreshSession:', error);
                    set({ loading: false });
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

            signInWithGoogle: async () => {
                const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: `${window.location.origin}/auth/callback`,
                        scopes: 'email profile',
                    },
                });

                if (error) {
                    console.error('Error signing in with Google:', error);
                    throw error;
                }
            },

            signInWithEmail: async (email, password) => {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) {
                    console.error('Error signing in with email:', error);
                    throw error;
                }

                // Fetch profile after successful sign in
                if (data.user) {
                    const { data: profile } = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', data.user.id)
                        .single();

                    set({
                        user: data.user,
                        session: data.session,
                        profile: profile || null,
                    });
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
                    // Wait a bit for the trigger to complete
                    setTimeout(async () => {
                        const { data: profile } = await supabase
                            .from('users')
                            .select('*')
                            .eq('id', data.user!.id)
                            .single();

                        if (profile) {
                            set({ profile });
                        }
                    }, 1000);
                }

                return data;
            },

            signOut: async () => {
                const authManager = AuthSubscriptionManager.getInstance();
                authManager.unsubscribe();

                const { error } = await supabase.auth.signOut();

                if (error) {
                    console.error('Error signing out:', error);
                    throw error;
                }

                set({
                    user: null,
                    session: null,
                    profile: null,
                    initialized: false,
                });
            },

            updateProfile: async (updates) => {
                const { profile } = get();
                if (!profile) throw new Error('No profile found');

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
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                // Don't persist loading or initialized state
                user: state.user,
                profile: state.profile,
                session: state.session,
            }),
            onRehydrateStorage: () => {
                return (state, error) => {
                    if (error) {
                        console.error('Error hydrating auth store:', error);
                    }
                    
                    // Set loading to true when rehydrating
                    if (state) {
                        state.loading = true;
                        state.initialized = false;
                    }
                };
            },
        }
    )
);

// Initialize auth store when the app starts
if (isBrowser) {
    // Delay initialization slightly to ensure everything is loaded
    setTimeout(() => {
        useAuthStore.getState().initialize();
    }, 100);
}

if (isBrowser) {
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            // Tab became visible, refresh session
            const { initialized, loading } = useAuthStore.getState();
            if (initialized && !loading) {
                console.log('Tab became visible, refreshing session...');
                useAuthStore.getState().refreshSession();
            }
        }
    });
}