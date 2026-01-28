import React from 'react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-black text-zinc-400 p-8 leading-relaxed">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 border-b border-zinc-800 pb-6">
          <h1 className="text-3xl font-bold text-white">User Terms & Conditions</h1>
          <p className="text-sm mt-2 text-zinc-500 font-mono">EFFECTIVE_DATE: JAN_2026</p>
        </header>

        <section className="space-y-10">
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-3">01. Verified Profiles</h2>
            <p>Users must not misrepresent their technical skills. Any attempt to use "proof-faking" scripts or AI-generated pull requests to inflate credibility scores may result in a permanent ban from the HashTribe network.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-3">02. Intellectual Property</h2>
            <p>Code submitted during HashTribe Challenges remains the property of the author unless stated otherwise. By joining a Tribe, you agree to the collaborative license agreements specific to that community.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-3">03. Platform Usage</h2>
            <p>HashTribe is a developer credibility platform. Spamming, harassment, or unauthorized "mining" of developer profiles is strictly prohibited.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Terms;