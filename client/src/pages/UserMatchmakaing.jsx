import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function OneVOneLobby({ currentUser }) {
  const navigate = useNavigate();

  const [language, setLanguage] = useState("python");
  const [difficulty, setDifficulty] = useState("easy");
  const [status, setStatus] = useState("IDLE"); // IDLE | SEARCHING
  const [error, setError] = useState("");

  // 🔁 Polling effect
  useEffect(() => {
    if (status !== "SEARCHING") return;

    const interval = setInterval(async () => {
      try {
        const res = await axios.get("/api/1v1/status", {
          params: { userId: currentUser._id },
        });

        if (res.data.state === "IN_MATCH") {
          clearInterval(interval);
          navigate(`/1v1/match/${res.data.matchId}`);
        }
      } catch (err) {
        console.error(err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [status, currentUser._id, navigate]);

  // ▶️ Start 1v1
  const startMatch = async () => {
    try {
      setError("");
      setStatus("SEARCHING");

      await axios.post("/api/1v1/start", {
        userId: currentUser._id,
        username: currentUser.username,
        language,
        difficulty,
      });
    } catch (err) {
      setStatus("IDLE");
      setError(err.response?.data?.message || "Failed to start match");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>⚔️ 1v1 Coding Challenge</h2>

      {status === "IDLE" && (
        <>
          <label>Language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
          </select>

          <br /><br />

          <label>Difficulty</label>
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
        <h3>🔍 Searching for opponent...</h3>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default OneVOneLobby;
