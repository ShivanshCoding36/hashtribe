import { Link } from 'react-router-dom';

export function Hero() {
    return (
        <section className="pt-16 min-h-screen bg-gradient-to-r from-charcoal-900 to-black flex items-center">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-20 md:py-32">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    {/* Headline */}
                    <h1 className="text-4xl md:text-5xl font-bold text-white font-display tracking-tight">
                        Build Your Developer Credibility
                    </h1>

                    {/* Subheading */}
                    <p className="text-lg text-grey-400 font-mono max-w-2xl mx-auto">
                        Join communities, compete in challenges, and collaborate with developers worldwide. 
                        Prove your skills. Build your reputation. Shape the future of development.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Link
                            to="/signup"
                            className="px-8 py-3 text-sm font-bold text-black bg-white rounded-lg hover:bg-grey-100 transition-colors"
                        >
                            Get Started with GitHub
                        </Link>
                        <a
                            href="#features"
                            className="px-8 py-3 text-sm font-bold text-white border border-charcoal-700 rounded-lg hover:bg-charcoal-800 transition-colors inline-block"
                        >
                            Learn More
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
