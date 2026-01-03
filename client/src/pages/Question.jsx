import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { getQuestion } from "../services/questionApi";

export default function Question() {
  const { order } = useParams();
  const [question, setQuestion] = useState(null);
  const [code, setCode] = useState("");
  const navigate=useNavigate();
  const userId= "6926ffccc0bebfe17f798806";

  useEffect(() => {
    getQuestion("javascript", "easy", order).then(q => {
      setQuestion(q);
      setCode(q.starterCode);
    });
  }, [order]);

  if (!question) return <div>Loading...</div>;

  const markAsDone = async() => {
  await fetch("http://localhost:5000/api/progress/advance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: userId,
      language: "javascript",
      difficulty: "easy"
    })
  });

  navigate(`/practice/easy/${Number(order) + 1}`);
}

  return (
    <div className="grid grid-cols-2 min-h-screen bg-[#020617] text-white">
      <div className="p-6">
        <h2 className="text-xl font-bold">{question.title}</h2>
        <p className="mt-3">{question.description}</p>
      </div>

      <div className="p-4">
        <Editor
          height="90vh"
          theme="vs-dark"
          language="javascript"
          value={code}
          onChange={v => setCode(v ?? "")}
        />
      </div>
      <div className="flex gap-4 mt-4">
      <button
        className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded"
        onClick={() => alert("Run will be added in Phase 3")}
      >
        Run Code
      </button>

      <button
        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
        onClick={markAsDone}
      >
        Mark as Solved
      </button>
    </div>
    </div>
  );
}
