import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { getQuestionByOrder } from "../services/questionApi";
import { runCode } from "../services/executionAPI";

export default function Question() {
  const { order } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const language = searchParams.get("language") || "javascript";
  const difficulty = searchParams.get("difficulty") || "easy";

  const [question, setQuestion] = useState(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [ranSuccessfully, setRanSuccessfully] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [loading, setLoading] = useState(true);

  /* FETCH QUESTION */
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
      .catch(() => setQuestion(null))
      .finally(() => setLoading(false));
  }, [order, language, difficulty]);

  /* CHECK SOLVED */
  useEffect(() => {
    const userId = localStorage.getItem("userId");
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

  /* RUN CODE */
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
    } catch {
      setError("Execution failed");
    }
  };

  /* MARK SOLVED */
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

  /* SPLIT DESCRIPTION */
  const [desc, rest] = question.description.split("Constraints:");

  return (
    <div className="grid grid-cols-2 min-h-screen bg-[#020617] text-white">

      {/* LEFT */}
      <div className="p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-2">{question.title}</h1>

        <span className="inline-block mb-4 px-3 py-1 text-sm rounded bg-green-700">
          {difficulty.toUpperCase()}
        </span>

        <pre className="whitespace-pre-wrap text-gray-200 leading-relaxed">
          {desc}
        </pre>

        {rest && (
          <>
            <h3 className="mt-6 font-semibold">Constraints</h3>
            <ul className="list-disc ml-6 mt-2 text-gray-300">
              {rest
                .split("\n")
                .filter(Boolean)
                .map((c, i) => (
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

      {/* RIGHT */}
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
            title={ranSuccessfully ? "Mark solved" : "Run code first"}
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
