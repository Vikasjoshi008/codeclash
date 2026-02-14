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

  useEffect(() => {
    if (user?.id) {
      socket.emit("registerUser", { userId: user.id });
    }
  }, [user?.id]);

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
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
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
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 bg-[#020617] text-white overflow-hidden">
      {/* ===== Background Glow ===== */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      </div>

      {/* ===== Card ===== */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white/5 backdrop-blur-xl shadow-2xl border border-white/10 p-6 sm:p-7 transition-all duration-300">
        {/* TITLE */}
        <h1 className="text-2xl font-extrabold text-center mb-1 tracking-wide">
          ⚔️ 1v1 Code Battle
        </h1>

        <p className="text-center text-xs text-gray-400 mb-5">
          👥 {Math.max(playerCount - 1, 0)} players online
        </p>

        {/* SELECTS */}
        <div className="space-y-4">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full cursor-pointer rounded-xl bg-black/40 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
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
            className="w-full cursor-pointer rounded-xl bg-black/40 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* BUTTON STATES */}
        {status === "IDLE" && (
          <button
            onClick={startMatch}
            className="mt-6 w-full cursor-pointer py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 font-semibold text-sm shadow-lg shadow-indigo-500/30 transition-all duration-200 active:scale-[0.98]"
          >
            Start 1v1
          </button>
        )}

        {status === "SEARCHING" && (
          <div className="mt-6 text-center space-y-4">
            <p className="text-yellow-400 animate-pulse text-sm">
              🔍 Searching for opponent…
            </p>

            <button
              onClick={cancelSearch}
              className="w-full cursor-pointer py-2.5 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30 text-sm transition hover:bg-red-500/25"
            >
              Cancel Search
            </button>
          </div>
        )}

        {noOpponent && (
          <div className="mt-6 text-center space-y-4 animate-[fadeIn_0.25s_ease]">
            <p className="text-red-400 text-sm">
              😔 No opponents available right now
            </p>

            <button
              onClick={startMatch}
              className="w-full cursor-pointer py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm transition"
            >
              Try Again
            </button>
          </div>
        )}

        {error && (
          <p className="mt-4 text-center text-red-400 text-xs">{error}</p>
        )}
      </div>
    </div>
  );
};

export default OneVsOne;
