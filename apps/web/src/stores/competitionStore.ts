import { create } from 'zustand';
import { supabase as supabaseClient } from '@/lib/supabase';
import type { Competition } from '@hashtribe/shared/types';
import { slugify } from '@hashtribe/shared/utils';

const supabase = supabaseClient as any;

interface CompetitionStore {
    competitions: Competition[];
    currentCompetition: Competition | null;
    loading: boolean;
    fetchCompetitions: () => Promise<void>;
    fetchCompetitionBySlug: (slug: string) => Promise<void>;
    createCompetition: (payload: {
        title: string;
        description: string;
        difficulty: Competition['difficulty'];
        start_time: string;
        end_time: string;
        userId: string;
    }) => Promise<Competition>;
}

export const useCompetitionStore = create<CompetitionStore>((set) => ({
    competitions: [],
    currentCompetition: null,
    loading: false,

    fetchCompetitions: async () => {
        set({ loading: true });
        try {
            const { data, error } = await supabase
                .from('competitions')
                .select('*')
                .neq('status', 'draft')
                .order('start_time', { ascending: true });

            if (error) throw error;

            set({ competitions: data || [], loading: false });
        } catch (error) {
            console.error('Error fetching competitions:', error);
            set({ loading: false });
        }
    },

    fetchCompetitionBySlug: async (slug) => {
        set({ loading: true, currentCompetition: null });
        try {
            const { data, error } = await supabase
                .from('competitions')
                .select('*')
                .eq('slug', slug)
                .single();

            if (error) throw error;

            set({ currentCompetition: data, loading: false });
        } catch (error) {
            console.error('Error fetching competition:', error);
            set({ loading: false, currentCompetition: null });
        }
    },

    createCompetition: async ({ title, description, difficulty, start_time, end_time, userId }) => {
        const slug = `${slugify(title)}-${Math.random().toString(36).slice(2, 6)}`;
        const insertPayload = {
            title,
            description,
            difficulty,
            start_time,
            end_time,
            slug,
            status: 'upcoming' as Competition['status'],
            created_by: userId,
        };

        const { data, error } = await supabase
            .from('competitions')
            .insert(insertPayload)
            .select('*')
            .single();

        if (error) {
            console.error('Error creating competition:', error);
            throw error;
        }

        set(state => ({ competitions: [data, ...state.competitions] }));
        return data;
    },
}));
