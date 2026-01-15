import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTribeStore } from '@/stores/tribeStore';
import { AlertCircle } from 'lucide-react';

export function CreateTribePage() {
    const navigate = useNavigate();
    const { createTribe } = useTribeStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        visibility: 'public' as 'public' | 'private',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const tribe = await createTribe(formData);
            navigate(`/tribes/${tribe.slug}`);
        } catch (err: any) {
            console.error('Error creating tribe:', err);
            setError(err.message || 'Failed to create tribe. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-white mb-2 font-display">Create a Tribe</h1>
                <p className="text-grey-400 font-mono text-sm">
                    Start a new community for developers to collaborate
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-8 space-y-6 shadow-xl">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-red-200">
                            <p className="font-bold text-red-100">Creation Failed</p>
                            <p>{error}</p>
                        </div>
                    </div>
                )}

                <div>
                    <label htmlFor="name" className="block text-sm font-bold text-grey-300 mb-2 uppercase tracking-wider">
                        Tribe Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., React Developers"
                        className="w-full bg-black border border-charcoal-700 rounded-xl px-4 py-3 text-white placeholder-grey-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all font-mono"
                        maxLength={50}
                    />
                    <p className="text-xs text-grey-500 mt-2 font-mono">
                        Choose a clear, descriptive name for your tribe
                    </p>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-bold text-grey-300 mb-2 uppercase tracking-wider">
                        Description
                    </label>
                    <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="What is this tribe about?"
                        className="w-full bg-black border border-charcoal-700 rounded-xl px-4 py-3 text-white placeholder-grey-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all font-sans min-h-[120px]"
                        rows={4}
                        maxLength={500}
                    />
                    <div className="flex justify-end mt-2">
                        <p className="text-xs text-grey-500 font-mono">
                            {formData.description.length}/500
                        </p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-grey-300 mb-4 uppercase tracking-wider">
                        Visibility <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className={`cursor-pointer border rounded-xl p-4 transition-all ${formData.visibility === 'public' ? 'bg-white/5 border-white' : 'bg-black border-charcoal-700 hover:border-grey-500'}`}>
                            <div className="flex items-start space-x-3">
                                <input
                                    type="radio"
                                    name="visibility"
                                    value="public"
                                    checked={formData.visibility === 'public'}
                                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value as 'public' })}
                                    className="mt-1"
                                />
                                <div>
                                    <div className="font-bold text-white mb-1">Public</div>
                                    <div className="text-xs text-grey-400">
                                        Anyone can discover and join this tribe. Visible on the Explore page.
                                    </div>
                                </div>
                            </div>
                        </label>
                        <label className={`cursor-pointer border rounded-xl p-4 transition-all ${formData.visibility === 'private' ? 'bg-white/5 border-white' : 'bg-black border-charcoal-700 hover:border-grey-500'}`}>
                            <div className="flex items-start space-x-3">
                                <input
                                    type="radio"
                                    name="visibility"
                                    value="private"
                                    checked={formData.visibility === 'private'}
                                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value as 'private' })}
                                    className="mt-1"
                                />
                                <div>
                                    <div className="font-bold text-white mb-1">Private</div>
                                    <div className="text-xs text-grey-400">
                                        Only members can see and access this tribe. Invite only.
                                    </div>
                                </div>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-charcoal-800">
                    <button
                        type="button"
                        onClick={() => navigate('/tribes')}
                        className="flex-1 px-6 py-3 rounded-xl font-bold text-grey-400 hover:text-white hover:bg-black border border-transparent hover:border-charcoal-700 transition-all font-mono uppercase tracking-wider"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !formData.name}
                        className={`flex-1 px-6 py-3 rounded-xl font-bold text-black font-mono uppercase tracking-wider transition-all shadow-glow ${loading || !formData.name ? 'bg-grey-600 cursor-not-allowed' : 'bg-white hover:bg-grey-200'}`}
                    >
                        {loading ? 'Creating...' : 'Confirm Creation'}
                    </button>
                </div>
            </form>
        </div>
    );
}
