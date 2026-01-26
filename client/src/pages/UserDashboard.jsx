import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function UserDashboard() {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    api.get(`/history/${userId}`)
      .then(res => setHistory(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Your Solved Questions</h1>

      {history.length === 0 && (
        <p className="text-gray-400">No solved questions yet</p>
      )}

      <div className="grid gap-4">
        {history.map(h => (
          <div
            key={h._id}
            onClick={() =>
              navigate(
                `/practice/${h.difficulty}/${h.order}?language=${h.language}`
              )
            }
            className="cursor-pointer p-4 bg-white/10 rounded hover:bg-white/20"
          >
            <div className="text-sm text-gray-400">
              {h.language.toUpperCase()} • {h.difficulty.toUpperCase()}
            </div>
            <div className="font-semibold">{h.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
