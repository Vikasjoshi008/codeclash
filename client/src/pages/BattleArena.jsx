import { useNavigate } from "react-router-dom";

const BattleArena = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>⚔️ CodeClash Battle Arena</h1>
      <p>Welcome! You are successfully logged in.</p>

      <div style={{ marginTop: "30px" }}>
        <button
          style={{ marginRight: "15px" }}
          onClick={() => alert("Battle coming soon 🚀")}
        >
          Start Battle
        </button>

        <button onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default BattleArena;
