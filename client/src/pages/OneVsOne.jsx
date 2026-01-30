import React,{ useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const OneVsOne = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // ✅ ALL hooks MUST be declared BEFORE any return
  const [language, setLanguage] = useState("python");
  const [difficulty, setDifficulty] = useState("easy");
  const [status, setStatus] = useState("IDLE");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || status !== "SEARCHING") return;

    const interval = setInterval(async () => {
      try {
        const res = await axios.get("/api/1v1/status", {
          params: { userId: user.id }, // your backend uses `id`, not `_id`
        });

        if (res.data.state === "IN_MATCH") {
          clearInterval(interval);
          navigate(`/battle/1v1/match/${res.data.matchId}`);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [status, user, navigate]);

  // ✅ CONDITIONAL RENDERING COMES AFTER ALL HOOKS
  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <p>Please login again</p>;
  }

  const startMatch = async () => {
    try {
      setError("");
      setStatus("SEARCHING");

      await axios.post("/api/1v1/start", {
        userId: user.id,
        username: user.username,
        language,
        difficulty,
      });
    } catch (err) {
      setStatus("IDLE");
      setError(err.response?.data?.message || "Failed to start match");
    }
  };

  const cancelSearch = async () => {
  await axios.post("/api/1v1/cancel", {
    userId: user.id,
  });
  setStatus("IDLE");
};


  return (
    <div style={{ padding: "40px", textAlign: "center" }} className="text-white">
      <h1>⚔️ 1v1 Code Battle</h1>

      {status === "IDLE" && (
        <>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
          </select>

          <br /><br />

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <br /><br />

          <button onClick={startMatch}>Start 1v1</button>
        </>
      )}

      {status === "SEARCHING" && (
        <>
          <p>🔍 Searching for opponent...</p>
          <button onClick={cancelSearch}>Cancel</button>
        </>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default OneVsOne;
