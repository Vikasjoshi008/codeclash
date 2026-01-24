import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { getQuestionByOrder } from "../services/questionApi";
import { runCode } from "../services/executionAPI";

export default function Question() {
  const { order } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const language = searchParams.get("lang") || "javascript";
  const difficulty = searchParams.get("difficulty") || "easy";

  const userId = "6926ffccc0bebfe17f798806"; // replace later with auth user

  const [question, setQuestion] = useState(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [ranSuccessfully, setRanSuccessfully] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH QUESTION ---------------- */
  useEffect(() => {
    setLoading(true);
    setOutput("");
    setError("");
    setRanSuccessfully(false);

    getQuestionByOrder(language, difficulty, order)
      .then(q => {
        setQuestion(q);
        setCode(q?.starterCode?.[language] || "");
      })
      .finally(() => setLoading(false));
  }, [order, language, difficulty]);

  /* ---------------- CHECK SOLVED STATUS ---------------- */
  useEffect(() => {
    fetch(
      `http://localhost:5000/api/progress?userId=${userId}&language=${language}&difficulty=${difficulty}`
    )
      .then(res => res.ok ? res.json() : null)
      .then(p => {
        if (p?.solvedOrders?.includes(Number(order))) {
          setIsSolved(true);
        }
      });
  }, [order, language, difficulty]);

  if (loading) return <div className="p-6 text-white">Loading...</div>;
  if (!question) return <div className="p-6 text-red-400">Question not found</div>;

  /* ---------------- RUN CODE ---------------- */
  const handleRun = async () => {
    setOutput("");
    setError("");
    setRanSuccessfully(false);

    try {
      const res = await runCode(code, question._id, language);

      if (res.stderr) {
        setError(res.stderr);
      } else {
        setOutput(res.stdout || "No output");
        setRanSuccessfully(true);
      }
    } catch (err) {
      setError("Execution failed");
    }
  };

  /* ---------------- MARK AS SOLVED ---------------- */
  const handleMarkSolved = async () => {
    if (!ranSuccessfully) return;

    await fetch("http://localhost:5000/api/progress/advance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        language,
        difficulty,
        order: Number(order)
      })
    });

    navigate(`/practice/${difficulty}/${Number(order) + 1}?lang=${language}`);
  };

  /* ---------------- RENDER HELPERS ---------------- */
  function extractConstraints(description = "") {
  const idx = description.indexOf("Constraints:");
  if (idx === -1) return [];

  return description
    .slice(idx + "Constraints:".length)
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);
}


  return (
    <div className="grid grid-cols-2 min-h-screen bg-[#020617] text-white">

      {/* LEFT: PROBLEM */}
      <div className="p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-2">{question.title}</h1>

        <span className="inline-block px-3 py-1 mb-4 rounded bg-green-700 text-sm">
          {difficulty.toUpperCase()}
        </span>

        <div className="text-gray-200 leading-relaxed">
          {extractConstraints(question.description).length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Constraints</h3>
              <ul className="list-disc ml-6 text-gray-300">
                {extractConstraints(question.description).map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* CONSTRAINTS */}
        {Array.isArray(question.constraints) && question.constraints.length > 0 && (
          <>
            <h3 className="mt-6 font-semibold">Constraints</h3>
            <ul className="list-disc ml-6 mt-2 text-gray-300">
              {question.constraints.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </>
        )}

        {isSolved && (
          <div className="mt-6 p-3 rounded bg-green-900 text-green-300">
            ✅ You already solved this question
          </div>
        )}
      </div>

      {/* RIGHT: EDITOR */}
      <div className="p-4 flex flex-col">
        <Editor
          height="70vh"
          theme="vs-dark"
          language={language}
          value={code}
          onChange={v => setCode(v || "")}
        />

        <div className="flex gap-4 mt-4">
          <button
            onClick={handleRun}
            className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded"
          >
            Run Code
          </button>

          <button
            onClick={handleMarkSolved}
            disabled={!ranSuccessfully}
            title={
              ranSuccessfully
                ? "Mark as solved"
                : "Solve the question to mark as solved"
            }
            className={`px-4 py-2 rounded ${
              ranSuccessfully
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-600 cursor-not-allowed"
            }`}
          >
            Mark as Solved
          </button>
        </div>

        {output && (
          <pre className="mt-4 bg-black/70 p-4 rounded text-green-400">
            {output}
          </pre>
        )}

        {error && (
          <pre className="mt-4 bg-black/70 p-4 rounded text-red-400">
            {error}
          </pre>
        )}
      </div>
    </div>
  );
}
