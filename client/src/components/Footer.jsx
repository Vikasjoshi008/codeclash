import React from "react";

const Footer = () => {
  return (
    <footer className="relative mt-20 border-t border-slate-800 bg-slate-950 text-slate-300">
      {/* Gradient glow background */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-500 blur-3xl"></div>
        <div className="absolute right-20 bottom-0 h-56 w-56 rounded-full bg-purple-500 blur-3xl"></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-12">
        {/* Top Grid */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              CodeClash
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              Compete in real-time coding battles, sharpen your algorithms, and
              climb the leaderboard.
            </p>
          </div>

          {/* Platform Links */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-slate-200">Platform</h3>

            <a
              href="/practice"
              className="transition hover:translate-x-1 hover:text-blue-400"
            >
              Problems
            </a>

            <a
              href="/dashboard"
              className="transition hover:translate-x-1 hover:text-blue-400"
            >
              Leaderboard
            </a>

            <a
              href="/battle/1v1"
              className="transition hover:translate-x-1 hover:text-blue-400"
            >
              1v1 Battles
            </a>
          </div>

          {/* Community */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-slate-200">Community</h3>

            <a
              href="https://github.com/Vikasjoshi008"
              target="_blank"
              rel="noreferrer"
              className="transition hover:translate-x-1 hover:text-purple-400"
            >
              GitHub
            </a>

            <a
              href="/about"
              className="transition hover:translate-x-1 hover:text-purple-400"
            >
              About
            </a>

            <a
              href="/contact"
              className="transition hover:translate-x-1 hover:text-purple-400"
            >
              Contact
            </a>
          </div>
        </div>
        {/* Divider */}
        <div className="mt-10 border-t border-slate-800 pt-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} CodeClash. Built for competitive
          programmers.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
