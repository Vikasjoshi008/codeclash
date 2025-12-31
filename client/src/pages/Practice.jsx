import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Practice() {
  const navigate = useNavigate();
  const [language, setLanguage]=useState("javascript");

  const startPractice = (level) => {
    navigate(`/practice/${level}?lang=${language}`);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-white gap-6">
      <h1 className="text-3xl font-bold">Practice Coding</h1>

      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="bg-black/40 border border-white/20 px-4 py-2 rounded text-white"
      >
        <option value="javascript">JavaScript</option>
        <option value="python">Python</option>
        <option value="java">Java</option>
        <option value="cpp">C++</option>
      </select>

      <p className="text-gray-400">Choose difficulty</p>

      <div className="flex gap-4">
        {["easy", "medium", "hard"].map((lvl) => (
          <button
            key={lvl}
            onClick={() => startPractice(lvl)}
            className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition"
          >
            {lvl.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
