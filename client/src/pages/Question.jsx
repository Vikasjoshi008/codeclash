// import React, { useEffect, useState } from "react";
// import { jwtDecode } from "jwt-decode";
// import { useNavigate } from "react-router-dom";
// import { useParams } from "react-router-dom";
// import Editor from "@monaco-editor/react";
// import { getQuestion } from "../services/questionApi";
// import { runCode } from "../services/executionAPI";

// export default function Question() {
//   const { order } = useParams();
//   const [question, setQuestion] = useState(null);
//   const [output, setOutput]=useState(null);
//   const [error, setError] = useState(null);
//   const [isSolved, setIsSolved] = useState(false);
//   const [hasRunSuccessfully, setHasRunSuccessfully] = useState(false);
//   const [language, setLanguage] = useState("javascript");

//   const [code, setCode] = useState("");
//   const navigate=useNavigate();

//   useEffect(() => {
//     setOutput(null);
//     setError(null);
//     setHasRunSuccessfully(false);
// }, [order]);

//   useEffect(() => {
//     if (question?.starterCode?.[language]) {
//       setCode(question.starterCode[language]);
//     }
//   }, [language, question]);


//   useEffect(() => {
//     getQuestion("javascript", "easy", order).then(q => {
//       setQuestion(q);
//       setCode(q.starterCode?.javascript || "");
//     });
//   }, [order]);

//   useEffect(() => {
//   const token=localStorage.getItem("token");
//   const userId = token ? jwtDecode(token).id : null;
//   fetch(`http://localhost:5000/api/progress?userId=${userId}&language=javascript&difficulty=easy`, {
//     headers : {
//       Authorization: `Bearer.${token}`
//     }
//   })
//     .then(res => res.json())
//     .then(p => {
//       setIsSolved(p.solvedOrders.includes(Number(order)));
//     });
// }, [order]);

// const handleRun = async() => {
//   setOutput(null);
//   setError(null);

//   const res = await runCode(code, question._id, "javascript");
//   console.log("API RESPONSE:", res);
//   if(res.error) {
//     alert(`Error: ${res.error}`);
//   }

//   if (res.stderr) {
//     setError(res.stderr);
//     setHasRunSuccessfully(false);
//   } else {
//     setOutput(res.stdout);
//     setHasRunSuccessfully(true);
//   }
// }
//   const markAsDone = async() => {
//     const token=localStorage.getItem("token");
//   await fetch("http://localhost:5000/api/progress/advance", {
//     method: "POST",
//     headers: { 
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json" 
//     },
//     body: JSON.stringify({
//       language: "javascript",
//       difficulty: "easy",
//       order: Number(order)
//     })
//   });
//   navigate(`/practice/easy/${Number(order) + 1}`);
// }

// if (!question) {
//   return (
//     <div className="min-h-screen flex items-center justify-center text-white">
//       Loading question...
//     </div>
//   );
// }
//   const canMarkSolved = question.hasJudge ? hasRunSuccessfully : true;
// return (
//     <div className="grid grid-cols-2 min-h-screen bg-[#020617] text-white">
//   {/* LEFT: Question */}
//  <div className="p-6 overflow-y-auto">
//     {!question.hasJudge && (
//     <span className="px-3 py-1 rounded text-sm bg-yellow-700/30 text-yellow-300">
//       Practice Only
//     </span>
//   )}

//   <h2 className="text-2xl font-bold mb-2">{question.title}</h2>

//   <span className="inline-block mb-4 px-3 py-1 text-sm rounded bg-green-700/30 text-green-300">
//     Easy
//   </span>

//   {/* Description */}
//  <pre className="whitespace-pre-wrap text-gray-200 leading-relaxed">
//     {question.description}
//   </pre>

//   {/* Examples */}
//   {question.examples?.length > 0 && (
//     <div className="mt-6">
//       <h3 className="text-lg font-semibold mb-3">Examples</h3>

//       {question.examples.map((ex, idx) => (
//         <div
//           key={idx}
//           className="mb-4 rounded-lg bg-black/40 p-4 border border-white/10"
//         >
//           <p className="font-semibold mb-1">
//             Example {idx + 1}:
//           </p>

//           <p>
//             <span className="font-semibold">Input:</span>{" "}
//             <code className="text-blue-300">
//               {ex.input}
//             </code>
//           </p>

//           <p>
//             <span className="font-semibold">Output:</span>{" "}
//             <code className="text-green-300">
//               {ex.output}
//             </code>
//           </p>

//           {ex.explanation && (
//             <p className="mt-1 text-gray-300">
//               <span className="font-semibold">Explanation:</span>{" "}
//               {ex.explanation}
//             </p>
//           )}
//         </div>
//       ))}
//     </div>
//   )}

// </div>


//   {/* RIGHT: Editor + Controls */}
//   <div className="p-4 flex flex-col">
//     <Editor
//       height="70vh"
//       theme="vs-dark"
//       language={language === "javascript" ? "javascript" : language}
//       value={code}
//       onChange={v => setCode(v ?? "")}
//     />

//     <div className="flex gap-4 mt-4">
//   {/* Run Code */}
//   <button
//     onClick={handleRun}
//     disabled={!question.hasJudge}
//     className={`px-4 py-2 rounded ${
//       question.hasJudge
//         ? "bg-indigo-600 hover:bg-indigo-700"
//         : "bg-gray-700 cursor-not-allowed"
//     }`}
//     title={
//       question.hasJudge
//         ? "Run code"
//         : "Execution not available for this question"
//     }
//   >
//     Run Code
//   </button>

//   {/* Mark as Solved */}
//   <button
//     onClick={markAsDone}
//     disabled={!canMarkSolved || isSolved}
//     className={`px-4 py-2 rounded ${
//       canMarkSolved && !isSolved
//         ? "bg-green-600 hover:bg-green-700"
//         : "bg-gray-600 cursor-not-allowed"
//     }`}
//     title={
//       isSolved
//         ? "Already solved"
//         : !canMarkSolved
//         ? "Solve this question to mark as done"
//         : "Mark as solved"
//     }
//   >
//     Mark as Solved
//   </button>
// </div>


//     {output && (
//       <pre className="mt-4 bg-black/70 p-4 rounded text-green-400">
//         {output}
//       </pre>
//     )}

//     {isSolved && (
//       <div className="mb-3 p-3 rounded bg-green-900 text-green-300">
//         ✅ You already solved this question
//       </div>
//     )}

//     {error && (
//       <pre className="mt-4 bg-black/70 p-4 rounded text-red-400">
//         {error}
//       </pre>
//     )}
//   </div>
// </div>

//   );
// }

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { getQuestion } from "../services/questionApi";
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

    getQuestion(language, difficulty, order)
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
  const renderDescription = () =>
    question.description.split("\n").map((line, i) => (
      <p key={i} className="mb-2">
        {line}
      </p>
    ));

  return (
    <div className="grid grid-cols-2 min-h-screen bg-[#020617] text-white">

      {/* LEFT: PROBLEM */}
      <div className="p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-2">{question.title}</h1>

        <span className="inline-block px-3 py-1 mb-4 rounded bg-green-700 text-sm">
          {difficulty.toUpperCase()}
        </span>

        <div className="text-gray-200 leading-relaxed">
          {renderDescription()}
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
