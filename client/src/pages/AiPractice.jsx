import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Editor from "@monaco-editor/react";

export default function AIPractice() {
  const { level } = useParams();
  const [searchParams] = useSearchParams();
  const language = searchParams.get("lang") || "javascript";

  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/ai/problem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level, language })
    })
      .then(res => res.json())
      .then(data => setProblem(data));
  }, [level, language]);

  const runCode = () => {
    try {
      const result = eval(code); // JS only
      setOutput(String(result ?? "Executed"));
    } catch (err) {
      setOutput(err.message);
    }
  };

  if (!problem) return <div className="text-white p-6">Generating…</div>;

  return (
    <div className="min-h-screen bg-[#020617] text-white grid grid-cols-2">

      {/* PROBLEM */}
      <div className="p-6 border-r border-white/10">
        <h2 className="text-xl font-bold">{problem.title}</h2>
        <p className="mt-4 text-gray-300">{problem.description}</p>

        <p className="mt-4 text-sm text-gray-400">
          <b>Language:</b> {language}
        </p>
      </div>

      {/* EDITOR */}
      <div className="p-4">
        <Editor
          height="70vh"
          theme="vs-dark"
          language={language === "cpp" ? "cpp" : language}
          value={code}
          onChange={setCode}
        />

        {language === "javascript" && (
          <button
            onClick={runCode}
            className="mt-4 bg-indigo-600 px-4 py-2 rounded"
          >
            Run Code
          </button>
        )}

        {output && (
          <div className="mt-4 bg-black/40 p-3 rounded">
            <b>Output:</b> {output}
          </div>
        )}
      </div>
    </div>
  );
}
