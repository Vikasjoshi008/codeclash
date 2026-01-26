import React from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020617] text-white px-6 py-10">
      <h1 className="text-3xl font-bold text-center mb-10">
        Welcome to CodeClash
      </h1>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Practice */}
        <div
          onClick={() => navigate("/practice")}
          className="cursor-pointer rounded-xl bg-white/10 backdrop-blur border border-white/20 p-6 hover:bg-white/15 transition"
        >
          <h2 className="text-xl font-semibold mb-2">🧩 Practice Coding</h2>
          <p className="text-gray-300">
            Solve coding problems at your own pace and improve your skills.
          </p>
        </div>

        {/* 1v1 */}
        <div
          onClick={() => navigate("/battle/1v1")}
          className="cursor-pointer rounded-xl bg-white/10 backdrop-blur border border-white/20 p-6 hover:bg-white/15 transition"
        >
          <h2 className="text-xl font-semibold mb-2">⚔️ 1v1 Online Challenge</h2>
          <p className="text-gray-300">
            Compete live with other developers in real-time coding battles.
          </p>
        </div>

      </div>
    </div>
  );
}