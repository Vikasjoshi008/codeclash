import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>🔥 CodeClash Dashboard</h1>
      <p>Choose how you want to compete</p>

      <div style={{ marginTop: "30px" }}>
        <div style={cardStyle} onClick={() => navigate("/battle/1v1")}>
          ⚔️ Join 1v1 Code Battle
        </div>

        <div style={cardStyle} onClick={() => navigate("/practice")}>
          🧩 Practice Coding Problems
        </div>
      </div>

      <button style={{ marginTop: "30px" }} onClick={logout}>
        Logout
      </button>
    </div>
  );
};

const cardStyle = {
  padding: "20px",
  margin: "15px 0",
  background: "#1f2937",
  color: "#fff",
  borderRadius: "10px",
  cursor: "pointer"
};

export default Dashboard;
