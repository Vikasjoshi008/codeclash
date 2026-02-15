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
  const [dots, setDots] = useState(".");

  /* REGISTER USER */
  useEffect(() => {
    if (user?.id) {
      socket.emit("registerUser", { userId: user.id });
    }
  }, [user?.id]);

  /* DOTS ANIMATION */
  useEffect(() => {
    if (status !== "SEARCHING") return;

    const interval = setInterval(() => {
      setDots((prev) =>
        prev.length >= 3 ? "." : prev + "."
      );
    }, 500);

    return () => clearInterval(interval);
  }, [status]);

  /* SOCKET */
  useEffect(() => {
    socket.on("playerCount", (count) => {
      setPlayerCount(count);
    });

    socket.on("matchFound", ({ matchId }) => {
      clearTimeout(searchTimeout);
      setStatus("MATCHED");
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

  /* START MATCH */
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
      }, 15000);

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

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#020617] text-white overflow-hidden px-4">

      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center shadow-2xl">

        <h1 className="text-3xl font-extrabold mb-2">
          ⚔️ 1v1 Code Battle
        </h1>

        <p className="text-gray-400 text-sm mb-6">
          👥 {Math.max(playerCount - 1, 0)} players online
        </p>

        {/* SELECTS */}
        {status === "IDLE" && (
          <>
            <div className="space-y-4 mb-6">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>

              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <button
              onClick={startMatch}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 font-semibold transition"
            >
              Start 1v1
            </button>
          </>
        )}

        {/* SEARCHING ANIMATION */}
        {status === "SEARCHING" && (
          <div className="space-y-6">

            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-full bg-indigo-600 animate-ping opacity-30"></div>
              <div className="relative w-24 h-24 rounded-full bg-indigo-500 flex items-center justify-center text-3xl font-bold">
                ⚔️
              </div>
            </div>

            <p className="text-yellow-400 text-lg">
              Searching for opponent{dots}
            </p>

            <button
              onClick={cancelSearch}
              className="w-full py-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition"
            >
              Cancel Search
            </button>
          </div>
        )}

        {noOpponent && (
          <div className="mt-6 space-y-4">
            <p className="text-red-400">
              😔 No opponents available
            </p>

            <button
              onClick={startMatch}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        )}

        {error && (
          <p className="mt-4 text-red-400 text-sm">{error}</p>
        )}
      </div>
    </div>
  );
};

export default OneVsOne;
