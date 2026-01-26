import { NavLink } from 'react-router-dom';
import { Home, Compass, Trophy, LayoutGrid, ChevronDown, Plus, Info, Shield, FileText, Briefcase } from 'lucide-react';
import { useTribeStore } from '@/stores/tribeStore';
import { useAuthStore } from '@/stores/authStore';
import { useState } from 'react';
import clsx from 'clsx';

export function Sidebar() {
    const { tribes } = useTribeStore();
    const { user } = useAuthStore();
    const [isMyTribesOpen, setIsMyTribesOpen] = useState(true);

    // Filter for tribes the user has joined
    const myTribes = tribes.filter(t => t.is_member).slice(0, 5); 

    return (
        <aside className="fixed left-0 top-16 bottom-0 w-64 bg-black border-r border-charcoal-800 overflow-y-auto hidden md:flex flex-col z-40">
            {/* Main Navigation */}
            <div className="p-4 space-y-1 border-b border-charcoal-800">
                <NavItem to="/" icon={<Home className="w-5 h-5" />} label="Home" />
                <NavItem to="/tribes" icon={<Compass className="w-5 h-5" />} label="Explore Tribes" />
                <NavItem to="/competitions" icon={<Trophy className="w-5 h-5" />} label="Challenges" />
                <NavItem to="/leaderboard" icon={<LayoutGrid className="w-5 h-5" />} label="Leaderboard" />
            </div>

            {/* My Tribes Section */}
            {user && (
                <div className="p-4 border-b border-charcoal-800">
                    <button
                        onClick={() => setIsMyTribesOpen(!isMyTribesOpen)}
                        className="flex items-center justify-between w-full text-grey-400 hover:text-white mb-2 uppercase text-xs font-bold tracking-wider"
                    >
                        <span>My Tribes</span>
                        <ChevronDown className={clsx("w-4 h-4 transition-transform", !isMyTribesOpen && "-rotate-90")} />
                    </button>

                    {isMyTribesOpen && (
                        <div className="space-y-1">
                            <NavLink
                                to="/tribes/create"
                                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-grey-400 hover:bg-charcoal-900 hover:text-white transition-colors group"
                            >
                                <Plus className="w-5 h-5 group-hover:text-white" />
                                <span className="text-sm">Create Tribe</span>
                            </NavLink>

                            {myTribes.length > 0 ? (
                                myTribes.map(tribe => (
                                    <NavLink
                                        key={tribe.id}
                                        to={`/tribes/${tribe.slug}`}
                                        className={({ isActive }) => clsx(
                                            "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors group",
                                            isActive ? "bg-charcoal-800 text-white" : "text-grey-400 hover:bg-charcoal-900 hover:text-white"
                                        )}
                                    >
                                        <div className="w-5 h-5 rounded-full bg-charcoal-700 flex-shrink-0 border border-charcoal-600 group-hover:border-white/50">
                                            <div className="w-full h-full rounded-full bg-gradient-to-br from-charcoal-600 to-black"></div>
                                        </div>
                                        <span className="text-sm truncate">{tribe.name}</span>
                                    </NavLink>
                                ))
                            ) : (
                                <p className="px-3 py-2 text-xs text-grey-600">No tribes joined yet.</p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Resources / Footer Section */}
            <div className="p-4 mt-auto">
                <div className="space-y-1">
                    <h3 className="text-xs font-bold text-grey-500 uppercase tracking-wider mb-2 px-3">Resources</h3>
                    
                    <LinkItem 
                        label="About HashTribe" 
                        icon={<Info className="w-4 h-4" />} 
                        path="/about" 
                    />
                    <LinkItem 
                        label="Careers" 
                        icon={<Briefcase className="w-4 h-4" />} 
                        path="/careers" 
                    />
                    <LinkItem 
                        label="Privacy Policy" 
                        icon={<Shield className="w-4 h-4" />} 
                        path="/privacy" 
                    />
                    <LinkItem 
                        label="User Terms" 
                        icon={<FileText className="w-4 h-4" />} 
                        path="/terms" 
                    />

                    <div className="pt-4 px-3">
                        <p className="text-xs text-grey-600">
                            A <span className="text-white font-bold">nFKs</span> Affiliate
                        </p>
                        <p className="text-[10px] text-grey-700 mt-1">
                            © 2026 HashTribe Inc. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
}

// --- Helper Components ---

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => clsx(
                "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                isActive ? "bg-charcoal-800 text-white font-medium shadow-glow-sm" : "text-grey-400 hover:bg-charcoal-900 hover:text-white"
            )}
        >
            {icon}
            <span className="text-[15px]">{label}</span>
        </NavLink>
    );
}

/** * UPDATED LINKITEM 
 * Fixed the TypeScript interface and added the 'path' prop 
 */
function LinkItem({ label, icon, path }: { label: string; icon: React.ReactNode; path: string }) {
    return (
        <NavLink 
            to={path} 
            className={({ isActive }) => clsx(
                "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-sm",
                isActive ? "text-white bg-charcoal-900" : "text-grey-500 hover:text-white hover:bg-charcoal-900"
            )}
        >
            {icon}
            <span>{label}</span>
        </NavLink>
    );
}