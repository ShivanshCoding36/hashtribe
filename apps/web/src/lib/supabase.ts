import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Define Types Inline to ensure availability during build
export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    username: string
                    display_name: string | null
                    avatar_url: string | null
                    bio: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    username: string
                    display_name?: string | null
                    avatar_url?: string | null
                    bio?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    username?: string
                    display_name?: string | null
                    avatar_url?: string | null
                    bio?: string | null
                    github_username?: string | null
                    github_id?: number | null
                    devcom_score?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            tribes: {
                Row: {
                    id: string
                    slug: string
                    name: string
                    description: string | null
                    visibility: 'public' | 'private'
                    created_by: string
                    is_official: boolean
                    cover_url: string | null
                    logo_url: string | null
                    tags: string[] | null
                    rules: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    slug: string
                    name: string
                    description?: string | null
                    visibility: 'public' | 'private'
                    created_by?: string
                    is_official?: boolean
                    cover_url?: string | null
                    logo_url?: string | null
                    tags?: string[] | null
                    rules?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    slug?: string
                    name?: string
                    description?: string | null
                    visibility?: 'public' | 'private'
                    created_by?: string
                    is_official?: boolean
                    cover_url?: string | null
                    logo_url?: string | null
                    tags?: string[] | null
                    rules?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            tribe_members: {
                Row: {
                    tribe_id: string
                    user_id: string
                    role: 'admin' | 'moderator' | 'member'
                    joined_at: string
                }
                Insert: {
                    tribe_id: string
                    user_id: string
                    role?: 'admin' | 'moderator' | 'member'
                    joined_at?: string
                }
                Update: {
                    tribe_id?: string
                    user_id?: string
                    role?: 'admin' | 'moderator' | 'member'
                    joined_at?: string
                }
            }
            posts: {
                Row: {
                    id: string
                    tribe_id: string
                    user_id: string
                    content: string | null
                    image_urls: string[] | null
                    parent_id: string | null
                    likes_count: number
                    replies_count: number
                    reposts_count: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    tribe_id: string
                    user_id: string
                    content?: string | null
                    image_urls?: string[] | null
                    parent_id?: string | null
                    likes_count?: number
                    replies_count?: number
                    reposts_count?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    tribe_id?: string
                    user_id?: string
                    content?: string | null
                    image_urls?: string[] | null
                    parent_id?: string | null
                    likes_count?: number
                    replies_count?: number
                    reposts_count?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            post_likes: {
                Row: {
                    post_id: string
                    user_id: string
                    created_at: string
                }
                Insert: {
                    post_id: string
                    user_id: string
                    created_at?: string
                }
                Update: {
                    post_id?: string
                    user_id?: string
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            decrement_likes: {
                Args: { row_id: string }
                Returns: void
            }
        }
        Enums: {
            [_ in never]: never
        }
    }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Missing Supabase environment variables. Please check your .env file.'
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? localStorage : undefined,
        storageKey: 'supabase.auth.token',
    },
    global: {
        headers: {
            'x-application-name': 'hashtribe',
        },
    },
});