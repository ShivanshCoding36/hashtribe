import { Link } from 'react-router-dom';
import { Github, FileText, Heart } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-black border-t border-charcoal-800 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Footer Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
                    {/* Branding */}
                    <div>
                        <Link to="/" className="block">
                            <span className="text-lg font-bold text-white font-display">
                                HashTribe
                            </span>
                        </Link>
                        <p className="text-xs text-grey-600 mt-2">
                            A developer-first community and collaboration platform.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-xs font-bold text-grey-500 uppercase tracking-widest mb-4">
                            Resources
                        </h3>
                        <nav className="space-y-2">
                            <a
                                href="https://github.com/the-mayankjha/hashtribe"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-grey-400 hover:text-white transition-colors"
                            >
                                <Github className="w-4 h-4" />
                                GitHub
                            </a>
                            <Link
                                to="/"
                                className="text-sm text-grey-400 hover:text-white transition-colors block"
                            >
                                About HashTribe
                            </Link>
                            <a
                                href="https://github.com/the-mayankjha/hashtribe/blob/main/CONTRIBUTING.md"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-grey-400 hover:text-white transition-colors"
                            >
                                <Heart className="w-4 h-4" />
                                Contributing Guide
                            </a>
                        </nav>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-xs font-bold text-grey-500 uppercase tracking-widest mb-4">
                            Legal
                        </h3>
                        <nav className="space-y-2">
                            <a
                                href="/"
                                className="flex items-center gap-2 text-sm text-grey-400 hover:text-white transition-colors"
                            >
                                <FileText className="w-4 h-4" />
                                Privacy Policy
                            </a>
                            <a
                                href="/"
                                className="text-sm text-grey-400 hover:text-white transition-colors block"
                            >
                                Terms of Service
                            </a>
                        </nav>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-charcoal-800 pt-8">
                    {/* Copyright */}
                    <p className="text-xs text-grey-700 text-center">
                        © 2026 HashTribe Inc. All rights reserved.
                    </p>
                    <p className="text-[10px] text-grey-800 text-center mt-2">
                        A <span className="text-white font-bold">nFKs</span> Affiliate
                    </p>
                </div>
            </div>
        </footer>
    );
}
