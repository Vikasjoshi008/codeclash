import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Practice() {
  const [questions, setQuestions] = useState([]);
  const [language, setLanguage] = useState("javascript");
  const [difficulty, setDifficulty] = useState("easy");
  const [currentOrder, setCurrentOrder] = useState(1);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const questionsRes = await api.get("/questions", {
          params: {
            difficulty: difficulty.toLowerCase(),
          },
        });

        setQuestions(questionsRes.data);

        const token = localStorage.getItem("token");
        const userId = token ? jwtDecode(token).id : null;

        if (userId) {
          const progressRes = await api.get(
            `/progress/${language}/${difficulty}`,
          );
          setCurrentOrder(progressRes.data.currentOrder || 1);
        } else {
          setCurrentOrder(1);
        }
      } catch (err) {
        console.error("Failed to load practice data", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [language, difficulty]);

  return (
    <div className="relative min-h-screen bg-[#020617] text-white px-4 sm:px-6 py-8">
      {/* ===== Header ===== */}
      <div className="max-w-5xl mx-auto mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
          🧩 Practice Coding
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Solve problems step-by-step and strengthen your fundamentals.
        </p>
      </div>

      {/* ===== Controls ===== */}
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-8">
        {/* Language */}
        <select
          className="cursor-pointer bg-black/40 border border-white/10 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="c">C</option>
          <option value="csharp">C#</option>
        </select>

        {/* Difficulty */}
        <div className="flex gap-3">
          {["easy", "medium", "hard"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setDifficulty(lvl)}
              className={`cursor-pointer px-5 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                difficulty === lvl
                  ? "bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-500/30"
                  : "bg-white/5 border-white/10 hover:bg-white/15"
              }`}
            >
              {lvl.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ===== Questions List ===== */}
      <div className="max-w-5xl mx-auto space-y-3">
        {loading && (
          <p className="text-gray-400 animate-pulse">
            Loading questions...
          </p>
        )}

        {!loading && questions.length === 0 && (
          <p className="text-gray-400">No questions found</p>
        )}

        {questions.map((q) => {
          const isSolved = q.order < currentOrder;
          const isCurrent = q.order === currentOrder;
          const isLocked = q.order > currentOrder;

          return (
            <button
              key={q._id}
              disabled={isLocked}
              onClick={() =>
                navigate(
                  `/practice/${difficulty}/${q.order}?language=${language}`,
                )
              }
              className={`group w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 ${
                isLocked
                  ? "bg-white/5 border-white/10 text-gray-500 cursor-not-allowed"
                  : "bg-white/5 border-white/10 hover:bg-white/15 hover:shadow-lg hover:shadow-indigo-500/10 cursor-pointer"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">
                  {isSolved && "✔"}
                  {isCurrent && "▶"}
                  {isLocked && "🔒"}
                </span>

                <span className="font-medium">
                  {q.order}. {q.title}
                </span>

                {isCurrent && (
                  <span className="ml-auto text-xs text-indigo-400">
                    Current
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
