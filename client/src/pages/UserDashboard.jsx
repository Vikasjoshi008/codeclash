import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function UserDashboard() {
  const [practiceHistory, setPracticeHistory] = useState([]);
  const [battleStats, setBattleStats] = useState(null);
  const navigate = useNavigate();

  /* ---------- PRACTICE HISTORY ---------- */
  useEffect(() => {
    api
      .get(`/history`)
      .then((res) => setPracticeHistory(res.data))
      .catch((err) => console.error(err));
  }, []);

  /* ---------- 1v1 HISTORY ---------- */
  useEffect(() => {
    api
      .get(`/1v1/history`)
      .then((res) => setBattleStats(res.data))
      .catch((err) => console.error(err));
  }, []);

  const formatDateTime = (date) =>
    new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8 space-y-10">

      {/* ================= 1v1 STATS ================= */}
      <section>
        <h2 className="text-2xl font-bold mb-4">⚔️ 1v1 Battle Stats</h2>

        {!battleStats && (
          <p className="text-gray-400">No 1v1 battles played yet</p>
        )}

        {battleStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Matches" value={battleStats.totalMatches} />
            <StatCard label="Wins" value={battleStats.wins} color="text-green-400" />
            <StatCard label="Losses" value={battleStats.losses} color="text-red-400" />
            <StatCard label="Solved" value={battleStats.solved} />
          </div>
        )}
      </section>

      {/* ================= PRACTICE ================= */}
      <section>
        <h1 className="text-3xl font-bold mb-6">📘 Practice History</h1>

        {practiceHistory.length === 0 && (
          <p className="text-gray-400">No solved questions yet</p>
        )}

        <div className="grid gap-4">
          {practiceHistory.map((h) => (
            <div
              key={h._id}
              onClick={() =>
                navigate(
                  `/practice/${h.difficulty}/${h.order}?language=${h.language}`
                )
              }
              className="cursor-pointer p-4 bg-white/10 rounded hover:bg-white/20 transition"
            >
              <div className="text-sm text-gray-400">
                {h.language.toUpperCase()} • {h.difficulty.toUpperCase()}
              </div>
              <div className="font-semibold">{h.title}</div>

              <div className="text-xs text-gray-400 mt-1">
                Solved at {formatDateTime(h.createdAt)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ---------- SMALL COMPONENT ---------- */
function StatCard({ label, value, color = "text-white" }) {
  return (
    <div className="bg-white/10 rounded-lg p-4 text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
}
