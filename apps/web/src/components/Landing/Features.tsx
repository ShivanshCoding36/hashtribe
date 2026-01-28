import { Users, Trophy, User, Zap } from 'lucide-react';

export function Features() {
    const features = [
        {
            icon: <Users className="w-8 h-8 text-white" />,
            title: 'Create & Join Tribes',
            description: 'Form or join communities around shared interests, technologies, and projects.'
        },
        {
            icon: <Trophy className="w-8 h-8 text-white" />,
            title: 'Compete in Challenges',
            description: 'Test your skills against developers worldwide and climb the leaderboards.'
        },
        {
            icon: <User className="w-8 h-8 text-white" />,
            title: 'Build Your Profile',
            description: 'Auto-synced profile linked to GitHub showcasing your work and contributions.'
        },
        {
            icon: <Zap className="w-8 h-8 text-white" />,
            title: 'Collaborate & Learn',
            description: 'Work on projects, discuss solutions, and grow together with the community.'
        }
    ];

    return (
        <section
            id="features"
            className="bg-black border-b border-charcoal-800 py-20 px-4 sm:px-6 lg:px-8"
        >
            <div className="max-w-7xl mx-auto">
                {/* Section Title */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white font-display tracking-tight">
                        What You Can Do
                    </h2>
                </div>

                {/* Feature Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-charcoal-900 border border-charcoal-800 rounded-xl p-6 transition-all duration-300 hover:border-grey-500 hover:shadow-glow"
                        >
                            {/* Icon */}
                            <div className="w-12 h-12 rounded-full bg-charcoal-800 flex items-center justify-center">
                                {feature.icon}
                            </div>

                            {/* Title */}
                            <h3 className="text-lg font-bold text-white mt-4 font-display">
                                {feature.title}
                            </h3>

                            {/* Description */}
                            <p className="text-sm text-grey-400 mt-2">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
