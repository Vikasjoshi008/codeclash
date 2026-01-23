import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { getQuestion } from "../services/questionApi";
import { runCode } from "../services/executionAPI";

export default function Question() {
  const { order } = useParams();
  const [question, setQuestion] = useState(null);
  const [output, setOutput]=useState(null);
  const [error, setError] = useState(null);
  const [isSolved, setIsSolved] = useState(false);
  const [hasRunSuccessfully, setHasRunSuccessfully] = useState(false);

  const [code, setCode] = useState("");
  const navigate=useNavigate();

  useEffect(() => {
    setOutput(null);
    setError(null);
    setHasRunSuccessfully(false);
}, [order]);

  useEffect(() => {
    getQuestion("javascript", "easy", order).then(q => {
      setQuestion(q);
      setCode(q.starterCode?.javascript || "");
    });
  }, [order]);

  useEffect(() => {
  const token=localStorage.getItem("token");
  const userId = token ? jwtDecode(token).id : null;
  fetch(`http://localhost:5000/api/progress?userId=${userId}&language=javascript&difficulty=easy`, {
    headers : {
      Authorization: `Bearer.${token}`
    }
  })
    .then(res => res.json())
    .then(p => {
      setIsSolved(p.solvedOrders.includes(Number(order)));
    });
}, [order]);

const handleRun = async() => {
  setOutput(null);
  setError(null);

  const res = await runCode(code, question._id, "javascript");
  console.log("API RESPONSE:", res);
  if(res.error) {
    alert(`Error: ${res.error}`);
  }

  if (res.stderr) {
    setError(res.stderr);
    setHasRunSuccessfully(false);
  } else {
    setOutput(res.stdout);
    setHasRunSuccessfully(true);
  }
}
  const markAsDone = async() => {
    const token=localStorage.getItem("token");
  await fetch("http://localhost:5000/api/progress/advance", {
    method: "POST",
    headers: { 
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json" 
    },
    body: JSON.stringify({
      language: "javascript",
      difficulty: "easy",
      order: Number(order)
    })
  });
  navigate(`/practice/easy/${Number(order) + 1}`);
}

if (!question) {
  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      Loading question...
    </div>
  );
}
  const canMarkSolved = question.hasJudge ? hasRunSuccessfully : true;
return (
    <div className="grid grid-cols-2 min-h-screen bg-[#020617] text-white">
  {/* LEFT: Question */}
 <div className="p-6 overflow-y-auto">
    {!question.hasJudge && (
    <span className="px-3 py-1 rounded text-sm bg-yellow-700/30 text-yellow-300">
      Practice Only
    </span>
  )}

  <h2 className="text-2xl font-bold mb-2">{question.title}</h2>

  <span className="inline-block mb-4 px-3 py-1 text-sm rounded bg-green-700/30 text-green-300">
    Easy
  </span>

  {/* Description */}
 <pre className="whitespace-pre-wrap text-gray-200 leading-relaxed">
    {question.description}
  </pre>

  {/* Examples */}
  {question.examples?.length > 0 && (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">Examples</h3>

      {question.examples.map((ex, idx) => (
        <div
          key={idx}
          className="mb-4 rounded-lg bg-black/40 p-4 border border-white/10"
        >
          <p className="font-semibold mb-1">
            Example {idx + 1}:
          </p>

          <p>
            <span className="font-semibold">Input:</span>{" "}
            <code className="text-blue-300">
              {ex.input}
            </code>
          </p>

          <p>
            <span className="font-semibold">Output:</span>{" "}
            <code className="text-green-300">
              {ex.output}
            </code>
          </p>

          {ex.explanation && (
            <p className="mt-1 text-gray-300">
              <span className="font-semibold">Explanation:</span>{" "}
              {ex.explanation}
            </p>
          )}
        </div>
      ))}
    </div>
  )}

</div>


  {/* RIGHT: Editor + Controls */}
  <div className="p-4 flex flex-col">
    <Editor
      height="70vh"
      theme="vs-dark"
      language="javascript"
      value={code}
      onChange={v => setCode(v ?? "")}
    />

    <div className="flex gap-4 mt-4">
  {/* Run Code */}
  <button
    onClick={handleRun}
    disabled={!question.hasJudge}
    className={`px-4 py-2 rounded ${
      question.hasJudge
        ? "bg-indigo-600 hover:bg-indigo-700"
        : "bg-gray-700 cursor-not-allowed"
    }`}
    title={
      question.hasJudge
        ? "Run code"
        : "Execution not available for this question"
    }
  >
    Run Code
  </button>

  {/* Mark as Solved */}
  <button
    onClick={markAsDone}
    disabled={!canMarkSolved || isSolved}
    className={`px-4 py-2 rounded ${
      canMarkSolved && !isSolved
        ? "bg-green-600 hover:bg-green-700"
        : "bg-gray-600 cursor-not-allowed"
    }`}
    title={
      isSolved
        ? "Already solved"
        : !canMarkSolved
        ? "Solve this question to mark as done"
        : "Mark as solved"
    }
  >
    Mark as Solved
  </button>
</div>


    {output && (
      <pre className="mt-4 bg-black/70 p-4 rounded text-green-400">
        {output}
      </pre>
    )}

    {isSolved && (
      <div className="mb-3 p-3 rounded bg-green-900 text-green-300">
        ✅ You already solved this question
      </div>
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
