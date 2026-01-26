import { useEffect } from "react";
import { Link } from "react-router-dom";
import { usePostStore } from "@/stores/postStore";
import { useAuthStore } from "@/stores/authStore";
import { PostCard } from "@/components/Feed/PostCard";
import { Zap, Activity } from "lucide-react";

export function HomePage() {
  const { posts, loading, error, fetchFeed, toggleLike, deletePost } =
    usePostStore();

  const { user } = useAuthStore();

  useEffect(() => {
    fetchFeed(user?.id);
  }, [user?.id]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-charcoal-900 to-black p-6 rounded-2xl border border-charcoal-800 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 font-display">
            HOME FEED
          </h1>
          <p className="text-grey-400 text-sm font-mono">
            Transmission from all frequencies
          </p>
        </div>
        <div className="p-3 bg-charcoal-800 rounded-full">
          <Activity className="w-6 h-6 text-primary-400" />
        </div>
      </div>

      <div className="bg-black border border-charcoal-800 rounded-xl overflow-hidden min-h-[300px]">
        {loading && posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-charcoal-600 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-grey-500 text-sm font-mono animate-pulse">
              Scanning frequencies...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-20 px-4">
            <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-red-400 font-bold mb-2">Transmission Error</h3>
            <p className="text-grey-400 text-sm max-w-md mx-auto">{error}</p>
          </div>
        ) : posts.length > 0 ? (
          <div>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={(id) => toggleLike(id, user?.id || "")}
                onDelete={deletePost}
                showTribe={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-4">
            <div className="w-16 h-16 bg-charcoal-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-grey-600" />
            </div>
            <h3 className="text-white font-bold mb-2">No Signal Detected</h3>
            <p className="text-grey-400 text-sm max-w-md mx-auto mb-6">
              The feed is currently silent. Explore tribes to find active
              frequencies or start your own transmission.
            </p>
            <Link to="/tribes" className="btn-primary inline-block">
              Explore Tribes
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
