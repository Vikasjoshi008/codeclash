import React from "react";

export default function About() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          About CodeClash
        </h1>

        <p className="mt-6 text-lg text-slate-400">
          CodeClash is a competitive programming platform where developers
          battle each other in real-time coding challenges. The goal is simple:
          solve problems faster and more efficiently than your opponent.
        </p>

        <h2 className="mt-10 text-2xl font-semibold text-slate-200">
          How It Works
        </h2>

        <p className="mt-3 text-slate-400">
          Players are matched in a 1v1 coding battle. Both participants receive
          the same problem and must submit a working solution. The system runs
          automated test cases to determine correctness, speed, and efficiency.
        </p>

        <h2 className="mt-10 text-2xl font-semibold text-slate-200">
          Key Features
        </h2>

        <ul className="mt-4 space-y-2 text-slate-400">
          <li>Real-time 1v1 coding battles</li>
          <li>Automated judging with test cases</li>
          <li>Leaderboard and ranking system</li>
          <li>AI feedback for improving solutions</li>
        </ul>

        <h2 className="mt-10 text-2xl font-semibold text-slate-200">
          Our Mission
        </h2>

        <p className="mt-3 text-slate-400">
          CodeClash aims to make learning algorithms and problem solving
          exciting through competition. By practicing against other developers,
          users can sharpen their skills and become better programmers.
        </p>
      </div>
    </div>
  );
}
