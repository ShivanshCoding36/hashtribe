import { Link } from 'react-router-dom';

export function CtaSection() {
    return (
        <section className="bg-gradient-to-r from-charcoal-900 to-black py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center space-y-8">
                {/* Headline */}
                <h2 className="text-2xl md:text-3xl font-bold text-white font-display">
                    Ready to Join the Developer Community?
                </h2>

                {/* Subtext */}
                <p className="text-grey-400 text-sm md:text-base">
                    Start building your credibility, connect with developers, and grow your skills today.
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

                {/* Badge */}
                <p className="text-xs text-grey-600 pt-2">
                    Free to join • No credit card required
                </p>
            </div>
        </section>
    );
}
