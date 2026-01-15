import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Bell, Search, Plus, MessageSquare, UserCircle, LogOut, Settings } from 'lucide-react';

import logoDark from '@/components/assets/logo_dark_croped.png';

export function Header() {
    const { user, profile, signOut } = useAuthStore();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-black border-b border-charcoal-800 z-50 px-4 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center w-64">
                <Link to="/" className="flex items-center space-x-2 group">
                    <img
                        src={logoDark}
                        alt="HashTribe"
                        className="h-8 w-auto object-contain"
                    />
                    <span className="text-xl font-bold text-white tracking-tight hidden md:block">
                        HashTribe
                    </span>
                </Link>
            </div>

            {/* Center Search */}
            <div className="flex-1 max-w-2xl px-8 hidden md:block">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-grey-500 group-focus-within:text-white transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-4 py-2 bg-charcoal-900 border border-charcoal-700 rounded-xl text-white placeholder-grey-600 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-all font-mono text-sm"
                        placeholder="Search tribes, challenges, or users..."
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-2 md:space-x-4">
                {user ? (
                    <>
                        {/* Create Button */}
                        <Link
                            to="/tribes/create"
                            className="p-2 rounded-lg bg-white/10 text-white hover:bg-white hover:text-black transition-all duration-300 group"
                            title="Create New Tribe"
                        >
                            <Plus className="w-5 h-5" />
                        </Link>

                        {/* Messages */}
                        <button className="p-2 rounded-lg text-grey-400 hover:text-white hover:bg-charcoal-800 transition-colors relative">
                            <MessageSquare className="w-5 h-5" />
                        </button>

                        {/* Notifications */}
                        <div className="relative">
                            <button className="p-2 rounded-lg text-grey-400 hover:text-white hover:bg-charcoal-800 transition-colors">
                                <Bell className="w-5 h-5" />
                            </button>
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-black"></span>
                        </div>

                        {/* User Profile */}
                        <div className="relative group ml-2">
                            <div className="flex items-center space-x-2 cursor-pointer py-1">
                                <img
                                    src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${user.email || 'U'}&background=random`}
                                    alt={profile?.username || 'User'}
                                    className="w-9 h-9 rounded-full border border-charcoal-700 group-hover:border-white transition-colors object-cover"
                                />
                            </div>

                            {/* Dropdown Menu */}
                            <div className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-charcoal-900 border border-charcoal-800 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                                <div className="px-4 py-3 border-b border-charcoal-800 bg-charcoal-950/50">
                                    <p className="text-white font-bold text-sm truncate">
                                        {profile?.display_name || user.email?.split('@')[0]}
                                    </p>
                                    <p className="text-grey-500 text-xs truncate">{user.email}</p>
                                </div>
                                <div className="py-1">
                                    <Link to={`/profile/${profile?.username}`} className="flex items-center space-x-2 px-4 py-2.5 text-sm text-grey-200 hover:bg-charcoal-800 hover:text-white transition-colors">
                                        <UserCircle className="w-4 h-4" />
                                        <span>Profile</span>
                                    </Link>
                                    <Link to="/settings" className="flex items-center space-x-2 px-4 py-2.5 text-sm text-grey-200 hover:bg-charcoal-800 hover:text-white transition-colors">
                                        <Settings className="w-4 h-4" />
                                        <span>Settings</span>
                                    </Link>
                                    <div className="border-t border-charcoal-800 my-1"></div>
                                    <button onClick={handleSignOut} className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-left">
                                        <LogOut className="w-4 h-4" />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <Link to="/login" className="px-5 py-2 bg-white text-black text-sm font-bold rounded-lg hover:bg-grey-200 transition-colors">
                        Sign In
                    </Link>
                )}
            </div>
        </header>
    );
}
