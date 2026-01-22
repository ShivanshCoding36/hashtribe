import { useState } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';
import type { CompetitionDifficulty } from '@hashtribe/shared/types';

interface CreateCompetitionModalProps {
    onClose: () => void;
    onCreate: (payload: {
        title: string;
        description: string;
        difficulty: CompetitionDifficulty;
        start_time: string;
        end_time: string;
    }) => Promise<void>;
}

export function CreateCompetitionModal({ onClose, onCreate }: CreateCompetitionModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [difficulty, setDifficulty] = useState<CompetitionDifficulty>('medium');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const isValid = title.trim() && description.trim() && startTime && endTime;

    const handleSubmit = async () => {
        if (!isValid || submitting) return;
        setSubmitting(true);
        try {
            await onCreate({
                title: title.trim(),
                description: description.trim(),
                difficulty,
                start_time: startTime,
                end_time: endTime,
            });
            onClose();
        } catch (err) {
            console.error('Failed to create competition', err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-charcoal-950 border border-charcoal-800 rounded-2xl w-full max-w-2xl shadow-2xl">
                <div className="flex items-center justify-between px-5 py-4 border-b border-charcoal-800">
                    <div>
                        <h3 className="text-white font-bold text-lg">Launch a Challenge</h3>
                        <p className="text-grey-500 text-sm">Challenge developers and showcase coding skills.</p>
                    </div>
                    <button onClick={onClose} className="text-grey-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    <div>
                        <label className="block text-xs text-grey-500 mb-1">Title</label>
                        <input
                            className="w-full bg-charcoal-900 text-white border border-charcoal-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-600"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Algo Rush 30: Arrays & DP"
                            maxLength={120}
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-grey-500 mb-1">Description</label>
                        <textarea
                            className="w-full bg-charcoal-900 text-white border border-charcoal-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-600 resize-none"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What’s the challenge, constraints, and goal?"
                            rows={4}
                            maxLength={800}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-grey-500 mb-1">Start Time</label>
                            <input
                                type="datetime-local"
                                className="w-full bg-charcoal-900 text-white border border-charcoal-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-600"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-grey-500 mb-1">End Time</label>
                            <input
                                type="datetime-local"
                                className="w-full bg-charcoal-900 text-white border border-charcoal-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-600"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-grey-500 mb-2">Difficulty</label>
                        <div className="flex gap-3">
                            {(['easy', 'medium', 'hard'] as CompetitionDifficulty[]).map(level => (
                                <button
                                    key={level}
                                    onClick={() => setDifficulty(level)}
                                    className={clsx(
                                        'px-4 py-2 rounded-full text-sm font-bold border transition-colors',
                                        difficulty === level
                                            ? 'bg-primary-600 text-white border-primary-500'
                                            : 'bg-charcoal-900 text-grey-300 border-charcoal-700 hover:border-primary-600/60'
                                    )}
                                    type="button"
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-charcoal-800">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-grey-400 hover:text-white transition-colors"
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!isValid || submitting}
                        className={clsx(
                            'px-6 py-2 rounded-full font-bold text-sm transition-colors',
                            !isValid || submitting
                                ? 'bg-charcoal-800 text-grey-500 cursor-not-allowed'
                                : 'bg-primary-600 text-white hover:bg-primary-500'
                        )}
                    >
                        {submitting ? 'Launching...' : 'Create Competition'}
                    </button>
                </div>
            </div>
        </div>
    );
}
