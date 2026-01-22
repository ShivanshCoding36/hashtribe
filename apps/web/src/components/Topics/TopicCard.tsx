import { Link } from 'react-router-dom';
import { formatRelativeTime } from '@hashtribe/shared/utils';
import { MessageSquare, ChevronUp, Trash2 } from 'lucide-react';
import { TopicWithUser } from '@/stores/topicStore';
import { useAuthStore } from '@/stores/authStore';

interface TopicCardProps {
    topic: TopicWithUser;
    onDelete?: (id: string) => void;
}

export function TopicCard({ topic, onDelete }: TopicCardProps) {
    const { user } = useAuthStore();
    const isOwner = user?.id === topic.created_by;

    return (
        <div className="bg-black border border-charcoal-800 rounded-xl p-4 hover:bg-charcoal-900/50 transition-colors">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                    <Link to={`/profile/${topic.user.username}`} className="flex-shrink-0">
                        <img
                            src={topic.user.avatar_url || `https://ui-avatars.com/api/?name=${topic.user.username}&background=random`}
                            alt={topic.user.username}
                            className="w-8 h-8 rounded-full bg-charcoal-700 object-cover"
                        />
                    </Link>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-sm flex-wrap">
                            <Link to={`/profile/${topic.user.username}`} className="font-bold text-white hover:underline">
                                {topic.user.display_name || topic.user.username}
                            </Link>
                            <span className="text-grey-500">@{topic.user.username}</span>
                            <span className="text-grey-600">·</span>
                            <span className="text-grey-500 hover:underline cursor-pointer">
                                {formatRelativeTime(topic.created_at)}
                            </span>
                        </div>
                    </div>
                </div>
                {isOwner && onDelete && (
                    <div className="relative group flex-shrink-0">
                        <button
                            className="text-grey-500 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-500/10"
                            onClick={() => onDelete(topic.id)}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="mb-3">
                <Link to={`/tribes/topics/${topic.id}`} className="block group">
                    <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors mb-2 line-clamp-2">
                        {topic.title}
                    </h3>
                    <p className="text-grey-300 text-sm line-clamp-3 leading-relaxed">
                        {topic.content}
                    </p>
                </Link>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 group text-grey-500 hover:text-blue-400 transition-colors">
                        <div className="p-2 rounded-full group-hover:bg-blue-400/10 transition-colors">
                            <MessageSquare className="w-4 h-4" />
                        </div>
                        <span className="text-xs group-hover:text-blue-400">
                            {topic.reply_count || 0} {topic.reply_count === 1 ? 'reply' : 'replies'}
                        </span>
                    </button>

                    <div className="flex items-center gap-2 group text-grey-500">
                        <div className="p-2 rounded-full group-hover:bg-grey-600/10 transition-colors">
                            <ChevronUp className="w-4 h-4" />
                        </div>
                        <span className="text-xs">{topic.upvotes || 0}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}