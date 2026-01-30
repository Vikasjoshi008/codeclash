// import React, { useEffect, useState } from "react";
// import socket from "../socket";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// const OneVsOne = () => {
//   const navigate = useNavigate();
//   const { user, loading } = useAuth();

//   // ✅ ALL hooks MUST be declared BEFORE any return
//   const [language, setLanguage] = useState("python");
//   const [difficulty, setDifficulty] = useState("easy");
//   const [status, setStatus] = useState("IDLE");
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (!user || status !== "SEARCHING") return;
//     socket.connect();

//     const interval = setInterval(async () => {
//       try {
//         const res = await axios.get("/api/1v1/status", {
//           params: { userId: user.id }, // your backend uses `id`, not `_id`
//         });

//         if (res.data.state === "IN_MATCH") {
//           socket.on("matchFound", ({ matchId }) => {
//             setStatus("MATCHED");
//             navigate(`/1v1/match/${matchId}`);
//           });
//         }
//       } catch (err) {
//         console.error("Polling error:", err);
//       }
//     }, 2000);

//     return () => {
//       clearInterval(interval);
//       socket.disconnect();
//     };
//   }, [status, user, navigate]);

//   useEffect(() => {
//   socket.on("searching", () => {
//     console.log("Searching for opponent...");
//   });

//   socket.on("matchFound", ({ matchId }) => {
//     navigate(`/battle/1v1/match/${matchId}`);
//   });

//   socket.on("matchError", (msg) => {
//     alert(msg);
//   });

//   socket.on("matchCancelled", (msg) => {
//     alert(msg);
//   });

//   return () => {
//     socket.off("searching");
//     socket.off("matchFound");
//     socket.off("matchError");
//     socket.off("matchCancelled");
//   };
// }, []);


//   // ✅ CONDITIONAL RENDERING COMES AFTER ALL HOOKS
//   if (loading) {
//     return <p>Loading...</p>;
//   }

//   if (!user) {
//     return <p>Please login again</p>;
//   }

//   const startMatch = async () => {
//     try {
//       setError("");
//       setStatus("SEARCHING");

//       await axios.post("/api/1v1/start");
//       socket.emit("findMatch", {
//         userId,
//         language,
//         difficulty,
//       });
//     } catch (err) {
//       setStatus("IDLE");
//       setError(err.response?.data?.message || "Failed to start match");
//     }
//   };

//   const cancelSearch = async () => {
//     await axios.post("/api/1v1/cancel", {
//       userId: user.id,
//     });
//     setStatus("IDLE");
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
//         <>
//           <p>🔍 Searching for opponent...</p>
//           <button onClick={cancelSearch}>Cancel</button>
//         </>
//       )}

//       {error && <p style={{ color: "red" }}>{error}</p>}
//     </div>
//   );
// };

// export default OneVsOne;


import React, { useEffect, useState } from "react";
import socket from "../socket";
import axios from "axios";
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
    socket.connect();

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
      socket.disconnect();
    };
  }, [navigate]);

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>Please login again</p>;

  const startMatch = async () => {
    try {
      setError("");
      setStatus("SEARCHING");

      await axios.post("/api/1v1/start");

      socket.emit("findMatch", {
        userId: user.id,
        language,
        difficulty
      });
    } catch (err) {
      setStatus("IDLE");
      setError("Failed to start match");
    }
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

          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <br /><br />

          <button onClick={startMatch}>Start 1v1</button>
        </>
      )}

      {status === "SEARCHING" && <p>🔍 Searching for opponent...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default OneVsOne;
