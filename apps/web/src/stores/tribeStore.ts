import { create } from 'zustand';
import { supabase as supabaseClient } from '@/lib/supabase';
const supabase = supabaseClient as any;
import type { Tribe, TribeWithMembership, TribeMember } from '@hashtribe/shared/types';

interface TribeState {
    tribes: TribeWithMembership[];
    currentTribe: Tribe | null;
    members: TribeMember[];
    loading: boolean;
    error: string | null;


    // Actions
    fetchTribes: (userId?: string) => Promise<void>;
    fetchTribeBySlug: (slug: string, userId?: string) => Promise<void>;
    fetchTribeMembers: (tribeId: string) => Promise<void>;
    createTribe: (data: { name: string; description: string; visibility: 'public' | 'private' }) => Promise<Tribe>;
    joinTribe: (tribeId: string, userId: string) => Promise<void>;
    leaveTribe: (tribeId: string, userId: string) => Promise<void>;
    updateTribe: (tribeId: string, updates: Partial<Tribe>) => Promise<void>;
    deleteTribe: (tribeId: string) => Promise<void>;
}

export const useTribeStore = create<TribeState>((set, get) => ({
    tribes: [],
    currentTribe: null,
    members: [],
    loading: false,
    error: null,

    fetchTribes: async (userId) => {
    set({ loading: true, error: null });

    try {
        const { data: tribes, error } = await supabase
            .from('tribes')
            .select(`
                *,
                tribe_members!inner(count)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        let tribesWithMembership: TribeWithMembership[] = tribes || [];

        if (userId && tribes) {
            const { data: memberships } = await supabase
                .from('tribe_members')
                .select('tribe_id, role')
                .eq('user_id', userId);

            const membershipMap = new Map(
                memberships?.map((m: any) => [m.tribe_id, m.role]) || []
            );

            tribesWithMembership = tribes.map((tribe: any) => ({
                ...tribe,
                member_count: tribe.tribe_members?.[0]?.count || 0,
                is_member: membershipMap.has(tribe.id),
                user_role: membershipMap.get(tribe.id) || null,
            }));
        }

        set({ tribes: tribesWithMembership, loading: false });
    } catch (err: any) {
        console.error('Error fetching tribes:', err);
        set({
            loading: false,
            error: err.message || 'Failed to load tribes',
        });
    }
},

    fetchTribeBySlug: async (slug) => {
    set({ loading: true, error: null });

    try {
        const { data: tribe, error } = await supabase
            .from('tribes')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) throw error;

        set({ currentTribe: tribe });

        if (tribe) {
            await get().fetchTribeMembers(tribe.id);
        }
    } catch (err: any) {
        console.error('Error fetching tribe:', err);
        set({ error: err.message || 'Failed to load tribe' });
    } finally {
        set({ loading: false });
    }
},

    fetchTribeMembers: async (tribeId) => {
    set({ loading: true, error: null });

    try {
        const { data: members, error } = await supabase
            .from('tribe_members')
            .select(`
                *,
                users:user_id (
                    username,
                    display_name,
                    avatar_url
                )
            `)
            .eq('tribe_id', tribeId)
            .order('joined_at', { ascending: false });

        if (error) throw error;

        set({ members: members || [] });
    } catch (err: any) {
        console.error('Error fetching tribe members:', err);
        set({ error: err.message || 'Failed to load members' });
    } finally {
        set({ loading: false });
    }
},

    createTribe: async (data) => {
    set({ loading: true, error: null });

    try {
        const { generateUniqueSlug } = await import('@hashtribe/shared/utils');
        const { useAuthStore } = await import('./authStore');
        const user = useAuthStore.getState().user;

        if (!user) throw new Error("User must be logged in to create a tribe");

        const slug = generateUniqueSlug(data.name);

        const { data: tribe, error } = await supabase
            .from('tribes')
            .insert({
                ...data,
                slug,
                created_by: user.id
            })
            .select()
            .single();

        if (error) throw error;

        await get().fetchTribes(user.id);

        return tribe;
    } catch (err: any) {
        set({ error: err.message || 'Failed to create tribe' });
        throw err;
    } finally {
        set({ loading: false });
    }
},


    joinTribe: async (tribeId, userId) => {
        const { error } = await supabase
            .from('tribe_members')
            .insert({
                tribe_id: tribeId,
                user_id: userId,
                role: 'member',
            });

        if (error) throw error;

        // Refresh current tribe and tribes list
        await get().fetchTribes(userId);
        if (get().currentTribe?.id === tribeId) {
            await get().fetchTribeMembers(tribeId);
        }
    },

    leaveTribe: async (tribeId, userId) => {
        const { error } = await supabase
            .from('tribe_members')
            .delete()
            .eq('tribe_id', tribeId)
            .eq('user_id', userId);

        if (error) throw error;

        // Refresh tribes list
        await get().fetchTribes(userId);
        if (get().currentTribe?.id === tribeId) {
            await get().fetchTribeMembers(tribeId);
        }
    },

    updateTribe: async (tribeId, updates) => {
        const { error } = await supabase
            .from('tribes')
            .update(updates)
            .eq('id', tribeId);

        if (error) throw error;

        // Refresh current tribe
        if (get().currentTribe?.id === tribeId) {
            const { data } = await supabase
                .from('tribes')
                .select('*')
                .eq('id', tribeId)
                .single();

            if (data) set({ currentTribe: data });
        }
    },

    deleteTribe: async (tribeId) => {
        const { error } = await supabase
            .from('tribes')
            .delete()
            .eq('id', tribeId);

        if (error) throw error;

        // Refresh tribes list
        await get().fetchTribes();
        set({ currentTribe: null });
    },
}));
