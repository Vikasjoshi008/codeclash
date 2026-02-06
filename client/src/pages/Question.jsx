import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { getQuestionByOrder } from "../services/questionApi";
import api from "../services/api";
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
  const [running, setRunning] = useState(false);
  const [verdict, setVerdict] = useState(null);
  const [showSolvedBanner, setShowSolvedBanner] = useState(true);

  /* FETCH QUESTION */
  useEffect(() => {
    setLoading(true);
    setOutput("");
    setError("");
    setRanSuccessfully(false);
    setVerdict(null);

    getQuestionByOrder(language, difficulty, order)
      .then((q) => setQuestion(q))
      .catch(() => setQuestion(null))
      .finally(() => setLoading(false));
  }, [language, order, difficulty]);

  /* RESET SOLVED BANNER */
  useEffect(() => {
    setShowSolvedBanner(true);
  }, [order]);

  /* SET STARTER CODE */
  useEffect(() => {
    if (question?.starterCode?.[language]) {
      setCode(question.starterCode[language]);
    }
  }, [language, question]);

  /* CHECK SOLVED */
  useEffect(() => {
    api
      .get(`/progress/${language}/${difficulty}`)
      .then((res) => {
        if (res.data.solvedOrders?.includes(Number(order))) {
          setIsSolved(true);
        } else {
          setIsSolved(false);
        }
      })
      .catch(() => setIsSolved(false));
  }, [order, language, difficulty]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-gray-300">
        Loading...
      </div>
    );

  if (!question)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-red-400">
        Question not found
      </div>
    );

  /* RUN CODE */
  const handleRun = async () => {
    setOutput("");
    setError("");
    setRanSuccessfully(false);
    setRunning(true);

    try {
      const response = await runCode(code, question._id, language);
      const { stdout, verdict } = response;

      if (verdict === "ACCEPTED") {
        setOutput(stdout || "");
        setRanSuccessfully(true);
        setVerdict("ACCEPTED");

        await api.post("/progress/advance", {
          problemId: question._id,
          title: question.title,
          language,
          difficulty,
          order: Number(order),
        });
      } else {
        setOutput(stdout || "");
        setVerdict("WRONG_ANSWER");
      }
    } catch {
      setError("Execution failed");
    } finally {
      setRunning(false);
    }
  };

  const handleNextQuestion = () => {
    const nextOrder = Number(order) + 1;
    navigate(`/practice/${difficulty}/${nextOrder}?language=${language}`);
  };

  const [desc, rest] = question.description.split("Constraints:");

  return (
    <div className="min-h-screen bg-[#020617] text-white grid grid-cols-1 lg:grid-cols-2">
      {/* ===== LEFT: QUESTION ===== */}
      <div className="p-6 overflow-y-auto border-b lg:border-b-0 lg:border-r border-white/10">
        <h1 className="text-2xl font-extrabold mb-3">
          {order}. {question.title}
        </h1>

        <pre className="whitespace-pre-wrap text-gray-300 leading-relaxed">
          {desc}
        </pre>

        {rest && (
          <>
            <h3 className="mt-6 font-semibold text-lg">Constraints</h3>
            <ul className="list-disc ml-6 mt-3 text-gray-400 space-y-1">
              {rest
                .split("\n")
                .filter(Boolean)
                .map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
            </ul>
          </>
        )}

        {isSolved && showSolvedBanner && (
          <div className="mt-6 p-4 rounded-xl bg-black/40 border border-green-500/30 flex justify-between items-center">
            <span className="text-green-400">
              ✅ You already solved this question
            </span>
            <button
              onClick={() => setShowSolvedBanner(false)}
              className="cursor-pointer text-red-400 hover:text-red-300 font-bold"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* ===== RIGHT: EDITOR ===== */}
      <div className="p-4 flex flex-col">
        <Editor
          key={language}
          height="55vh"
          theme="vs-dark"
          language={language}
          value={code}
          onChange={(v) => setCode(v || "")}
        />

        {running && (
          <p className="mt-3 text-blue-400 animate-pulse">
            ⏳ Running your code...
          </p>
        )}

        <div className="flex flex-wrap gap-4 mt-4 items-center">
          <button
            onClick={handleRun}
            disabled={running}
            className={`cursor-pointer px-5 py-2.5 rounded-xl font-semibold transition ${
              running
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {running ? "Running..." : "Run Code"}
          </button>

          {verdict === "ACCEPTED" && (
            <span className="text-green-400 font-semibold">
              ✅ Accepted
            </span>
          )}

          {verdict === "WRONG_ANSWER" && (
            <span className="text-red-400 font-semibold">
              ❌ Wrong Answer
            </span>
          )}

          {ranSuccessfully && verdict && (
            <button
              onClick={handleNextQuestion}
              className="cursor-pointer bg-green-600 hover:bg-green-700 px-5 py-2.5 rounded-xl font-semibold transition"
            >
              Next Question →
            </button>
          )}
        </div>

        {output && (
          <pre className="mt-4 bg-black/60 p-4 rounded-xl text-green-400 overflow-x-auto">
            {output}
          </pre>
        )}

        {error && (
          <pre className="mt-4 bg-black/60 p-4 rounded-xl text-red-400">
            {error}
          </pre>
        )}
      </div>
    </div>
  );
}
