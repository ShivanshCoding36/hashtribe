import { Link } from 'react-router-dom';
import { CalendarDays, Clock3, Flame } from 'lucide-react';
import { formatRelativeTime } from '@hashtribe/shared/utils';
import type { Competition } from '@hashtribe/shared/types';
import clsx from 'clsx';

interface CompetitionCardProps {
    competition: Competition;
}

const difficultyColors: Record<Competition['difficulty'], string> = {
    easy: 'bg-green-500/15 text-green-300 border border-green-500/40',
    medium: 'bg-amber-500/15 text-amber-300 border border-amber-500/40',
    hard: 'bg-red-500/15 text-red-300 border border-red-500/40',
};

const statusColors: Record<Competition['status'], string> = {
    draft: 'bg-grey-800 text-grey-300 border border-grey-700',
    upcoming: 'bg-primary-600/15 text-primary-200 border border-primary-600/40',
    live: 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/40',
    ended: 'bg-charcoal-800 text-grey-300 border border-charcoal-700',
};

export function CompetitionCard({ competition }: CompetitionCardProps) {
    const statusText = competition.status === 'live' ? 'Live Now' : competition.status;

    return (
        <Link
            to={`/competitions/${competition.slug}`}
            className="block bg-black border border-charcoal-800 rounded-xl p-4 hover:border-primary-600/60 hover:shadow-glow-sm transition-colors"
        >
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                    <div className={clsx('px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide', statusColors[competition.status])}>
                        {statusText}
                    </div>
                    <div className={clsx('px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide', difficultyColors[competition.difficulty])}>
                        {competition.difficulty}
                    </div>
                </div>
                <div className="flex items-center gap-1 text-amber-300 text-xs font-mono">
                    <Flame className="w-4 h-4" />
                    {competition.participant_count ?? 0} joined
                </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{competition.title}</h3>
            <p className="text-grey-400 text-sm line-clamp-2 mb-4">{competition.description}</p>

            <div className="flex flex-wrap gap-4 text-xs text-grey-500 font-mono">
                <span className="flex items-center gap-1">
                    <CalendarDays className="w-4 h-4" />
                    Starts {formatRelativeTime(competition.start_time)}
                </span>
                <span className="flex items-center gap-1">
                    <Clock3 className="w-4 h-4" />
                    Ends {formatRelativeTime(competition.end_time)}
                </span>
            </div>
        </Link>
    );
}
