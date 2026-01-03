import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getQuestions } from "../services/questionApi";

export default function Practice() {
  const [questions, setQuestions] = useState([]);
  const [language, setLanguage] = useState("javascript");
  const [difficulty, setDifficulty] = useState("easy");
  const [currentOrder, setCurrentOrder]=useState(1);
  const navigate = useNavigate();

  // useEffect(() => {
  //   getQuestions(language, difficulty).then(setQuestions);
  // }, [language, difficulty]);
  useEffect(() => {
  async function load() {
    const progressRes = await fetch(
      `http://localhost:5000/api/progress?userId=${userId}&language=${language}&difficulty=${difficulty}`
    );
    const progress = await progressRes.json();
    setCurrentOrder(progress.currentOrder);

    const qs = await getQuestions(language, difficulty);
    setQuestions(qs);
  }

  load();
}, [language, difficulty]);


  return (
    <div className="min-h-screen bg-[#020617] text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Practice Coding</h1>

      {/* Language Selector */}
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="mb-4 bg-black/40 border border-white/20 px-4 py-2 rounded"
      >
        <option value="javascript">JavaScript</option>
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
            const locked = q.order > currentOrder;

            return (
              <button
                key={q._id}
                disabled={locked}
                onClick={() =>
                  navigate(`/practice/${difficulty}/${q.order}`)
                }
                className={`block w-full text-left p-4 rounded transition
                  ${locked
                    ? "bg-white/5 text-gray-500 cursor-not-allowed"
                    : "bg-white/10 hover:bg-white/20"}
                `}
              >
                {q.order}. {q.title} {locked && "🔒"}
              </button>
            );
          })}
      </div>
    </div>
  );
}
