import { CheckCircle, Users, Zap } from 'lucide-react';

export function WhyHashTribe() {
    const pillars = [
        {
            icon: <CheckCircle className="w-8 h-8 text-white" />,
            title: 'Verified & Credible',
            description: 'Proof-based profiles linked to GitHub showcasing your real contributions and achievements.'
        },
        {
            icon: <Users className="w-8 h-8 text-white" />,
            title: 'Community-Driven',
            description: 'Join niche developer communities around shared interests, technologies, and goals.'
        },
        {
            icon: <Zap className="w-8 h-8 text-white" />,
            title: 'Competitive',
            description: 'Benchmark your skills with coding challenges and climb the global rankings.'
        }
    ];

    return (
        <section className="bg-charcoal-900 border-b border-charcoal-800 py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Section Title */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white font-display tracking-tight">
                        Built for Developers, By Developers
                    </h2>
                </div>

                {/* Value Pillars Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {pillars.map((pillar, index) => (
                        <div key={index} className="flex flex-col items-center text-center space-y-4">
                            {/* Icon */}
                            <div className="w-12 h-12 rounded-full bg-charcoal-800 flex items-center justify-center">
                                {pillar.icon}
                            </div>

                            {/* Title */}
                            <h3 className="text-lg font-bold text-white font-display">
                                {pillar.title}
                            </h3>

                            {/* Description */}
                            <p className="text-sm text-grey-400">
                                {pillar.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
