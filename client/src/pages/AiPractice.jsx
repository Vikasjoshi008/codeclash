import React from "react";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { fetchAIProblem } from "../../../server/services/aiApi";

export default function AIPractice() {
  const { level } = useParams();
  const [searchParams] = useSearchParams();
  const language = searchParams.get("lang") || "javascript";

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState(""); // correct / wrong / error

  useEffect(() => {
  let mounted = true;

  async function load() {
    try {
      const data = await fetchAIProblem(level, language);
      if (mounted) setProblem(data);
    } catch {
      if (mounted) setProblem(null);
    } finally {
      if (mounted) setLoading(false); // 🔥 ALWAYS STOP LOADING
    }
  }

  load();
  return () => { mounted = false };
}, [level, language]);

const runCode = () => {
  try {
    console.log("🟢 Run clicked");
    console.log("📄 Code:", code);

    const wrappedCode = `
      ${code}
      return typeof solve === "function" ? solve : null;
    `;

    const userSolve = new Function(wrappedCode)();

    console.log("🧠 Extracted solve:", userSolve);

    if (!userSolve) {
      setStatus("❌ solve() is not defined");
      return;
    }

    const testCase = problem.testCases[0];
    console.log("🧪 Test case:", testCase);

    const result = userSolve(...testCase.input=["abc", "def"]);
    console.log("✅ Result:", result);

    setOutput(JSON.stringify(result));

    if (JSON.stringify(result) === JSON.stringify(testCase.output)) {
      setStatus("✅ Correct answer!");
    } else {
      setStatus(`❌ Wrong answer. Expected: ${JSON.stringify(testCase.output)}`);
    }

  } catch (err) {
    console.error("🔥 Runtime error:", err);
    setStatus("❌ Error in your code");
    setOutput(err.message);
  }
};



  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        Generating problem...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#020617] text-red-400 flex items-center justify-center">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white grid grid-cols-2">

      {/* LEFT: QUESTION */}
      <div className="p-6 border-r border-white/10 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">{problem.title}</h1>

        <p className="text-gray-300 mb-6">{problem.description}</p>

        <div className="space-y-3 text-sm text-gray-400">
          <div><b className="text-white">Input:</b> {problem.input_format}</div>
          <div><b className="text-white">Output:</b> {problem.output_format}</div>
          <div><b className="text-white">Example:</b> {problem.example}</div>
        </div>
      </div>

      {/* RIGHT: EDITOR */}
      <div className="p-4 flex flex-col">
        <Editor
          height="65vh"
          theme="vs-dark"
          language="javascript"
          value={code}
          onChange={(value) => setCode(value ?? "")}
        />

        <button
          onClick={runCode}
          className="mt-4 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded self-start"
        >
          Run
        </button>

        {/* OUTPUT */}
        {output && (
          <div className="mt-4 bg-black/40 p-3 rounded text-sm">
            <b>Output:</b> {output}
          </div>
        )}

        {/* STATUS */}
        {status && (
          <div className="mt-2 text-sm">
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
