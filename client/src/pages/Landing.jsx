import React from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-[#020617] text-white px-4 sm:px-6 py-12 overflow-hidden">
      {/* ===== Background Glow Effects ===== */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
      </div>

      {/* ===== Header ===== */}
      <div className="relative z-10 text-center mb-14">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            CodeClash
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-gray-400 text-base sm:text-lg">
          Practice coding, compete in real-time battles, and sharpen your skills
          like a pro developer.
        </p>
      </div>

      {/* ===== Cards ===== */}
      <div className="relative z-10 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ===== Practice Card ===== */}
        <div
          onClick={() => navigate("/practice")}
          className="group cursor-pointer rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 transition-all duration-300 hover:-translate-y-2 hover:bg-white/10 hover:shadow-xl hover:shadow-purple-500/20"
        >
          <div className="flex items-center justify-center w-14 h-14 mb-6 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 text-2xl shadow-lg shadow-purple-500/40">
            🧩
          </div>

          <h2 className="text-2xl font-semibold mb-3 group-hover:text-purple-400 transition">
            Practice Coding
          </h2>

          <p className="text-gray-300 leading-relaxed">
            Solve coding problems at your own pace and improve your skills.
            Practice the same problems in{" "}
            <span className="text-purple-400 font-medium">
              JavaScript, Python, Java, C, C++, and C#
            </span>{" "}
            to strengthen your core logic.
          </p>
        </div>

        {/* ===== 1v1 Card ===== */}
        <div
          onClick={() => navigate("/battle/1v1")}
          className="group cursor-pointer rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 transition-all duration-300 hover:-translate-y-2 hover:bg-white/10 hover:shadow-xl hover:shadow-pink-500/20"
        >
          <div className="flex items-center justify-center w-14 h-14 mb-6 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 text-2xl shadow-lg shadow-pink-500/40">
            ⚔️
          </div>

          <h2 className="text-2xl font-semibold mb-3 group-hover:text-pink-400 transition">
            1v1 Online Challenge
          </h2>

          <p className="text-gray-300 leading-relaxed">
            Compete live with other developers in{" "}
            <span className="text-pink-400 font-medium">
              real-time coding battles
            </span>
            . Test your speed, accuracy, and problem-solving skills while getting
            feedback to improve faster.
          </p>
        </div>
      </div>

      {/* ===== Footer Hint ===== */}
      <div className="relative z-10 mt-16 text-center text-sm text-gray-500">
        <p>🚀 Choose a mode and start your coding journey</p>
      </div>
    </div>
  );
}
