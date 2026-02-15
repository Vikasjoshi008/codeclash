import React, { useEffect, useState } from "react";
import api from "../services/api";
import socket from "../socket";

export default function UserDashboard() {
  const [battleStats, setBattleStats] = useState(null);
  const [practiceHistory, setPracticeHistory] = useState([]);

  /* FETCH PRACTICE */
  useEffect(() => {
    api.get(`/history`)
      .then((res) => setPracticeHistory(res.data))
      .catch(() => {});
  }, []);

  /* FETCH 1v1 STATS */
  const loadStats = () => {
    api.get(`/1v1/history`)
      .then((res) => setBattleStats(res.data))
      .catch(() => {});
  };

  useEffect(() => {
    loadStats();
  }, []);

  /* LIVE REFRESH */
  useEffect(() => {
    socket.on("statsRefresh", () => {
      loadStats();
    });

    return () => socket.off("statsRefresh");
  }, []);

  const StatCard = ({ label, value, color = "text-white" }) => (
    <div className="rounded-xl bg-white/5 p-5 text-center">
      <div className={`text-3xl font-bold ${color}`}>
        {value ?? 0}
      </div>
      <div className="text-gray-400 text-sm mt-1">
        {label}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white px-6 py-8 space-y-10">

      {/* 1v1 STATS */}
      <section className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">
          ⚔️ 1v1 Battle Stats
        </h2>

        {battleStats ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Matches" value={battleStats.totalMatches} />
            <StatCard label="Wins" value={battleStats.wins} color="text-green-400" />
            <StatCard label="Losses" value={battleStats.losses} color="text-red-400" />
            <StatCard label="Solved" value={battleStats.solved} />
          </div>
        ) : (
          <p className="text-gray-400">No 1v1 matches yet</p>
        )}
      </section>

      {/* PRACTICE HISTORY */}
      <section className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">
          📘 Practice History
        </h2>

        {practiceHistory.length === 0 ? (
          <p className="text-gray-400">No solved questions yet</p>
        ) : (
          practiceHistory.map((h) => (
            <div key={h._id} className="bg-white/5 p-4 rounded-xl mb-3">
              <div className="font-semibold">{h.title}</div>
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
