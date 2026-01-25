import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTribeStore } from "@/stores/tribeStore";
import { useAuthStore } from "@/stores/authStore";
import { TribeCard } from "@/components/TribeCard";
import clsx from "clsx";

export function TribesPage() {
  const { tribes, loading, error, fetchTribes, joinTribe, leaveTribe } =
    useTribeStore();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<"popular" | "new" | "featured" | "all">(
    "all",
  );
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchTribes(user?.id);
  }, [user?.id, fetchTribes]);

  const filteredTribes = [...tribes].sort((a, b) => {
    switch (filter) {
      case "popular":
      case "featured":
        return (b.member_count || 0) - (a.member_count || 0);
      case "new":
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      default:
        return 0;
    }
  });

  const handleJoinLeave = async (tribeId: string, isMember: boolean) => {
    if (!user) return;

    setActionLoading(tribeId); // 👈 start loading for this tribe

    try {
        if (isMember) {
            await leaveTribe(tribeId, user.id);
        } else {
            await joinTribe(tribeId, user.id);
        }
    } catch (err) {
        console.error('Error joining/leaving tribe:', err);
    } finally {
        setActionLoading(null); // 👈 stop loading
    }
};


  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-charcoal-800 pb-8">
        <div>
          <h2 className="text-xs font-mono text-grey-500 mb-2 tracking-widest uppercase">
            Available Protocols
          </h2>
          <h1 className="text-3xl md:text-4xl font-bold text-white font-display tracking-tight flex items-center">
            DISCOVER_TRIBES<span className="animate-pulse text-white">_</span>
          </h1>
        </div>

        {/* Filters */}
        <div className="flex bg-charcoal-900 p-1 rounded-full border border-charcoal-800 overflow-x-auto max-w-full">
          {(["popular", "new", "featured", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                "px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap",
                filter === f
                  ? "bg-white text-black shadow-glow-sm"
                  : "text-grey-400 hover:text-white hover:bg-charcoal-800",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 border-4 border-charcoal-700 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-grey-400 font-mono animate-pulse">
            SCANNING FREQUENCIES...
          </p>
        </div>
      ) : error ? (
        <div className="text-center py-20 border border-red-900/30 rounded-3xl bg-red-900/10">
          <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl text-red-400">⚠️</span>
          </div>
          <p className="text-xl text-red-400 font-bold mb-2">
            TRANSMISSION ERROR
          </p>
          <p className="text-grey-400 font-mono max-w-md mx-auto mb-6">
            {error}
          </p>

          <button
            onClick={() => fetchTribes(user?.id)}
            className="px-6 py-2 bg-red-500/20 text-red-400 rounded-full font-mono text-xs uppercase tracking-wider hover:bg-red-500/30 transition"
          >
            Retry Scan
          </button>
        </div>
      ) : filteredTribes.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-charcoal-800 rounded-3xl bg-charcoal-900/30">
          <div className="w-16 h-16 bg-charcoal-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">📡</span>
          </div>
          <p className="text-2xl text-white font-bold mb-2">
            NO SIGNALS DETECTED
          </p>
          <p className="text-grey-500 font-mono mb-8 max-w-md mx-auto">
            The spectrum is currently silent. Be the first to initiate a new
            protocol transmission.
          </p>
          <Link
            to="/tribes/create"
            className="inline-flex items-center justify-center px-8 py-3 bg-white text-black font-bold uppercase tracking-wider rounded-full hover:bg-grey-200 transition-colors"
          >
            Create Transmission
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
          {filteredTribes.map((tribe) => (
            <TribeCard
              key={tribe.id}
              tribe={tribe}
              onJoinLeave={handleJoinLeave}
              disabled={loading}
            />
          ))}

          {/* Create Tribe Card */}
          <Link
            to="/tribes/create"
            className="group border-2 border-dashed border-charcoal-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center hover:border-white/50 hover:bg-charcoal-900/50 transition-all duration-300 min-h-[300px]"
          >
            <div className="w-16 h-16 rounded-full bg-charcoal-800 group-hover:bg-white/10 flex items-center justify-center mb-6 transition-colors">
              <span className="text-4xl text-grey-500 group-hover:text-white transition-colors">
                +
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              INITIATE NEW PROTOCOL
            </h3>
            <p className="text-grey-500 text-sm font-mono">
              Create a new tribe
            </p>
          </Link>
        </div>
      )}
    </div>
  );
}
