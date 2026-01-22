import { useEffect, useState } from 'react';
import { PlusCircle, Sparkles } from 'lucide-react';
import { useCompetitionStore } from '@/stores/competitionStore';
import { useAuthStore } from '@/stores/authStore';
import { CompetitionCard } from '@/components/Competitions/CompetitionCard';
import { CreateCompetitionModal } from '@/components/Competitions/CreateCompetitionModal';

export function CompetitionsPage() {
    const { competitions, loading, fetchCompetitions, createCompetition } = useCompetitionStore();
    const { user } = useAuthStore();
    const [showCreate, setShowCreate] = useState(false);

    useEffect(() => {
        fetchCompetitions();
    }, [fetchCompetitions]);

    const handleCreate = async (payload: { title: string; description: string; difficulty: any; start_time: string; end_time: string; }) => {
        if (!user) return;
        await createCompetition({ ...payload, userId: user.id });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-xs text-primary-300 uppercase tracking-[0.2em] flex items-center gap-2"><Sparkles className="w-4 h-4" /> Competition #13</p>
                    <h1 className="text-3xl font-bold text-white mt-2">Challenge developers and showcase coding skills</h1>
                    <p className="text-grey-400 text-sm mt-1">Time-boxed challenges to test problem solving, collaboration, and shipping velocity.</p>
                </div>
                {user && (
                    <button
                        onClick={() => setShowCreate(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-600 text-white font-bold text-sm hover:bg-primary-500 transition-colors"
                    >
                        <PlusCircle className="w-4 h-4" /> Launch a competition
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {loading && competitions.length === 0 && (
                    <div className="col-span-full text-center py-12 text-grey-500">Loading competitions...</div>
                )}
                {!loading && competitions.length === 0 && (
                    <div className="col-span-full text-center py-12 text-grey-500">
                        No competitions yet. Be the first to launch a challenge.
                    </div>
                )}
                {competitions.map(c => (
                    <CompetitionCard key={c.id} competition={c} />
                ))}
            </div>

            {showCreate && (
                <CreateCompetitionModal
                    onClose={() => setShowCreate(false)}
                    onCreate={handleCreate}
                />
            )}
        </div>
    );
}
