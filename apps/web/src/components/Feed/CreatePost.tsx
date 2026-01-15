import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Image, Smile } from 'lucide-react';
import clsx from 'clsx';

interface CreatePostProps {
    onSubmit: (content: string) => Promise<void>;
}

export function CreatePost({ onSubmit }: CreatePostProps) {
    const { user, profile } = useAuthStore();
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!content.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onSubmit(content);
            setContent('');
        } catch (error) {
            console.error('Failed to post', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex gap-4 p-4 border-b border-charcoal-800">
            <div className="flex-shrink-0">
                <img
                    src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${user?.email}&background=random`}
                    alt={profile?.username || 'User'}
                    className="w-10 h-10 rounded-full bg-charcoal-700 object-cover"
                />
            </div>
            <div className="flex-1">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What is happening in this protocol?"
                    className="w-full bg-transparent text-white placeholder-grey-600 text-lg border-none focus:ring-0 p-0 resize-none min-h-[50px] font-sans"
                    rows={2}
                />

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-charcoal-800/50">
                    <div className="flex items-center gap-2 text-primary-500">
                        <button className="p-2 rounded-full text-grey-400 hover:text-white hover:bg-charcoal-800 transition-colors">
                            <Image className="w-5 h-5" />
                        </button>
                        <button className="p-2 rounded-full text-grey-400 hover:text-white hover:bg-charcoal-800 transition-colors">
                            <Smile className="w-5 h-5" />
                        </button>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={!content.trim() || isSubmitting}
                        className={clsx(
                            "px-4 py-1.5 rounded-full font-bold text-sm transition-all duration-200 flex items-center gap-2",
                            !content.trim() || isSubmitting
                                ? "bg-charcoal-800 text-grey-500 cursor-not-allowed"
                                : "bg-white text-black hover:bg-grey-200"
                        )}
                    >
                        {isSubmitting ? 'Posting...' : 'Post'}
                    </button>
                </div>
            </div>
        </div>
    );
}
