import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
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
  const [showSolvedBanner, setShowSolvedBanner] = useState(true);



  /* FETCH QUESTION */
  useEffect(() => {
    setLoading(true);
    setOutput("");
    setError("");
    setRanSuccessfully(false);

    getQuestionByOrder(language, difficulty, order)
      .then(q => {setQuestion(q)})
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
  const userId = localStorage.getItem("userId");
  if (!userId) return;

  api.get("/progress", {
    params: { userId, language, difficulty }
  })
  .then(res => {
    if (res.data?.solvedOrders?.includes(Number(order))) {
      setIsSolved(true);
    } else {
      setIsSolved(false);
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
    const response = await runCode(code, question._id, language);

    const { stdout, stderr, code: exitCode } = response.data.run;

    if (exitCode === 0) {
      setOutput(stdout || "");
      setRanSuccessfully(true);

      // ✅ SAVE PROGRESS
      const userId = localStorage.getItem("userId");
      if (userId) {
        await api.post("/progress/advance", {
          userId,
          problemId: question._id,
          language,
          difficulty,
          order: Number(order)
        });
      }

    } else {
      setError(stderr || "Execution failed");
    }
  } catch (err) {
    console.error("RUN ERROR:", err);
    setError("Execution failed");
  }
};


  const handleNextQuestion = () => {
  const nextOrder = Number(order) + 1;

  navigate(
    `/practice/${difficulty}/${nextOrder}?language=${language}`
  );
};


  /* SPLIT DESCRIPTION */
  const [desc, rest] = question.description.split("Constraints:");

  return (
    <div className="grid grid-cols-2 min-h-screen bg-[#020617] text-white">

      {/* LEFT */}
      <div className="p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-2">{question.title}</h1>

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

        {isSolved && showSolvedBanner && (
          <div className="mt-6 p-3 rounded bg-green-900 text-green-300 flex justify-between items-center">
            <span>✅ You already solved this question</span>
            <button
              onClick={() => setShowSolvedBanner(false)}
              className="text-red-400 hover:text-red-300 font-bold"
            >
              ✕
            </button>
          </div>
        )}

      </div>

      {/* RIGHT */}
      <div className="p-4 flex flex-col">
        <Editor
          key={language}
          height="60vh"
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

          {ranSuccessfully && (
          <button
            onClick={handleNextQuestion}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
          >
            Next Question →
          </button>
          )}
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
