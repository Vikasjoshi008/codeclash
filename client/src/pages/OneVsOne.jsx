import React, { useEffect, useState } from "react";
import socket from "../socket";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const OneVsOne = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [language, setLanguage] = useState("python");
  const [difficulty, setDifficulty] = useState("easy");
  const [status, setStatus] = useState("IDLE");
  const [error, setError] = useState("");

  /* ✅ CONNECT SOCKET ONCE */
  useEffect(() => {
    socket.on("searching", () => {
      console.log("Searching for opponent...");
    });

    socket.on("matchFound", ({ matchId }) => {
      setStatus("MATCHED");
      navigate(`/battle/1v1/match/${matchId}`);
    });

    socket.on("matchError", (msg) => {
      setStatus("IDLE");
      setError(msg);
    });

    socket.on("matchCancelled", (msg) => {
      setStatus("IDLE");
      alert(msg);
    });

    return () => {
      socket.off("searching");
      socket.off("matchFound");
      socket.off("matchError");
      socket.off("matchCancelled");
    };
  }, [navigate]);

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>Please login again</p>;

  const startMatch = async () => {
    try {
      setError("");
      setStatus("SEARCHING");

      // ✅ correct API call (goes to Render backend)
      await api.post("/1v1/start");

      // ✅ socket matchmaking
      socket.emit("findMatch", {
        userId: user.id,
        language,
        difficulty,
      });
    } catch (err) {
      console.error(err);
      setStatus("IDLE");
      setError("Failed to start match");
    }
  };

  return (
    <div
      style={{ padding: "40px", textAlign: "center" }}
      className="text-white"
    >
      <h1>⚔️ 1v1 Code Battle</h1>

      {status === "IDLE" && (
        <>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
          </select>

          <br />
          <br />

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <br />
          <br />

          <button onClick={startMatch}>Start 1v1</button>
        </>
      )}

      {status === "SEARCHING" && <p>🔍 Searching for opponent...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default OneVsOne;
