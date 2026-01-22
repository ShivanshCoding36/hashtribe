import { create } from 'zustand';
import { supabase as supabaseClient } from '@/lib/supabase';
const supabase = supabaseClient as any;
import type { Topic, TopicReply } from '@hashtribe/shared/types';

export interface TopicWithUser extends Topic {
    user: {
        username: string;
        display_name: string;
        avatar_url: string;
    };
    replies?: TopicReplyWithUser[];
}

export interface TopicReplyWithUser extends TopicReply {
    user: {
        username: string;
        display_name: string;
        avatar_url: string;
    };
}

interface TopicStore {
    topics: TopicWithUser[];
    currentTopic: TopicWithUser | null;
    replies: TopicReplyWithUser[];
    loading: boolean;
    fetchTopics: (tribeId: string) => Promise<void>;
    fetchTopicById: (topicId: string) => Promise<void>;
    createTopic: (tribeId: string, userId: string, title: string, content: string) => Promise<void>;
    createReply: (topicId: string, userId: string, content: string, codeSnippet?: string) => Promise<void>;
    deleteTopic: (topicId: string) => Promise<void>;
    deleteReply: (replyId: string) => Promise<void>;
    toggleTopicUpvote: (topicId: string) => Promise<void>;
    toggleReplyUpvote: (replyId: string) => Promise<void>;
}

export const useTopicStore = create<TopicStore>((set, get) => ({
    topics: [],
    currentTopic: null,
    replies: [],
    loading: false,

    fetchTopics: async (tribeId) => {
        set({ loading: true });
        try {
            const { data: topicsData, error } = await supabase
                .from('topics')
                .select(`
                    *,
                    user:users!topics_created_by_fkey(username, display_name, avatar_url)
                `)
                .eq('tribe_id', tribeId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const topics: TopicWithUser[] = topicsData || [];

            set({ topics, loading: false });
        } catch (error) {
            console.error('Error fetching topics:', error);
            set({ loading: false });
        }
    },

    fetchTopicById: async (topicId) => {
        set({ loading: true });
        try {
            // Fetch topic with user details
            const { data: topicData, error: topicError } = await supabase
                .from('topics')
                .select(`
                    *,
                    user:users!topics_created_by_fkey(username, display_name, avatar_url)
                `)
                .eq('id', topicId)
                .single();

            if (topicError) throw topicError;

            // Fetch replies with user details
            const { data: repliesData, error: repliesError } = await supabase
                .from('topic_replies')
                .select(`
                    *,
                    user:users!topic_replies_created_by_fkey(username, display_name, avatar_url)
                `)
                .eq('topic_id', topicId)
                .order('created_at', { ascending: true });

            if (repliesError) throw repliesError;

            const topic: TopicWithUser = {
                ...topicData,
                reply_count: repliesData?.length || 0,
                replies: repliesData || [],
            };

            set({ currentTopic: topic, replies: repliesData || [], loading: false });
        } catch (error) {
            console.error('Error fetching topic:', error);
            set({ loading: false });
        }
    },

    createTopic: async (tribeId, userId, title, content) => {
        try {
            const { data, error } = await supabase
                .from('topics')
                .insert({
                    tribe_id: tribeId,
                    title,
                    content,
                    created_by: userId,
                })
                .select(`
                    *,
                    user:users!topics_created_by_fkey(username, display_name, avatar_url)
                `)
                .single();

            if (error) throw error;

            const newTopic: TopicWithUser = {
                ...data,
                reply_count: 0,
            };

            set(state => ({ topics: [newTopic, ...state.topics] }));
        } catch (error) {
            console.error('Error creating topic:', error);
            throw error;
        }
    },

    createReply: async (topicId, userId, content, codeSnippet) => {
        try {
            const { data, error } = await supabase
                .from('topic_replies')
                .insert({
                    topic_id: topicId,
                    content,
                    code_snippet: codeSnippet,
                    created_by: userId,
                })
                .select(`
                    *,
                    user:users!topic_replies_created_by_fkey(username, display_name, avatar_url)
                `)
                .single();

            if (error) throw error;

            // Update topic reply count
            await supabase.rpc('increment_topic_reply_count', { topic_id: topicId });

            set(state => ({
                replies: [...state.replies, data],
                currentTopic: state.currentTopic ? {
                    ...state.currentTopic,
                    reply_count: (state.currentTopic.reply_count || 0) + 1,
                } : null,
                topics: state.topics.map(t =>
                    t.id === topicId ? { ...t, reply_count: (t.reply_count || 0) + 1 } : t
                ),
            }));
        } catch (error) {
            console.error('Error creating reply:', error);
            throw error;
        }
    },

    deleteTopic: async (topicId) => {
        try {
            const { error } = await supabase
                .from('topics')
                .delete()
                .eq('id', topicId);

            if (error) throw error;

            set(state => ({
                topics: state.topics.filter(t => t.id !== topicId),
                currentTopic: state.currentTopic?.id === topicId ? null : state.currentTopic,
            }));
        } catch (error) {
            console.error('Error deleting topic:', error);
            throw error;
        }
    },

    deleteReply: async (replyId) => {
        try {
            // Get the topic ID before deleting
            const reply = get().replies.find(r => r.id === replyId);
            if (!reply) return;

            const { error } = await supabase
                .from('topic_replies')
                .delete()
                .eq('id', replyId);

            if (error) throw error;

            // Decrement topic reply count
            await supabase.rpc('decrement_topic_reply_count', { topic_id: reply.topic_id });

            set(state => ({
                replies: state.replies.filter(r => r.id !== replyId),
                currentTopic: state.currentTopic ? {
                    ...state.currentTopic,
                    reply_count: Math.max(0, (state.currentTopic.reply_count || 0) - 1),
                } : null,
                topics: state.topics.map(t =>
                    t.id === reply.topic_id ? { ...t, reply_count: Math.max(0, (t.reply_count || 0) - 1) } : t
                ),
            }));
        } catch (error) {
            console.error('Error deleting reply:', error);
            throw error;
        }
    },

    toggleTopicUpvote: async (topicId) => {
        // This would require a topic_upvotes table - for now, just increment/decrement
        try {
            const topic = get().topics.find(t => t.id === topicId);
            if (!topic) return;

            const newUpvotes = topic.upvotes + 1; // Simplified - would need proper upvote tracking

            const { error } = await supabase
                .from('topics')
                .update({ upvotes: newUpvotes })
                .eq('id', topicId);

            if (error) throw error;

            set(state => ({
                topics: state.topics.map(t =>
                    t.id === topicId ? { ...t, upvotes: newUpvotes } : t
                ),
                currentTopic: state.currentTopic?.id === topicId ? {
                    ...state.currentTopic,
                    upvotes: newUpvotes
                } : state.currentTopic,
            }));
        } catch (error) {
            console.error('Error toggling topic upvote:', error);
        }
    },

    toggleReplyUpvote: async (replyId) => {
        // This would require a reply_upvotes table - for now, just increment/decrement
        try {
            const reply = get().replies.find(r => r.id === replyId);
            if (!reply) return;

            const newUpvotes = reply.upvotes + 1; // Simplified - would need proper upvote tracking

            const { error } = await supabase
                .from('topic_replies')
                .update({ upvotes: newUpvotes })
                .eq('id', replyId);

            if (error) throw error;

            set(state => ({
                replies: state.replies.map(r =>
                    r.id === replyId ? { ...r, upvotes: newUpvotes } : r
                ),
            }));
        } catch (error) {
            console.error('Error toggling reply upvote:', error);
        }
    },
}));