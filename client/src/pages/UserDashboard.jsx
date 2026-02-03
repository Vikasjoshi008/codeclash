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
    <div className="min-h-screen bg-[#020617] text-white px-4 sm:px-6 py-8 space-y-12">

      {/* ================= 1v1 STATS ================= */}
      <section className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-6">
          ⚔️ 1v1 Battle Stats
        </h2>

        {!battleStats && (
          <p className="text-gray-400">No 1v1 battles played yet</p>
        )}

        {battleStats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Matches" value={battleStats.totalMatches} />
            <StatCard
              label="Wins"
              value={battleStats.wins}
              color="text-green-400"
            />
            <StatCard
              label="Losses"
              value={battleStats.losses}
              color="text-red-400"
            />
            <StatCard label="Solved" value={battleStats.solved} />
          </div>
        )}
      </section>

      {/* ================= PRACTICE HISTORY ================= */}
      <section className="max-w-6xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-6">
          📘 Practice History
        </h1>

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
              className="group cursor-pointer rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-5 transition-all duration-200 hover:bg-white/15 hover:shadow-lg hover:shadow-indigo-500/10"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mb-1">
                <span className="uppercase tracking-wide">
                  {h.language}
                </span>
                <span>•</span>
                <span className="uppercase tracking-wide">
                  {h.difficulty}
                </span>
              </div>

              <div className="font-semibold text-lg group-hover:text-indigo-400 transition">
                {h.title}
              </div>

              <div className="text-xs text-gray-400 mt-2">
                Solved at {formatDateTime(h.createdAt)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ---------- STAT CARD ---------- */
function StatCard({ label, value, color = "text-white" }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-5 text-center transition hover:bg-white/10">
      <div className={`text-3xl font-extrabold ${color}`}>
        {value}
      </div>
      <div className="text-sm text-gray-400 mt-1">
        {label}
      </div>
    </div>
  );
}
