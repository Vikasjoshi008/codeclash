import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { getQuestion } from "../services/questionApi";

export default function Question() {
  const { order } = useParams();
  const [question, setQuestion] = useState(null);
  const [code, setCode] = useState("");

  useEffect(() => {
    getQuestion("javascript", "easy", order).then(q => {
      setQuestion(q);
      setCode(q.starterCode);
    });
  }, [order]);

  if (!question) return <div>Loading...</div>;

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
    </div>
  );
}
