import React, { useEffect, useState } from "react";
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
  setIsSolved(false);
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
  fetch(`http://localhost:5000/api/progress/javascript/easy`, {
    headers : {
      Authorization: `Bearer.${token}`
    }
  })
    .then(res => res.json())
    .then(p => {
      setIsSolved(Number(order) < p.solvedOrders);
    });
}, [order]);

const handleRun = async() => {
  setOutput("");
  setError("");

  const res = await runCode(code, question._id, "javascript");
  console.log("API RESPONSE:", res);
  if (res.stderr) {
    setError(res.stderr);
    setHasRunSuccessfully(false);
  } else {
    setOutput(res.stdout);
    setHasRunSuccessfully(true);
    setIsSolved(true);
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
      userId: userId,
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

return (
    <div className="grid grid-cols-2 min-h-screen bg-[#020617] text-white">
  {/* LEFT: Question */}
  <div className="p-6">
    <h2 className="text-xl font-bold">{question.title}</h2>
    <p className="mt-3">{question.description}</p>
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
      <button
        className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded"
        onClick={handleRun}
      >
        Run Code
      </button>

      <button
        className={`px-4 py-2 rounded ${
          hasRunSuccessfully && !isSolved
            ? "bg-green-600 hover:bg-green-700"
            : "bg-gray-600 cursor-not-allowed"
        }`}
        disabled={!hasRunSuccessfully || isSolved}
        onClick={markAsDone}
        title={
          !hasRunSuccessfully
            ? "Solve this question to mark as done"
            : isSolved
            ? "Already solved"
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
