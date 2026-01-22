import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTopicStore } from '@/stores/topicStore';
import { useAuthStore } from '@/stores/authStore';
import { formatRelativeTime } from '@hashtribe/shared/utils';
import { ArrowLeft, MessageSquare, ChevronUp, Trash2, Code } from 'lucide-react';
import clsx from 'clsx';

export function TopicDetailPage() {
    const { topicId } = useParams<{ topicId: string }>();
    const { currentTopic, replies, loading, fetchTopicById, createReply, deleteReply } = useTopicStore();
    const { user } = useAuthStore();
    const [replyContent, setReplyContent] = useState('');
    const [codeSnippet, setCodeSnippet] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (topicId) {
            fetchTopicById(topicId);
        }
    }, [topicId]);

    const handleCreateReply = async () => {
        if (!replyContent.trim() || !topicId || !user || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await createReply(topicId, user.id, replyContent.trim(), codeSnippet.trim() || undefined);
            setReplyContent('');
            setCodeSnippet('');
        } catch (error) {
            console.error('Failed to create reply', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading || !currentTopic) {
        if (!loading && !currentTopic) {
            return (
                <div className="text-center py-20">
                    <h2 className="text-2xl font-bold text-white mb-2">Topic not found</h2>
                    <Link to="/tribes" className="text-primary-400 hover:underline">Return to Tribes</Link>
                </div>
            );
        }
        return (
            <div className="text-center py-20">
                <div className="w-12 h-12 border-4 border-charcoal-600 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Back Navigation */}
            <div className="mb-6">
                <Link
                    to={`/tribes/${currentTopic.tribe_id}`}
                    className="inline-flex items-center gap-2 text-grey-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Tribe
                </Link>
            </div>

            {/* Topic Header */}
            <div className="bg-black border border-charcoal-800 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-4">
                    <Link to={`/profile/${currentTopic.user.username}`} className="flex-shrink-0">
                        <img
                            src={currentTopic.user.avatar_url || `https://ui-avatars.com/api/?name=${currentTopic.user.username}&background=random`}
                            alt={currentTopic.user.username}
                            className="w-12 h-12 rounded-full bg-charcoal-700 object-cover"
                        />
                    </Link>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm mb-2 flex-wrap">
                            <Link to={`/profile/${currentTopic.user.username}`} className="font-bold text-white hover:underline">
                                {currentTopic.user.display_name || currentTopic.user.username}
                            </Link>
                            <span className="text-grey-500">@{currentTopic.user.username}</span>
                            <span className="text-grey-600">·</span>
                            <span className="text-grey-500">
                                {formatRelativeTime(currentTopic.created_at)}
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-3">{currentTopic.title}</h1>
                        <p className="text-grey-200 leading-relaxed whitespace-pre-wrap">{currentTopic.content}</p>
                    </div>
                </div>
            </div>

            {/* Replies Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
                </h2>

                {/* Create Reply */}
                {user && (
                    <div className="bg-charcoal-900/50 border border-charcoal-800 rounded-xl p-4">
                        <div className="flex gap-4">
                            <img
                                src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}&background=random`}
                                alt="Your avatar"
                                className="w-8 h-8 rounded-full bg-charcoal-700 object-cover flex-shrink-0"
                            />
                            <div className="flex-1 space-y-3">
                                <textarea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder="Write a reply..."
                                    className="w-full bg-charcoal-800 text-white placeholder-grey-600 border border-charcoal-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                    rows={3}
                                />

                                <div>
                                    <label className="block text-sm text-grey-400 mb-1">Code Snippet (optional)</label>
                                    <textarea
                                        value={codeSnippet}
                                        onChange={(e) => setCodeSnippet(e.target.value)}
                                        placeholder="Paste your code here..."
                                        className="w-full bg-charcoal-800 text-white placeholder-grey-600 border border-charcoal-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono text-sm"
                                        rows={4}
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        onClick={handleCreateReply}
                                        disabled={!replyContent.trim() || isSubmitting}
                                        className={clsx(
                                            "px-4 py-2 rounded-full font-bold text-sm transition-all duration-200",
                                            !replyContent.trim() || isSubmitting
                                                ? "bg-charcoal-800 text-grey-500 cursor-not-allowed"
                                                : "bg-primary-600 text-white hover:bg-primary-500"
                                        )}
                                    >
                                        {isSubmitting ? 'Posting...' : 'Post Reply'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Replies List */}
                <div className="space-y-4">
                    {replies.map(reply => (
                        <div key={reply.id} className="bg-charcoal-900/50 border border-charcoal-800 rounded-xl p-4">
                            <div className="flex gap-4">
                                <Link to={`/profile/${reply.user.username}`} className="flex-shrink-0">
                                    <img
                                        src={reply.user.avatar_url || `https://ui-avatars.com/api/?name=${reply.user.username}&background=random`}
                                        alt={reply.user.username}
                                        className="w-8 h-8 rounded-full bg-charcoal-700 object-cover"
                                    />
                                </Link>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2 text-sm flex-wrap">
                                            <Link to={`/profile/${reply.user.username}`} className="font-bold text-white hover:underline">
                                                {reply.user.display_name || reply.user.username}
                                            </Link>
                                            <span className="text-grey-500">@{reply.user.username}</span>
                                            <span className="text-grey-600">·</span>
                                            <span className="text-grey-500">
                                                {formatRelativeTime(reply.created_at)}
                                            </span>
                                        </div>
                                        {user?.id === reply.created_by && (
                                            <button
                                                onClick={() => deleteReply(reply.id)}
                                                className="text-grey-500 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-500/10"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    <p className="text-grey-200 mb-3 whitespace-pre-wrap">{reply.content}</p>

                                    {reply.code_snippet && (
                                        <div className="bg-black border border-charcoal-700 rounded-lg p-3 mb-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Code className="w-4 h-4 text-grey-400" />
                                                <span className="text-xs text-grey-400 font-mono">Code</span>
                                            </div>
                                            <pre className="text-sm text-grey-200 font-mono overflow-x-auto whitespace-pre-wrap">
                                                {reply.code_snippet}
                                            </pre>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4">
                                        <button className="flex items-center gap-2 group text-grey-500 hover:text-green-400 transition-colors">
                                            <div className="p-1 rounded-full group-hover:bg-green-400/10 transition-colors">
                                                <ChevronUp className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs">{reply.upvotes || 0}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {replies.length === 0 && (
                        <div className="text-center py-12 text-grey-500">
                            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="font-mono text-sm">NO REPLIES YET</p>
                            <p className="text-xs mt-2">Be the first to contribute to this discussion.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}