// import React, { useEffect, useState } from "react";
// import socket from "../socket";
// import api from "../services/api";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// const OneVsOne = () => {
//   const navigate = useNavigate();
//   const { user, loading } = useAuth();

//   const [language, setLanguage] = useState("python");
//   const [difficulty, setDifficulty] = useState("easy");
//   const [status, setStatus] = useState("IDLE");
//   const [error, setError] = useState("");
//   const [searchTimeout, setSearchTimeout] = useState(null);
//   const [noOpponent, setNoOpponent] = useState(false);

//   /* ✅ CONNECT SOCKET ONCE */
//   useEffect(() => {
//     socket.on("searching", () => {
//       console.log("Searching for opponent...");
//     });

//     socket.on("matchFound", ({ matchId }) => {
//       if (searchTimeout) clearTimeout(searchTimeout);

//       setNoOpponent(false);
//       setStatus("MATCHED");
//       navigate(`/battle/1v1/match/${matchId}`);
//     });

//     socket.on("matchError", (msg) => {
//       setStatus("IDLE");
//       setError(msg);
//     });

//     socket.on("matchCancelled", (msg) => {
//       setStatus("IDLE");
//       alert(msg);
//     });

//     return () => {
//       socket.off("searching");
//       socket.off("matchFound");
//       socket.off("matchError");
//       socket.off("matchCancelled");
//     };
//   }, [navigate, searchTimeout]);

//   if (loading) return <p>Loading...</p>;
//   if (!user) return <p>Please login again</p>;

//   const startMatch = async () => {
//     try {
//       setError("");
//       setNoOpponent(false);
//       setStatus("SEARCHING");

//       // ✅ correct API call (goes to Render backend)
//       await api.post("/1v1/start");

//       // ✅ socket matchmaking
//       socket.emit("findMatch", {
//         userId: user.id,
//         language,
//         difficulty,
//       });

//       const timeout = setTimeout(() => {
//         setStatus("IDLE");
//         setNoOpponent(true);
//       }, 12000);

//       setSearchTimeout(timeout);
//     } catch (err) {
//       console.error(err);
//       setStatus("IDLE");
//       setError("Failed to start match");
//     }
//   };

//   return (
//     <div
//       style={{ padding: "40px", textAlign: "center" }}
//       className="text-white"
//     >
//       <h1>⚔️ 1v1 Code Battle</h1>

//       {status === "IDLE" && (
//         <>
//           <select
//             value={language}
//             onChange={(e) => setLanguage(e.target.value)}
//           >
//             <option value="python">Python</option>
//             <option value="javascript">JavaScript</option>
//             <option value="java">Java</option>
//           </select>

//           <br />
//           <br />

//           <select
//             value={difficulty}
//             onChange={(e) => setDifficulty(e.target.value)}
//           >
//             <option value="easy">Easy</option>
//             <option value="medium">Medium</option>
//             <option value="hard">Hard</option>
//           </select>

//           <br />
//           <br />

//           <button onClick={startMatch}>Start 1v1</button>
//         </>
//       )}

//       {status === "SEARCHING" && (
//         <p className="text-yellow-400">🔍 Searching for opponent...</p>
//       )}

//       {noOpponent && (
//         <p className="text-red-400 mt-3">
//           😔 Sorry, no opponents available right now.
//         </p>
//       )}

//       {noOpponent && (
//         <button
//           className="mt-3 px-4 py-2 bg-indigo-600 rounded"
//           onClick={startMatch}
//         >
//           Try Again
//         </button>
//       )}

//       {error && <p style={{ color: "red" }}>{error}</p>}
//     </div>
//   );
// };

// export default OneVsOne;

import React, { useEffect, useState } from "react";
import socket from "../socket";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const OneVsOne = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [language, setLanguage] = useState("python");
  const [difficulty, setDifficulty] = useState("easy");
  const [status, setStatus] = useState("IDLE");
  const [error, setError] = useState("");
  const [noOpponent, setNoOpponent] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  /* ================= SOCKET ================= */
  useEffect(() => {
    socket.on("searching", () => {
      console.log("Searching for opponent...");
    });

    socket.on("matchFound", ({ matchId }) => {
      if (searchTimeout) clearTimeout(searchTimeout);
      setNoOpponent(false);
      setStatus("MATCHED");
      navigate(`/battle/1v1/match/${matchId}`);
    });

    socket.on("matchError", (msg) => {
      if (searchTimeout) clearTimeout(searchTimeout);
      setStatus("IDLE");
      setError(msg);
    });

    socket.on("matchCancelled", (msg) => {
      if (searchTimeout) clearTimeout(searchTimeout);
      setStatus("IDLE");
      alert(msg);
    });

    return () => {
      socket.off("searching");
      socket.off("matchFound");
      socket.off("matchError");
      socket.off("matchCancelled");
    };
  }, [navigate, searchTimeout]);

  if (loading) return <p className="text-white text-center mt-20">Loading...</p>;
  if (!user) return <p className="text-white text-center mt-20">Please login</p>;

  /* ================= ACTION ================= */
  const startMatch = async () => {
    try {
      setError("");
      setNoOpponent(false);
      setStatus("SEARCHING");

      await api.post("/1v1/start");

      socket.emit("findMatch", {
        userId: user.id,
        language,
        difficulty,
      });

      const timeout = setTimeout(() => {
        setStatus("IDLE");
        setNoOpponent(true);
      }, 12000);

      setSearchTimeout(timeout);
    } catch (err) {
      setStatus("IDLE");
      setError("Failed to start match");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#020617] via-[#020617] to-[#020617] text-white">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white/5 backdrop-blur-md shadow-xl border border-white/10 animate-[fadeIn_0.4s_ease]">
        <h1 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
          ⚔️ <span>1v1 Code Battle</span>
        </h1>

        {/* SELECTS */}
        <div className="space-y-4">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full bg-[#020617] border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
          </select>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full bg-[#020617] border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* BUTTON */}
        {status === "IDLE" && (
          <button
            onClick={startMatch}
            className="mt-6 w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 font-semibold"
          >
            Start 1v1
          </button>
        )}

        {/* SEARCHING */}
        {status === "SEARCHING" && (
          <div className="mt-6 text-center text-yellow-400 animate-pulse">
            🔍 Searching for opponent<span className="animate-bounce">…</span>
          </div>
        )}

        {/* NO OPPONENT */}
        {noOpponent && (
          <div className="mt-6 text-center animate-[fadeIn_0.3s_ease]">
            <p className="text-red-400 mb-4">
              😔 Sorry, no opponents available right now.
            </p>
            <button
              onClick={startMatch}
              className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <p className="mt-4 text-center text-red-500 text-sm">{error}</p>
        )}
      </div>
    </div>
  );
};

export default OneVsOne;
