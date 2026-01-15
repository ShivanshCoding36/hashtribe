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
                    created_by?: string // Optional if trigger handles it, but we send it now
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
