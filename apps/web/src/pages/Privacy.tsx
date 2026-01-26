import React from 'react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-black text-zinc-400 p-8 leading-relaxed">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 border-b border-zinc-800 pb-6">
          <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
          <p className="text-sm mt-2 text-zinc-500 font-mono">HASH_VERSION: 2026.01.v1</p>
        </header>

        <section className="space-y-10">
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-3">01. Data Transmission</h2>
            <p>HashTribe analyzes public GitHub/GitLab activity to verify developer credibility. We do not store private source code. Only metadata (commit frequency, language distribution, and PR impact) is indexed to build your profile.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-3">02. Tribe Interaction</h2>
            <p>Your interactions within Tribes are visible to other Tribe members. Verified proof-based metrics are public by default to ensure transparency in our developer ecosystem.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-3">03. Security</h2>
            <p>All data is encrypted in transit and at rest. We utilize decentralized identity protocols where possible to give you full control over your developer persona.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Privacy;