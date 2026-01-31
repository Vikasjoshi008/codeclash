import { useParams } from "react-router-dom";
import socket from "../socket";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";

const OneVsOneMatch = () => {
  const { matchId } = useParams();
  const { user } = useAuth();

  const [state, setState] = useState("MATCHED");
  const [ready, setReady] = useState(false);

  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [opponentSubmitted, setOpponentSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  /* ================= SOCKET LISTENERS ================= */
  useEffect(() => {
    socket.on("matchUpdate", ({ state }) => {
      setState(state);
    });

    socket.on("problemAssigned", async ({ problemId }) => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/problems/${problemId}`);
        setProblem(res.data);
        setCode(res.data.starterCode?.[language] || "");
      } catch (err) {
        console.error("Failed to load problem", err);
      } finally {
        setLoading(false);
      }
    });

    socket.on("submissionUpdate", ({ userId }) => {
      if (userId !== user.id) {
        setOpponentSubmitted(true);
      }
    });

    socket.on("matchResult", ({ winner }) => {
      setResult(winner === user.id ? "WIN" : "LOSE");
    });

    return () => {
      socket.off("matchUpdate");
      socket.off("problemAssigned");
      socket.off("submissionUpdate");
      socket.off("matchResult");
    };
  }, [user.id, language]);

  /* ================= ACTIONS ================= */

  const markReady = () => {
    socket.emit("playerReady", {
      matchId,
      userId: user.id,
    });
    setReady(true);
  };

  const submitCode = () => {
    if (submitted || state !== "IN_PROGRESS") return;

    setSubmitted(true);
    socket.emit("submitCode", {
      matchId,
      userId: user.id,
      code,
      language,
    });
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* LEFT: PROBLEM */}
        <div className="bg-[#020617] rounded-xl p-5 overflow-y-auto">
          {!problem && state === "MATCHED" && (
            <div className="text-center space-y-4">
              <p className="text-gray-400">Waiting for players to be ready</p>
              {!ready && (
                <button
                  onClick={markReady}
                  className="px-5 py-2 bg-indigo-600 rounded-lg"
                >
                  Ready
                </button>
              )}
              {ready && (
                <p className="text-yellow-400 animate-pulse">
                  Waiting for opponent…
                </p>
              )}
            </div>
          )}

          {loading && (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {problem && (
            <>
              <h2 className="text-xl font-bold mb-2">{problem.title}</h2>

              <p className="text-gray-300 mb-4 whitespace-pre-line">
                {problem.description}
              </p>

              {problem.constraints?.length > 0 && (
                <>
                  <h4 className="font-semibold mb-1">Constraints:</h4>
                  <ul className="list-disc list-inside text-gray-400 mb-4">
                    {problem.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </div>

        {/* RIGHT: CODE EDITOR */}
        <div className="bg-[#020617] rounded-xl p-5 flex flex-col">
          <div className="flex justify-between mb-2">
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                if (problem?.starterCode?.[e.target.value]) {
                  setCode(problem.starterCode[e.target.value]);
                }
              }}
              className="bg-[#020617] border border-gray-700 rounded px-2 py-1"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
            </select>

            <button
              onClick={submitCode}
              disabled={submitted || !problem || state !== "IN_PROGRESS"}
              className={`px-4 py-1 rounded-lg ${
                submitted
                  ? "bg-gray-600"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {submitted ? "Submitted" : "Submit"}
            </button>
          </div>

          <Editor
            height="400px"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || "")}
          />

          {submitted && (
            <p className="text-yellow-400 text-center mt-2">
              ⏳ Waiting for opponent submission…
            </p>
          )}

          {opponentSubmitted && !result && (
            <p className="text-blue-400 text-center mt-1">
              👀 Opponent has submitted
            </p>
          )}

          {result && (
            <div className="text-center mt-4">
              {result === "WIN" ? (
                <p className="text-green-400 text-xl font-bold">
                  🎉 You Won!
                </p>
              ) : (
                <p className="text-red-400 text-xl font-bold">
                  😢 You Lost
                </p>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default OneVsOneMatch;
