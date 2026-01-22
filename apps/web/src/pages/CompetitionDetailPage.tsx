import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, CalendarDays, Clock3, Flame } from 'lucide-react';
import { useCompetitionStore } from '@/stores/competitionStore';
import { formatRelativeTime } from '@hashtribe/shared/utils';

export function CompetitionDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const { currentCompetition, loading, fetchCompetitionBySlug } = useCompetitionStore();

    useEffect(() => {
        if (slug) fetchCompetitionBySlug(slug);
    }, [slug, fetchCompetitionBySlug]);

    if (loading) {
        return (
            <div className="text-center py-20">
                <div className="w-12 h-12 border-4 border-charcoal-600 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            </div>
        );
    }

    if (!currentCompetition) {
        return (
            <div className="space-y-4">
                <Link to="/competitions" className="inline-flex items-center gap-2 text-grey-400 hover:text-white">
                    <ArrowLeft className="w-4 h-4" /> Back to competitions
                </Link>
                <div className="bg-black border border-charcoal-800 rounded-2xl p-6 flex items-center gap-3 text-grey-300">
                    <AlertTriangle className="w-5 h-5 text-amber-300" />
                    Competition not found.
                </div>
            </div>
        );
    }

    const competition = currentCompetition;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 text-grey-400 text-sm">
                <Link to="/competitions" className="inline-flex items-center gap-2 hover:text-white">
                    <ArrowLeft className="w-4 h-4" /> Back to competitions
                </Link>
            </div>

            <div className="bg-black border border-charcoal-800 rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                        <p className="text-xs text-primary-300 uppercase tracking-[0.2em]">Competition #13</p>
                        <h1 className="text-3xl font-bold text-white mt-1">{competition.title}</h1>
                        <p className="text-grey-400 mt-2 max-w-3xl">{competition.description}</p>
                    </div>
                    <div className="text-right text-grey-400 text-sm">
                        <div className="flex items-center gap-2 justify-end">
                            <Flame className="w-4 h-4 text-amber-300" />
                            {competition.participant_count ?? 0} participants
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-grey-300">
                    <span className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4" /> Starts {formatRelativeTime(competition.start_time)}
                    </span>
                    <span className="flex items-center gap-2">
                        <Clock3 className="w-4 h-4" /> Ends {formatRelativeTime(competition.end_time)}
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-charcoal-900 border border-charcoal-700 text-primary-200 text-xs font-bold uppercase">{competition.status}</span>
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-charcoal-900 border border-charcoal-700 text-grey-200 text-xs font-bold uppercase">{competition.difficulty}</span>
                    </span>
                </div>
            </div>
        </div>
    );
}
