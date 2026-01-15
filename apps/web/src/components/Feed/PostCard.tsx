import { Link } from 'react-router-dom';
import { formatRelativeTime } from '@hashtribe/shared/utils';
import { Heart, MessageSquare, Share2, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { Post } from '@/stores/postStore';
import { useAuthStore } from '@/stores/authStore';

interface PostCardProps {
    post: Post;
    onLike: (id: string) => void;
    onDelete: (id: string) => void;
    showTribe?: boolean;
}

export function PostCard({ post, onLike, onDelete, showTribe = false }: PostCardProps) {
    const { user } = useAuthStore();
    const isOwner = user?.id === post.user_id;

    return (
        <div className="flex gap-4 p-4 border-b border-charcoal-800 hover:bg-charcoal-900/50 transition-colors">
            {/* Avatar */}
            <Link to={`/profile/${post.user.username}`} className="flex-shrink-0">
                <img
                    src={post.user.avatar_url || `https://ui-avatars.com/api/?name=${post.user.username}&background=random`}
                    alt={post.user.username}
                    className="w-10 h-10 rounded-full bg-charcoal-700 object-cover"
                />
            </Link>

            {/* Content */}
            <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm flex-wrap">
                        <Link to={`/profile/${post.user.username}`} className="font-bold text-white hover:underline">
                            {post.user.display_name || post.user.username}
                        </Link>
                        <span className="text-grey-500">@{post.user.username}</span>

                        {showTribe && post.tribe && (
                            <>
                                <span className="text-grey-600">in</span>
                                <Link to={`/tribes/${post.tribe.slug}`} className="font-bold text-primary-400 hover:text-primary-300 hover:underline">
                                    {post.tribe.name}
                                </Link>
                            </>
                        )}

                        <span className="text-grey-600">·</span>
                        <span className="text-grey-500 hover:underline cursor-pointer">
                            {formatRelativeTime(post.created_at)}
                        </span>
                    </div>
                    {isOwner && (
                        <div className="relative group">
                            <button className="text-grey-500 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-500/10" onClick={() => onDelete(post.id)}>
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Body */}
                <p className="mt-1 text-grey-200 whitespace-pre-wrap break-words text-[15px] leading-normal">
                    {post.content}
                </p>

                {/* Attachments (Placeholder logic) */}
                {post.image_urls && post.image_urls.length > 0 && (
                    <div className="mt-3 rounded-2xl overflow-hidden border border-charcoal-800">
                        {/* Simple grid for multiple images would go here */}
                        <img src={post.image_urls[0]} alt="Post attachment" className="w-full h-auto max-h-96 object-cover" />
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between mt-3 max-w-sm">
                    <button className="flex items-center gap-2 group text-grey-500 hover:text-blue-400 transition-colors">
                        <div className="p-2 rounded-full group-hover:bg-blue-400/10 transition-colors">
                            <MessageSquare className="w-4 h-4" />
                        </div>
                        <span className="text-xs group-hover:text-blue-400">{post.replies_count || ''}</span>
                    </button>

                    <button
                        onClick={() => onLike(post.id)}
                        className={clsx(
                            "flex items-center gap-2 group transition-colors",
                            post.liked_by_user ? "text-red-500" : "text-grey-500 hover:text-red-500"
                        )}
                    >
                        <div className={clsx("p-2 rounded-full transition-colors", post.liked_by_user ? "bg-red-500/10" : "group-hover:bg-red-500/10")}>
                            <Heart className={clsx("w-4 h-4", post.liked_by_user && "fill-current")} />
                        </div>
                        <span className="text-xs">{post.likes_count || ''}</span>
                    </button>

                    <button className="flex items-center gap-2 group text-grey-500 hover:text-green-400 transition-colors">
                        <div className="p-2 rounded-full group-hover:bg-green-400/10 transition-colors">
                            <Share2 className="w-4 h-4" />
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
