export type { Database } from './database.types';

// User Types
export interface UserProfile {
    id: string;
    username: string;
    display_name: string | null;
    bio: string | null;
    avatar_url: string | null;
    github_username: string;
    github_id: number;
    devcom_score: number;
    created_at: string;
    updated_at: string;
}

// Tribe Types
export type TribeVisibility = 'public' | 'private';
export type TribeRole = 'admin' | 'member';

export interface Tribe {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    visibility: TribeVisibility;
    created_by: string;
    created_at: string;
    updated_at: string;
    member_count?: number;
}

export interface TribeMember {
    id?: string; // composite key usually, but marked optional if missing
    tribe_id: string;
    user_id: string;
    role: TribeRole;
    joined_at: string;
    users?: {
        username: string;
        display_name: string | null;
        avatar_url: string | null;
    };
}

export interface TribeWithMembership extends Tribe {
    is_member: boolean;
    user_role: TribeRole | null;
}

// Topic Types
export interface Topic {
    id: string;
    tribe_id: string;
    title: string;
    content: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    upvotes: number;
    reply_count?: number;
}

export interface TopicReply {
    id: string;
    topic_id: string;
    content: string;
    code_snippet: string | null;
    created_by: string;
    created_at: string;
    updated_at: string;
    upvotes: number;
}

// Competition Types
export type CompetitionStatus = 'draft' | 'upcoming' | 'live' | 'ended';
export type CompetitionDifficulty = 'easy' | 'medium' | 'hard';

export interface Competition {
    id: string;
    title: string;
    slug: string;
    description: string;
    difficulty: CompetitionDifficulty;
    status: CompetitionStatus;
    start_time: string;
    end_time: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    participant_count?: number;
}

export interface CompetitionParticipant {
    id: string;
    competition_id: string;
    user_id: string;
    score: number;
    rank: number | null;
    submitted_at: string | null;
    joined_at: string;
}

// Leaderboard Types
export interface LeaderboardEntry {
    rank: number;
    user_id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    devcom_score: number;
    github_username: string;
}

export interface CompetitionLeaderboardEntry {
    rank: number;
    user_id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    score: number;
    submitted_at: string | null;
}
