import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import clsx from 'clsx';

export function Navbar() {
    const { user, profile, signOut } = useAuthStore();
    const location = useLocation();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-charcoal-800">
            <div className="container-custom">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">#</span>
                        </div>
                        <span className="text-xl font-bold text-gradient">HashTribe</span>
                    </Link>

                    {/* Navigation Links */}
                    {user && (
                        <div className="hidden md:flex items-center space-x-1">
                            <Link
                                to="/tribes"
                                className={clsx(
                                    'px-4 py-2 rounded-lg font-medium transition-colors',
                                    isActive('/tribes')
                                        ? 'bg-charcoal-800 text-white'
                                        : 'text-grey-400 hover:text-white hover:bg-charcoal-800/50'
                                )}
                            >
                                Tribes
                            </Link>
                            <Link
                                to="/competitions"
                                className={clsx(
                                    'px-4 py-2 rounded-lg font-medium transition-colors',
                                    isActive('/competitions')
                                        ? 'bg-charcoal-800 text-white'
                                        : 'text-grey-400 hover:text-white hover:bg-charcoal-800/50'
                                )}
                            >
                                Competitions
                            </Link>
                            <Link
                                to="/leaderboard"
                                className={clsx(
                                    'px-4 py-2 rounded-lg font-medium transition-colors',
                                    isActive('/leaderboard')
                                        ? 'bg-charcoal-800 text-white'
                                        : 'text-grey-400 hover:text-white hover:bg-charcoal-800/50'
                                )}
                            >
                                Leaderboard
                            </Link>
                        </div>
                    )}

                    {/* User Menu */}
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <Link
                                    to={profile ? `/profile/${profile.username}` : '#'}
                                    className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                                >
                                    <img
                                        src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${user.email || 'User'}&background=random`}
                                        alt={profile?.username || 'User'}
                                        className="w-8 h-8 rounded-full border-2 border-charcoal-700"
                                    />
                                    <span className="hidden md:block text-sm font-medium text-grey-200">
                                        {profile?.display_name || profile?.username || user.email?.split('@')[0] || 'User'}
                                    </span>
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="btn-ghost text-sm text-grey-400 hover:text-white transition-colors"
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-grey-200 transition-colors">
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
