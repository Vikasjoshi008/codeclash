import React, { useEffect, useState } from "react";
import socket from "../socket";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const OneVsOne = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [language, setLanguage] = useState("python");
  const [difficulty, setDifficulty] = useState("easy");
  const [status, setStatus] = useState("IDLE");
  const [error, setError] = useState("");
  const [noOpponent, setNoOpponent] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [playerCount, setPlayerCount] = useState(0);

  /* ================= SOCKET ================= */
  useEffect(() => {
    socket.on("playerCount", (count) => {
      setPlayerCount(count);
    });

    socket.on("matchFound", ({ matchId }) => {
      clearTimeout(searchTimeout);
      setStatus("MATCHED");
      setNoOpponent(false);
      navigate(`/battle/1v1/match/${matchId}`);
    });

    socket.on("matchError", (msg) => {
      clearTimeout(searchTimeout);
      setStatus("IDLE");
      setError(msg);
    });

    socket.on("matchCancelled", () => {
      clearTimeout(searchTimeout);
      setStatus("IDLE");
    });

    return () => {
      socket.off("playerCount");
      socket.off("matchFound");
      socket.off("matchError");
      socket.off("matchCancelled");
    };
  }, [navigate, searchTimeout]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Please login again
      </div>
    );
  }

  /* ================= ACTIONS ================= */

  const startMatch = async () => {
    try {
      setError("");
      setNoOpponent(false);
      setStatus("SEARCHING");

      await api.post("/1v1/start");

      socket.emit("findMatch", {
        userId: user.id,
        language,
        difficulty,
      });

      const timeout = setTimeout(() => {
        setStatus("IDLE");
        setNoOpponent(true);
      }, 12000);

      setSearchTimeout(timeout);
    } catch {
      setStatus("IDLE");
      setError("Failed to start match");
    }
  };

  const cancelSearch = () => {
    clearTimeout(searchTimeout);
    setStatus("IDLE");
    setNoOpponent(false);
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 bg-gradient-to-br from-[#020617] via-[#020617] to-[#020617] text-white overflow-x-hidden">
      <div className="w-full max-w-sm rounded-2xl bg-white/5 backdrop-blur-md shadow-xl border border-white/10 p-6 animate-[fadeIn_0.3s_ease]">

        {/* TITLE */}
        <h1 className="text-xl font-bold text-center mb-1">
          ⚔️ 1v1 Code Battle
        </h1>

        <p className="text-center text-xs text-gray-400 mb-4">
          👥 {playerCount} players online
        </p>

        {/* SELECTS */}
        <div className="space-y-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full rounded-lg bg-[#020617] border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="csharp">C#</option>
            <option value="typescript">Typescript</option>
          </select>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full rounded-lg bg-[#020617] border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* BUTTONS */}
        {status === "IDLE" && (
          <button
            onClick={startMatch}
            className="mt-5 w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition font-semibold text-sm"
          >
            Start 1v1
          </button>
        )}

        {status === "SEARCHING" && (
          <div className="mt-5 text-center space-y-3">
            <p className="text-yellow-400 animate-pulse text-sm">
              🔍 Searching for opponent…
            </p>

            <button
              onClick={cancelSearch}
              className="w-full py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-sm"
            >
              Cancel Search
            </button>
          </div>
        )}

        {noOpponent && (
          <div className="mt-5 text-center space-y-3 animate-[fadeIn_0.2s_ease]">
            <p className="text-red-400 text-sm">
              😔 No opponents available right now
            </p>

            <button
              onClick={startMatch}
              className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {error && (
          <p className="mt-3 text-center text-red-500 text-xs">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default OneVsOne;
