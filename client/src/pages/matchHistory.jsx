import React, { useEffect, useState } from "react";
import api from "../services/api";

const MatchHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.get("/1v1/history/details")
      .then((res) => setHistory(res.data))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">

        <h2 className="text-3xl font-bold mb-8">
          🏆 Match History
        </h2>

        {history.length === 0 ? (
          <p>No matches played yet</p>
        ) : (
          <div className="space-y-4">
            {history.map((m) => (
              <div
                key={m.matchId}
                className="bg-white/5 p-5 rounded-xl border border-white/10"
              >
                <div className="flex justify-between items-center">

                  <div>
                    <h3 className="font-semibold text-lg">
                      {m.problemTitle}
                    </h3>
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchHistory;
