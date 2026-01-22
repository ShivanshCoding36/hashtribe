import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { X } from 'lucide-react';
import clsx from 'clsx';

interface CreateTopicProps {
    onSubmit: (title: string, content: string) => Promise<void>;
    onCancel: () => void;
}

export function CreateTopic({ onSubmit, onCancel }: CreateTopicProps) {
    const { profile } = useAuthStore();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onSubmit(title.trim(), content.trim());
            setTitle('');
            setContent('');
            onCancel(); // Close the form after successful submission
        } catch (error) {
            console.error('Failed to create topic', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-black border border-charcoal-800 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-charcoal-800">
                <h3 className="text-white font-bold">Start a Discussion</h3>
                <button
                    onClick={onCancel}
                    className="text-grey-400 hover:text-white transition-colors p-1"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Form */}
            <div className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                    <img
                        src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.username || 'User'}&background=random`}
                        alt={profile?.username || 'User avatar'}
                        className="w-10 h-10 rounded-full bg-charcoal-700 object-cover"
                    />
                    <div className="text-sm text-grey-400">
                        <p className="font-bold text-white">{profile?.display_name || profile?.username || 'You'}</p>
                        <p className="text-xs">Starting a new discussion</p>
                    </div>
                </div>

                {/* Title Input */}
                <div>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Discussion title..."
                        className="w-full bg-charcoal-900 text-white placeholder-grey-600 border border-charcoal-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        maxLength={200}
                    />
                    <div className="text-xs text-grey-500 mt-1">{title.length}/200</div>
                </div>

                {/* Content Textarea */}
                <div>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Describe your question or topic..."
                        className="w-full bg-charcoal-900 text-white placeholder-grey-600 border border-charcoal-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none min-h-[120px]"
                        rows={4}
                        maxLength={2000}
                    />
                    <div className="text-xs text-grey-500 mt-1">{content.length}/2000</div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-grey-400 hover:text-white transition-colors"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!title.trim() || !content.trim() || isSubmitting}
                        className={clsx(
                            "px-6 py-2 rounded-full font-bold text-sm transition-all duration-200 flex items-center gap-2",
                            !title.trim() || !content.trim() || isSubmitting
                                ? "bg-charcoal-800 text-grey-500 cursor-not-allowed"
                                : "bg-primary-600 text-white hover:bg-primary-500"
                        )}
                    >
                        {isSubmitting ? 'Creating...' : 'Create Discussion'}
                    </button>
                </div>
            </div>
        </div>
    );
}