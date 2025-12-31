import React from "react";
import { useNavigate } from "react-router-dom";

export default function Practice() {
  const navigate = useNavigate();

  const start = (level) => {
    navigate(`/practice/ai/${level}`);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-white gap-6">
      <h1 className="text-3xl font-bold">Practice Coding</h1>
      <p className="text-gray-400">Choose difficulty</p>

      <div className="flex gap-4">
        {["easy", "medium", "hard"].map((lvl) => (
          <button
            key={lvl}
            onClick={() => start(lvl)}
            className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition"
          >
            {lvl.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
