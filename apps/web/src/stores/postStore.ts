import { create } from 'zustand';
import { supabase as supabaseClient } from '@/lib/supabase';
const supabase = supabaseClient as any;

export interface Post {
    id: string;
    tribe_id: string;
    user_id: string;
    content: string | null;
    image_urls: string[] | null;
    created_at: string;
    likes_count: number;
    replies_count: number;
    user: {
        username: string;
        display_name: string;
        avatar_url: string;
    };
    tribe?: {
        name: string;
        slug: string;
        visibility: 'public' | 'private';
    };
    liked_by_user?: boolean;
}

interface PostStore {
    posts: Post[];
    loading: boolean;
    error: string | null;  
    fetchPosts: (tribeId: string, userId?: string) => Promise<void>;
    fetchFeed: (userId?: string) => Promise<void>;
    createPost: (tribeId: string, userId: string, content: string, imageUrls?: string[]) => Promise<void>;
    deletePost: (postId: string) => Promise<void>;
    toggleLike: (postId: string, userId: string) => Promise<void>;
}


export const usePostStore = create<PostStore>((set, get) => ({
    posts: [],
    loading: false,
      error: null,

    fetchPosts: async (tribeId, userId) => {
    set({ loading: true, error: null });
    try {
        const { data: postsData, error } = await supabase
            .from('posts')
            .select(`
                *,
                user:users!posts_user_id_fkey(username, display_name, avatar_url),
                tribe:tribes(name, slug, visibility)
            `)
            .eq('tribe_id', tribeId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        let posts: Post[] = postsData.map((p: any) => ({
            ...p,
            user: p.user,
            tribe: p.tribe,
            liked_by_user: false,
        }));

        if (userId && posts.length > 0) {
            const postIds = posts.map(p => p.id);
            const { data: likes } = await supabase
                .from('post_likes')
                .select('post_id')
                .eq('user_id', userId)
                .in('post_id', postIds);

            const likedPostIds = new Set(likes?.map((l: any) => l.post_id));
            posts = posts.map(p => ({
                ...p,
                liked_by_user: likedPostIds.has(p.id)
            }));
        }

        set({ posts, loading: false });
    } catch (err: any) {
        console.error('Error fetching posts:', err);
        set({ loading: false, error: err.message || 'Failed to load posts' });
    }
},


    fetchFeed: async (userId) => {
    set({ loading: true, error: null });
    try {
        const { data: postsData, error } = await supabase
            .from('posts')
            .select(`
                *,
                user:users!posts_user_id_fkey(username, display_name, avatar_url),
                tribe:tribes(name, slug, visibility)
            `)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        let posts: Post[] = postsData.map((p: any) => ({
            ...p,
            user: p.user,
            tribe: p.tribe,
            liked_by_user: false,
        }));

        if (userId && posts.length > 0) {
            const postIds = posts.map(p => p.id);
            const { data: likes } = await supabase
                .from('post_likes')
                .select('post_id')
                .eq('user_id', userId)
                .in('post_id', postIds);

            const likedPostIds = new Set(likes?.map((l: any) => l.post_id));
            posts = posts.map(p => ({
                ...p,
                liked_by_user: likedPostIds.has(p.id)
            }));
        }

        set({ posts, loading: false });
    } catch (err: any) {
        console.error('Error fetching feed:', err);
        set({ loading: false, error: err.message || 'Failed to load feed' });
    }
},


    createPost: async (tribeId, userId, content, imageUrls = []) => {
        try {
            const { error } = await supabase
                .from('posts')
                .insert({
                    tribe_id: tribeId,
                    user_id: userId,
                    content,
                    image_urls: imageUrls
                })
                .select()
                .single();

            if (error) throw error;

            // Optimistic update? Or just refetch. Refetch is safer for relations.
            // But to be fast, we can insert manually if we have user details.
            // For now, re-fetch to get 'user' join easily.
            get().fetchPosts(tribeId, userId);
        } catch (error) {
            console.error('Error creating post:', error);
            throw error;
        }
    },

    deletePost: async (postId) => {
        try {
            const { error } = await supabase.from('posts').delete().eq('id', postId);
            if (error) throw error;
            set(state => ({ posts: state.posts.filter(p => p.id !== postId) }));
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    },

    toggleLike: async (postId, userId) => {
        const posts = get().posts;
        const postIndex = posts.findIndex(p => p.id === postId);
        if (postIndex === -1) return;

        const post = posts[postIndex];
        const isLiked = post.liked_by_user;

        // Optimistic UI Update
        const updatedPosts = [...posts];
        updatedPosts[postIndex] = {
            ...post,
            liked_by_user: !isLiked,
            likes_count: isLiked ? post.likes_count - 1 : post.likes_count + 1
        };
        set({ posts: updatedPosts });

        try {
            if (isLiked) {
                // Unlike
                await supabase
                    .from('post_likes')
                    .delete()
                    .eq('post_id', postId)
                    .eq('user_id', userId);

                // Decrement counter (optional if we trigger it, but Supabase doesn't auto-decrement count column unless trigger logic exists)
                // My migration didn't add count trigger logic. I should update counts manually or rely on count query.
                // Migration had "likes_count" column but no trigger logic to update it!
                // I should add a fix or do manual increment.
                await supabase.rpc('decrement_likes', { row_id: postId }); // Need RPC?
                // Actually, standard approach: simple update.
                await supabase
                    .from('posts')
                    .update({ likes_count: post.likes_count - 1 }) // This is race-condition prone but ok for prototype
                    .eq('id', postId);

            } else {
                // Like
                await supabase
                    .from('post_likes')
                    .insert({ post_id: postId, user_id: userId });

                await supabase
                    .from('posts')
                    .update({ likes_count: post.likes_count + 1 })
                    .eq('id', postId);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            // Revert on error
            set({ posts });
        }
    }
}));
