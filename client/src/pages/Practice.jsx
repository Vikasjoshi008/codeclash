import React, { useState, useEffect } from "react";
import jwtDecode from "jwt-decode";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Practice() {
  const [questions, setQuestions] = useState([]);
  const [language, setLanguage] = useState("javascript");
  const [difficulty, setDifficulty] = useState("easy");
  const [currentOrder, setCurrentOrder] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
  async function load() {
    try {
      // ✅ ALWAYS load questions
      const questionsRes = await api.get("/questions", {
        params: {
          difficulty: difficulty.toLowerCase()
        }
      });

      setQuestions(questionsRes.data);

      // ✅ Load progress ONLY if logged in
      const token = localStorage.getItem("token");
      const userId = token ? jwtDecode(token).id : null;
      if (userId) {
        const progressRes = await api.get(
          `/progress/${userId}/${language}/${difficulty}`
        );

        setCurrentOrder(progressRes.data.currentOrder || 1);
      } else {
        setCurrentOrder(1);
      }

    } catch (err) {
      console.error("Failed to load practice data", err);
    }
  }

  load();
}, [language, difficulty]);


  return (
    <div className="min-h-screen bg-[#020617] text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Practice Coding</h1>

      {/* Language Selector */}
      <select
        className="mb-6 bg-black/40 border border-white/20 px-4 py-2 rounded"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        <option value="javascript">JavaScript</option>
        <option value="python">Python</option>
        <option value="java">Java</option>
        <option value="cpp">C++</option>
        <option value="c">C</option>
        <option value="csharp">C#</option>
        <option value="go">Go</option>
        <option value="ruby">Ruby</option>
        <option value="php">PHP</option>
        <option value="typescript">TypeScript</option>
      </select>

      {/* Difficulty Selector */}
      <div className="flex gap-4 mb-6">
        {["easy", "medium", "hard"].map((lvl) => (
          <button
            key={lvl}
            onClick={() => setDifficulty(lvl)}
            className={`px-6 py-2 rounded border transition ${
              difficulty === lvl
                ? "bg-indigo-600 border-indigo-500"
                : "bg-white/10 border-white/20 hover:bg-white/20"
            }`}
          >
            {lvl.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {questions.length === 0 && (
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
                navigate(`/practice/${difficulty}/${q.order}?language=${language}`)
              }
              className={`block w-full text-left p-4 rounded transition
                ${
                  isLocked
                    ? "bg-white/5 text-gray-500 cursor-not-allowed"
                    : "bg-white/10 hover:bg-white/20"
                }
              `}
            >
              <span className="mr-2">
                {isSolved && "✔"}
                {isCurrent && "▶"}
                {isLocked && "🔒"}
              </span>
              {q.order}. {q.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}
