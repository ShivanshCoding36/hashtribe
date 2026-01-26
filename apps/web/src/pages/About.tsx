import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-black text-zinc-300 p-8 leading-relaxed font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Hero Section */}
        <section className="mt-12 mb-20">
          <h1 className="text-5xl font-extrabold text-white mb-6 tracking-tight">
            The New Standard of <span className="text-zinc-500">Credibility.</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl border-l-2 border-zinc-800 pl-6">
            HashTribe is a DevCom (Developer Community) platform designed to eliminate the noise of traditional hiring. 
            We believe that a developer's worth is found in their code, not their credentials.
          </p>
        </section>

        {/* The Problem & Solution Grid */}
        <section className="grid md:grid-cols-2 gap-12 mb-20">
          <div className="space-y-4">
            <h2 className="text-zinc-500 font-mono text-xs uppercase tracking-[0.2em]">The Problem</h2>
            <h3 className="text-2xl font-bold text-white">Resumes are broken.</h3>
            <p className="text-zinc-400">
              Traditional profiles are static, easily inflated, and fail to capture the nuance of real-world collaboration. 
              The industry lacks a verifiable way to measure impact, consistency, and skill.
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="text-zinc-500 font-mono text-xs uppercase tracking-[0.2em]">The Solution</h2>
            <h3 className="text-2xl font-bold text-white">Proof over promises.</h3>
            <p className="text-zinc-400">
              HashTribe builds <span className="text-white">Proof-Based Profiles</span>. By integrating with version control 
              and hosting real-world challenges, we create a transparent record of a developer's technical journey.
            </p>
          </div>
        </section>

        {/* Core Pillars */}
        <section className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-10 mb-20">
          <h2 className="text-3xl font-bold text-white mb-10 text-center">Core Pillars</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-12 w-12 bg-white text-black flex items-center justify-center rounded-lg mx-auto mb-4 font-bold">01</div>
              <h4 className="text-white font-bold mb-2">Tribes</h4>
              <p className="text-sm text-zinc-500">Join specialized communities based on tech stacks to collaborate and grow.</p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 bg-white text-black flex items-center justify-center rounded-lg mx-auto mb-4 font-bold">02</div>
              <h4 className="text-white font-bold mb-2">Challenges</h4>
              <p className="text-sm text-zinc-500">Compete in proof-based coding tasks that build your verifiable reputation.</p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 bg-white text-black flex items-center justify-center rounded-lg mx-auto mb-4 font-bold">03</div>
              <h4 className="text-white font-bold mb-2">Collaboration</h4>
              <p className="text-sm text-zinc-500">Find partners for real-world projects and build production-ready software.</p>
            </div>
          </div>
        </section>

        {/* Footer Note */}
        <footer className="text-center border-t border-zinc-900 pt-12">
          <p className="text-zinc-500 font-mono text-sm">A nFKs Affiliate Project. Est. 2026.</p>
        </footer>
      </div>
    </div>
  );
};

export default About;