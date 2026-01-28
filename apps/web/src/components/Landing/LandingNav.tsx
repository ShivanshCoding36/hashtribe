import { Link } from 'react-router-dom';

export function LandingNav() {
    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-black border-b border-charcoal-800 z-50">
            <nav className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between max-w-7xl mx-auto w-full">
                {/* Logo */}
                <Link to="/" className="flex items-center">
                    <span className="text-xl font-bold text-white tracking-tight font-display">
                        HashTribe
                    </span>
                </Link>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <Link
                        to="/login"
                        className="px-4 py-2 text-sm font-medium text-grey-300 hover:text-white transition-colors"
                    >
                        Login
                    </Link>
                    <Link
                        to="/signup"
                        className="px-6 py-2 text-sm font-bold text-black bg-white rounded-lg hover:bg-grey-100 transition-colors"
                    >
                        Get Started
                    </Link>
                </div>
            </nav>
        </header>
    );
}
