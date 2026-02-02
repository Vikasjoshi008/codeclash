import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import socket from "../socket";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Editor from "@monaco-editor/react";

const OneVsOneMatch = () => {
  const { matchId } = useParams();
  const { user } = useAuth();

  /* ================= STATE ================= */
  const [state, setState] = useState("MATCHED");
  const [ready, setReady] = useState(false);

  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");

  const [submitted, setSubmitted] = useState(false);
  const [opponentSubmitted, setOpponentSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  const [timeLeft, setTimeLeft] = useState(0);
  const [summary, setSummary] = useState(null);

  const editorRef = useRef(null);
  const timerRef = useRef(null);
  const [players, setPlayers] = useState([]);

  /* ================= EDITOR ================= */
  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  /* ================= SOCKET LISTENERS ================= */
  useEffect(() => {
    if (!socket || !matchId || !user) return;

    socket.emit("joinMatch", {
      matchId,
      userId: user.id,
    });
  }, [matchId, user]);

  useEffect(() => {
    if (!matchId) return;

    const fetchPlayers = async () => {
      try {
        const res = await api.get(`/api/matches/${matchId}`);
        setPlayers(res.data.players || []);
      } catch (err) {
        console.error("Failed to load match players");
      }
    };

    fetchPlayers();
  }, [matchId]);

  useEffect(() => {
    if (!socket) return;

    socket.on("matchFound", ({ players }) => {
      console.log("MATCH FOUND:", players);
      setPlayers(players);
    });

    return () => {
      socket.off("matchFound");
    };
  }, [socket]);

  useEffect(() => {
    if (!user) return;

    socket.on("matchUpdate", ({ state }) => {
      setState(state);
    });

    socket.on("problemAssigned", async ({ problemId }) => {
      try {
        const res = await api.get(`/problems/${problemId}`);
        setProblem(res.data);

        const starter = res.data.starterCode?.[language] || "";
        setCode(starter);

        // ensure editor sync
        setTimeout(() => {
          editorRef.current?.setValue(starter);
        }, 0);
      } catch (err) {
        console.error("Failed to load problem", err);
      }
    });

    socket.on("matchStarted", ({ startedAt, duration }) => {
      const safeDuration = Number(duration) || 15 * 60 * 1000;

      // 🔒 HARD RESET TIMER BASE
      const start =
        typeof startedAt === "number"
          ? startedAt
          : new Date(startedAt).getTime();

      if (!start || Number.isNaN(start)) {
        console.error("Invalid startedAt:", startedAt);
        return;
      }

      clearInterval(timerRef.current);

      // ✅ IMPORTANT: show full time immediately
      setTimeLeft(safeDuration);

      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - start;
        const remaining = safeDuration - elapsed;
        setTimeLeft(Math.max(0, remaining));
      }, 1000);
    });

    socket.on("submissionUpdate", ({ userId }) => {
      if (userId !== user.id) {
        setOpponentSubmitted(true);
      }
    });

    socket.on("matchResult", ({ winner }) => {
      clearInterval(timerRef.current);
      setResult(winner === user.id ? "WIN" : "LOSE");
    });

    socket.on("matchTimeout", () => {
      setResult("TIME_UP");
    });

    socket.on("matchSummary", (data) => {
      setSummary(data);
    });

    return () => {
      socket.off("matchUpdate");
      socket.off("problemAssigned");
      socket.off("matchStarted");
      socket.off("submissionUpdate");
      socket.off("matchResult");
      socket.off("matchTimeout");
      socket.off("matchSummary");
      clearInterval(timerRef.current);
    };
  }, [user, language]);

  /* ================= GUARD ================= */
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">
        <p>Loading user…</p>
      </div>
    );
  }

  /* ================= ACTIONS ================= */
  const markReady = () => {
    socket.emit("playerReady", { matchId, userId: user.id });
    setReady(true);
  };

  const submitCode = () => {
    if (submitted || state !== "IN_PROGRESS") return;

    setSubmitted(true);

    // ⏸ STOP TIMER FOR THIS USER
    clearInterval(timerRef.current);

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
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 h-[80vh]">
        {/* ================= LEFT: PROBLEM ================= */}
        <div className="bg-[#020617] p-5 rounded-xl h-full flex flex-col">
          {!problem && (
            <div className="flex-1 flex flex-col justify-center items-center">
              <p className="text-gray-400 mb-3">Waiting for players</p>
              {!ready && (
                <button
                  onClick={markReady}
                  className="px-4 py-2 bg-indigo-600 rounded"
                >
                  Ready
                </button>
              )}
              {ready && (
                <p className="text-yellow-400 mt-3 animate-pulse">
                  Waiting for opponent…
                </p>
              )}
            </div>
          )}

          {problem && (
            <>
              {state === "IN_PROGRESS" && (
                <p className="text-yellow-400 mb-3 text-center">
                  ⏱ {Math.floor(timeLeft / 60000)}:
                  {String(Math.floor((timeLeft % 60000) / 1000)).padStart(
                    2,
                    "0",
                  )}
                </p>
              )}

              {submitted && (
                <p className="text-gray-400 text-center mt-2">
                  ⏸ Timer stopped after submission
                </p>
              )}

              {players.length === 2 && (
                <h2>
                  {players[0].name} vs {players[1].name}
                </h2>
              )}

              <div className="overflow-y-auto flex-1">
                <h2 className="text-xl font-bold mb-2">{problem.title}</h2>
                <p className="text-gray-300 whitespace-pre-line">
                  {problem.description}
                </p>
              </div>
            </>
          )}
        </div>

        {/* ================= RIGHT: EDITOR ================= */}
        <div className="bg-[#020617] p-5 rounded-xl h-full flex flex-col">
          <Editor
            className="flex-1"
            theme="vs-dark"
            defaultLanguage={language}
            defaultValue={code}
            onMount={handleEditorDidMount}
            onChange={(value) => setCode(value || "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
              readOnly: submitted,
            }}
          />

          <button
            onClick={submitCode}
            disabled={submitted || !problem || state !== "IN_PROGRESS"}
            className={`mt-3 px-4 py-2 rounded ${
              submitted ? "bg-gray-600" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {submitted ? "Submitted" : "Submit"}
          </button>

          {opponentSubmitted && !result && (
            <p className="text-blue-400 mt-2 text-center">
              👀 Opponent has submitted
            </p>
          )}

          {result && (
            <p className="mt-3 text-center text-xl font-bold">
              {result === "WIN"
                ? "🎉 You Won!"
                : result === "TIME_UP"
                  ? "⏰ Time Up"
                  : "😢 You Lost"}
            </p>
          )}

          {summary && (
            <div className="mt-4 bg-black p-4 rounded">
              <h3 className="font-bold mb-2">📊 Match Summary</h3>
              {summary.players.map((p) => (
                <p key={p.userId}>
                  {p.userId === user.id ? "You" : "Opponent"} — {p.passed}/
                  {p.total} in {p.timeTaken}s
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OneVsOneMatch;
