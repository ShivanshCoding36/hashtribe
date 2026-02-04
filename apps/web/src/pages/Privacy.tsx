const Privacy = () => {
  return (
    <div className="min-h-screen bg-black text-zinc-400 p-8 leading-relaxed">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 border-b border-zinc-800 pb-6">
          <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
          <p className="text-sm mt-2 text-zinc-500 font-mono">
            HASH_VERSION: 2026.01.v3
          </p>
        </header>

        <section className="space-y-12">
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-3">
              01. Data Sources
            </h2>
            <p>
              HashTribe analyzes publicly available developer data from platforms
              such as GitHub and GitLab to establish credibility signals. We never
              access private repositories, private commits, or non-public activity.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-3">
              02. Data Indexed
            </h2>
            <p>
              We index high-level metadata only — including commit frequency,
              repository activity, language distribution, pull request impact,
              and contribution consistency. Source code contents are never stored
              or replicated within our systems.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-3">
              03. Identity & Profiles
            </h2>
            <p>
              Your HashTribe profile represents a verifiable developer identity.
              Proof-based metrics are public by default to promote transparency,
              while optional profile elements can be customized or hidden by you
              at any time.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-3">
              04. Tribe Visibility
            </h2>
            <p>
              Interactions within Tribes — including discussions, reputation
              signals, and collaboration metrics — are visible to Tribe members.
              This visibility is fundamental to maintaining trust within the
              ecosystem.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-3">
              05. Authentication
            </h2>
            <p>
              Authentication is handled through secure third-party providers
              (e.g. OAuth). HashTribe does not store passwords. Authorization
              tokens are encrypted and scoped to minimum required permissions.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-3">
              06. Analytics
            </h2>
            <p>
              We collect minimal, anonymized usage analytics to improve product
              performance and usability. These metrics cannot be used to
              personally identify you.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-3">
              07. Data Security
            </h2>
            <p>
              All data is encrypted in transit and at rest. Where possible,
              decentralized identity and verifiable credential standards are
              used to reduce centralized data exposure.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-3">
              08. Data Retention
            </h2>
            <p>
              Data is retained only as long as necessary to provide core
              functionality. You may request profile deletion, after which
              associated personal data is permanently removed from our systems.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-3">
              09. Policy Evolution
            </h2>
            <p>
              HashTribe is an evolving protocol. Privacy practices may be updated
              as the platform grows. Significant changes will be communicated
              transparently through versioned updates.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
