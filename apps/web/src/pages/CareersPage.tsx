import React from 'react';

const Careers = () => {
  const jobs = [
    { title: "Frontend Engineer", stack: "React / Tailwind", type: "Remote" },
    { title: "Backend Architect", stack: "Node.js / Go / PostgreSQL", type: "Hybrid (Bangalore)" },
    { title: "Developer Advocate", stack: "Community / Content", type: "Remote" },
  ];

  return (
    <div className="min-h-screen bg-black text-zinc-300 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Aesthetic Header */}
        <div className="border border-zinc-800 bg-zinc-900/30 p-8 rounded-xl mb-12">
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">Execute Your Career.</h1>
          <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">Status: Scouting for Talent_</p>
          <p className="mt-4 text-lg">HashTribe is where the world's best developers build in public. We don't hire based on resumes; we hire based on proof.</p>
        </div>

        <h2 className="text-2xl font-semibold text-white mb-6">Open Frequencies</h2>
        <div className="grid gap-4">
          {jobs.map((job, index) => (
            <div key={index} className="group flex items-center justify-between p-6 border border-zinc-800 rounded-lg hover:border-zinc-500 transition-all bg-zinc-900/20">
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{job.title}</h3>
                <p className="text-zinc-500 text-sm font-mono mt-1">{job.stack} • {job.type}</p>
              </div>
              <button className="bg-white text-black px-6 py-2 rounded-md font-bold text-sm hover:bg-zinc-200 transition-colors">
                Apply
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Careers;