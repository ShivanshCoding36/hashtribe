import { LandingNav } from '@/components/Landing/LandingNav';
import { Hero } from '@/components/Landing/Hero';
import { Features } from '@/components/Landing/Features';
import { WhyHashTribe } from '@/components/Landing/WhyHashTribe';
import { CtaSection } from '@/components/Landing/CtaSection';
import { Footer } from '@/components/Landing/Footer';

export function LandingPage() {
    return (
        <div>
            <LandingNav />
            <Hero />
            <Features />
            <WhyHashTribe />
            <CtaSection />
            <Footer />
        </div>
    );
}
