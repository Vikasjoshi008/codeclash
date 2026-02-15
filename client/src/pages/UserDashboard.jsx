import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import socket from "../socket";

export default function UserDashboard() {
  const navigate = useNavigate();

  const [battleStats, setBattleStats] = useState(null);
  const [practiceHistory, setPracticeHistory] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null); // "wins" | "losses" | null

  /* ================= FETCH PRACTICE ================= */
  useEffect(() => {
    api.get(`/history`)
      .then((res) => setPracticeHistory(res.data))
      .catch(() => {});
  }, []);

  /* ================= FETCH 1v1 STATS ================= */
  const loadStats = () => {
    api.get(`/1v1/history`)
      .then((res) => setBattleStats(res.data))
      .catch(() => {});
  };

  useEffect(() => {
    loadStats();
  }, []);

  /* ================= LIVE REFRESH ================= */
  useEffect(() => {
    socket.on("statsRefresh", () => {
      loadStats();
    });

    return () => socket.off("statsRefresh");
  }, []);

  /* ================= LOAD FILTERED MATCHES ================= */
  const loadFilteredMatches = async (type) => {
    try {
      const res = await api.get(`/1v1/history/details?type=${type}`);
      setFilteredMatches(res.data);
      setActiveFilter(type);
    } catch {}
  };

  /* ================= STAT CARD ================= */
  const StatCard = ({ label, value, color = "text-white", onClick }) => (
    <div
      onClick={onClick}
      className={`rounded-xl bg-white/5 p-5 text-center transition cursor-pointer hover:bg-white/10`}
    >
      <div className={`text-3xl font-bold ${color}`}>
        {value ?? 0}
      </div>
      <div className="text-gray-400 text-sm mt-1">
        {label}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white px-6 py-8 space-y-12">

      {/* ================= 1v1 STATS ================= */}
      <section className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">

          <h2 className="text-3xl font-bold">
            ⚔️ 1v1 Battle Stats
          </h2>

          <button
            onClick={() => navigate("/battle/1v1/history")}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition text-sm font-semibold shadow-lg shadow-indigo-500/20"
          >
            View Full History
          </button>

        </div>

        {battleStats ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              label="Matches"
              value={battleStats.totalMatches}
            />

            <StatCard
              label="Wins"
              value={battleStats.wins}
              color="text-green-400"
              onClick={() => loadFilteredMatches("wins")}
            />

            <StatCard
              label="Losses"
              value={battleStats.losses}
              color="text-red-400"
              onClick={() => loadFilteredMatches("losses")}
            />

            <StatCard
              label="Solved"
              value={battleStats.solved}
            />
          </div>
        ) : (
          <p className="text-gray-400">No 1v1 matches yet</p>
        )}

        {/* ================= FILTERED MATCH LIST ================= */}
        {activeFilter && (
          <div className="mt-8 space-y-4 animate-fadeIn">

            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold capitalize">
                {activeFilter}
              </h3>

              <button
                onClick={() => {
                  setActiveFilter(null);
                  setFilteredMatches([]);
                }}
                className="text-sm text-gray-400 hover:text-white"
              >
                Clear
              </button>
            </div>

            {filteredMatches.length === 0 ? (
              <p className="text-gray-400">
                No {activeFilter} matches found
              </p>
            ) : (
              filteredMatches.map((m) => (
                <div
                  key={m.matchId}
                  className="bg-white/5 border border-white/10 p-5 rounded-xl transition hover:bg-white/10"
                >
                  <div className="flex justify-between items-center">

                    <div>
                      <h4 className="font-semibold text-lg">
                        {m.problemTitle}
                      </h4>
                      <p className="text-sm text-gray-400">
                        vs {m.opponent}
                      </p>
                    </div>

                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          m.result === "WIN"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {m.result}
                      </p>
                      <p className="text-sm text-gray-400">
                        {m.score} • {m.timeTaken}s
                      </p>
                    </div>

                  </div>

                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(m.date).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </section>

      {/* ================= PRACTICE HISTORY ================= */}
      <section className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">
          📘 Practice History
        </h2>

        {practiceHistory.length === 0 ? (
          <p className="text-gray-400">
            No solved questions yet
          </p>
        ) : (
          practiceHistory.map((h) => (
            <div
              key={h._id}
              className="bg-white/5 p-4 rounded-xl mb-3"
            >
              <div className="font-semibold">
                {h.title}
              </div>
              <div className="text-sm text-gray-400">
                {h.difficulty} • {h.language}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
