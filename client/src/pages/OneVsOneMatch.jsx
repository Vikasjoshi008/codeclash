import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import socket from "../socket";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Editor from "@monaco-editor/react";

const OneVsOneMatch = () => {
  const { matchId } = useParams();
  const { user } = useAuth();

  const [state, setState] = useState("MATCHED");
  const [ready, setReady] = useState(false);
  const [problem, setProblem] = useState(null);
  const [players, setPlayers] = useState([]);

  const [code, setCode] = useState("");
  const [language] = useState("python");

  const [submitted, setSubmitted] = useState(false);
  const [opponentSubmitted, setOpponentSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);
  const editorRef = useRef(null);

  /* ================= JOIN MATCH ================= */
  useEffect(() => {
    if (!user || !matchId) return;

    socket.emit("joinMatch", {
      matchId,
      userId: user.id,
    });

    socket.emit("registerUser", { userId: user.id });
  }, [user, matchId]);

  /* ================= FETCH PLAYERS ================= */
  useEffect(() => {
    if (!matchId) return;

    api.get(`/api/matches/${matchId}`)
      .then((res) => setPlayers(res.data.players || []))
      .catch(() => {});
  }, [matchId]);

  /* ================= SOCKET EVENTS ================= */
  useEffect(() => {
    if (!user) return;

    socket.on("matchFound", ({ players }) => {
      setPlayers(players);
    });

    socket.on("matchUpdate", ({ state }) => {
      setState(state);
    });

    socket.on("problemAssigned", async ({ problemId }) => {
      const res = await api.get(`/problems/${problemId}`);
      setProblem(res.data);
      setCode(res.data.starterCode?.[language] || "");
    });

    socket.on("matchStarted", ({ startedAt, duration }) => {
      const start = Number(startedAt);
      const dur = Number(duration);

      clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - start;
        const remaining = dur - elapsed;
        setTimeLeft(Math.max(0, remaining));
      }, 1000);
    });

    socket.on("submissionUpdate", ({ userId }) => {
      if (userId !== user.id) setOpponentSubmitted(true);
    });

    socket.on("opponentLeft", () => {
      clearInterval(timerRef.current);
      setResult("WIN");
    });

    socket.on("matchResult", ({ winner }) => {
      clearInterval(timerRef.current);
      setResult(winner === user.id ? "WIN" : "LOSE");
    });

    return () => {
      socket.off("matchFound");
      socket.off("matchUpdate");
      socket.off("problemAssigned");
      socket.off("matchStarted");
      socket.off("submissionUpdate");
      socket.off("opponentLeft");
      socket.off("matchResult");
      clearInterval(timerRef.current);
    };
  }, [user]);

  /* ================= EXIT CONFIRM ================= */
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (state === "IN_PROGRESS" && !result) {
        e.preventDefault();
        e.returnValue = "Leaving will count as loss.";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [state, result]);

  /* ================= ACTIONS ================= */
  const markReady = () => {
    socket.emit("playerReady", { matchId, userId: user.id });
    setReady(true);
  };

  const submitCode = () => {
    if (submitted || state !== "IN_PROGRESS") return;

    setSubmitted(true);
    clearInterval(timerRef.current);

    socket.emit("submitCode", {
      matchId,
      userId: user.id,
      code,
      language,
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#020617] text-white px-4 py-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 h-[85vh]">

        {/* LEFT SIDE */}
        <div className="rounded-2xl bg-white/5 p-6 flex flex-col">
          {!problem ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              {!ready ? (
                <button
                  onClick={markReady}
                  className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700"
                >
                  Ready
                </button>
              ) : (
                <p>Waiting for opponent...</p>
              )}
            </div>
          ) : (
            <>
              {state === "IN_PROGRESS" && (
                <p className="text-yellow-400 text-center mb-3">
                  ⏱ {Math.floor(timeLeft / 60000)}:
                  {String(Math.floor((timeLeft % 60000) / 1000)).padStart(2, "0")}
                </p>
              )}

              {players.length === 2 && (
                <h2 className="text-center font-bold mb-3">
                  {players[0].username} vs {players[1].username}
                </h2>
              )}

              <h2 className="text-xl font-bold">{problem.title}</h2>
              <p className="text-gray-300 mt-2 whitespace-pre-line">
                {problem.description}
              </p>
            </>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="rounded-2xl bg-white/5 p-4 flex flex-col">
          <Editor
            theme="vs-dark"
            height="100%"
            defaultLanguage={language}
            value={code}
            onChange={(value) => setCode(value || "")}
            options={{ readOnly: submitted }}
          />

          <button
            onClick={submitCode}
            disabled={submitted || state !== "IN_PROGRESS"}
            className="mt-4 py-3 bg-green-600 hover:bg-green-700 rounded-xl"
          >
            {submitted ? "Submitted" : "Submit"}
          </button>

          {opponentSubmitted && !result && (
            <p className="text-blue-400 text-center mt-2">
              Opponent submitted
            </p>
          )}

          {result && (
            <p className="text-center text-2xl font-bold mt-4">
              {result === "WIN" ? "🎉 You Won!" : "😢 You Lost"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OneVsOneMatch;
