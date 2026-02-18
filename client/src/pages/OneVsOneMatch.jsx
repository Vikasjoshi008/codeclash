// import React, { useEffect, useState, useRef } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import socket from "../socket";
// import api from "../services/api";
// import { useAuth } from "../context/AuthContext";
// import Editor from "@monaco-editor/react";

// const OneVsOneMatch = () => {
//   const { matchId } = useParams();
//   const navigate = useNavigate();
//   const { user } = useAuth();

//   const [state, setState] = useState("MATCHED");
//   const [ready, setReady] = useState(false);
//   const [problem, setProblem] = useState(null);
//   const [players, setPlayers] = useState([]);

//   const [code, setCode] = useState("");
//   const [language] = useState("python");

//   const [submitted, setSubmitted] = useState(false);
//   const [opponentSubmitted, setOpponentSubmitted] = useState(false);
//   const [result, setResult] = useState(null);

//   const [timeLeft, setTimeLeft] = useState(0);
//   const [aiResult, setAiResult] = useState(null);

//   const timerRef = useRef(null);

//   useEffect(() => {
//     if (!user || !matchId) return;

//     socket.emit("registerUser", { userId: user.id });
//     socket.emit("joinMatch", { matchId, userId: user.id });
//   }, [user, matchId]);

//   /* ================= FETCH PLAYERS ================= */
//   useEffect(() => {
//     if (!matchId) return;

//     api
//       .get(`/matches/${matchId}`)
//       .then((res) => setPlayers(res.data.players || []))
//       .catch(() => {});
//   }, [matchId]);

//   /* ================= SOCKET EVENTS ================= */
//   useEffect(() => {
//     if (!user) return;

//     const handleMatchFound = ({ players }) => {
//       setPlayers(players);
//     };

//     const handleMatchUpdate = ({ state }) => {
//       setState(state);
//     };

//     const handleProblemAssigned = async ({ problemId }) => {
//       const res = await api.get(`/problems/${problemId}`);
//       setProblem(res.data);
//       setCode(res.data.starterCode?.[language] || "");
//     };

//     const handleMatchStarted = async ({ startedAt, duration }) => {
//       clearInterval(timerRef.current);
//       setState("IN_PROGRESS");

//       try {
//         const res = await api.get(`/matches/${matchId}`);
//         setPlayers(res.data.players || []);
//       } catch {}

//       const startTime = new Date(startedAt).getTime();
//       const totalDuration = Number(duration) || 15 * 60 * 1000;

//       if (!startTime || isNaN(startTime)) return;

//       timerRef.current = setInterval(() => {
//         const elapsed = Date.now() - startTime;
//         const remaining = totalDuration - elapsed;
//         setTimeLeft(Math.max(0, remaining));
//       }, 1000);
//     };

//     const handleSubmissionUpdate = ({ userId }) => {
//       if (userId !== user.id) {
//         setOpponentSubmitted(true);
//       }
//     };

//     const handleOpponentLeft = () => {
//       clearInterval(timerRef.current);
//       setResult("WIN");
//     };

//     const handleMatchResult = ({ winner }) => {
//       clearInterval(timerRef.current);
//       setResult(winner === user.id ? "WIN" : "LOSE");
//     };

//     const handleAIResult = (data) => {
//       setAiResult(data);
//     };

//     socket.on("matchFound", handleMatchFound);
//     socket.on("matchUpdate", handleMatchUpdate);
//     socket.on("problemAssigned", handleProblemAssigned);
//     socket.on("matchStarted", handleMatchStarted);
//     socket.on("submissionUpdate", handleSubmissionUpdate);
//     socket.on("opponentLeft", handleOpponentLeft);
//     socket.on("matchResult", handleMatchResult);
//     socket.on("aiResult", handleAIResult);

//     return () => {
//       socket.off("matchFound", handleMatchFound);
//       socket.off("matchUpdate", handleMatchUpdate);
//       socket.off("problemAssigned", handleProblemAssigned);
//       socket.off("matchStarted", handleMatchStarted);
//       socket.off("submissionUpdate", handleSubmissionUpdate);
//       socket.off("opponentLeft", handleOpponentLeft);
//       socket.off("matchResult", handleMatchResult);
//       socket.off("aiResult", handleAIResult);

//       clearInterval(timerRef.current);
//     };
//   }, [user, language]);

//   const leaveMatch = () => {
//     socket.emit("leaveMatch", {
//       matchId,
//       userId: user.id,
//     });

//     navigate("/battle/1v1");
//   };

//   /* ================= EXIT CONFIRM ================= */
//   useEffect(() => {
//     const handleBeforeUnload = (e) => {
//       if (state === "IN_PROGRESS" && !result) {
//         e.preventDefault();
//         e.returnValue = "Leaving will count as loss.";
//       }
//     };

//     window.addEventListener("beforeunload", handleBeforeUnload);

//     return () => window.removeEventListener("beforeunload", handleBeforeUnload);
//   }, [state, result]);

//   /* ================= ACTIONS ================= */
//   const markReady = () => {
//     console.log("Emitting playerReady", matchId, user.id);
//     socket.emit("playerReady", { matchId, userId: user.id });
//     setReady(true);
//   };

//   const submitCode = () => {
//     if (submitted || state !== "IN_PROGRESS") return;

//     if (!code || !code.trim()) {
//       alert("You did not write any code.");
//       return;
//     }

//     setSubmitted(true);
//     clearInterval(timerRef.current);

//     socket.emit("submitCode", {
//       matchId,
//       userId: user.id,
//       code,
//       language,
//     });
//   };

//   if (!user) return null;

//   return (
//     <div className="min-h-screen bg-[#020617] text-white px-4 py-6">
//       <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 h-[85vh]">
//         {/* LEFT SIDE */}
//         <div className="rounded-2xl bg-white/5 p-6 flex flex-col">
//           {!problem ? (
//             <div className="flex-1 flex flex-col items-center justify-center">
//               {!ready ? (
//                 <button
//                   onClick={markReady}
//                   className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700"
//                 >
//                   Ready
//                 </button>
//               ) : (
//                 <p>Waiting for opponent...</p>
//               )}
//             </div>
//           ) : (
//             <>
//               {state === "IN_PROGRESS" && (
//                 <p className="text-yellow-400 text-center mb-3">
//                   ⏱ {Math.floor(timeLeft / 60000)}:
//                   {String(Math.floor((timeLeft % 60000) / 1000)).padStart(
//                     2,
//                     "0",
//                   )}
//                 </p>
//               )}

//               {players.length === 2 && (
//                 <h2 className="text-center font-bold mb-3">
//                   {players[0].username} vs {players[1].username}
//                 </h2>
//               )}

//               <h2 className="text-xl font-bold">{problem.title}</h2>
//               <p className="text-gray-300 mt-2 whitespace-pre-line">
//                 {problem.description}
//               </p>
//             </>
//           )}
//         </div>

//         {/* RIGHT SIDE */}
//         <div className="rounded-2xl bg-white/5 p-4 flex flex-col">
//           <Editor
//             theme="vs-dark"
//             height="100%"
//             defaultLanguage={language}
//             value={code}
//             onChange={(value) => setCode(value || "")}
//             options={{ readOnly: submitted }}
//           />

//           <button
//             onClick={submitCode}
//             disabled={submitted || state !== "IN_PROGRESS"}
//             className="mt-4 py-3 bg-green-600 hover:bg-green-700 rounded-xl"
//           >
//             {submitted ? "Submitted" : "Submit"}
//           </button>

//           {opponentSubmitted && !result && (
//             <p className="text-blue-400 text-center mt-2">Opponent submitted</p>
//           )}

//           {result && (
//             <p className="text-center text-2xl font-bold mt-4">
//               {result === "WIN" ? "🎉 You Won!" : "😢 You Lost"}
//             </p>
//           )}

//           {aiResult?.players && (
//             <p className="text-gray-400 text-sm">
//               You finished in{" "}
//               {aiResult.players.find((p) => p.userId === user.id)?.timeTaken}{" "}
//               seconds
//             </p>
//           )}

//           {result && (
//             <button
//               onClick={leaveMatch}
//               className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-xl"
//             >
//               Leave Match
//             </button>
//           )}
//         </div>
//       </div>
//       {/* AI ANALYSIS */}
//       {aiResult && (
//         <div className="max-w-7xl mx-auto mt-8 bg-purple-900/30 border border-purple-500/20 p-6 rounded-2xl">
//           <h3 className="text-xl font-bold mb-4">🤖 AI Match Summary</h3>

//           <p className="text-gray-200 leading-relaxed">{aiResult.commentary}</p>

//           <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
//             {aiResult.players?.map((p) => (
//               <div key={p.userId} className="bg-white/5 p-4 rounded-xl">
//                 <p className="font-semibold">
//                   {p.userId === user.id ? "You" : "Opponent"}
//                 </p>
//                 <p>
//                   Score: {p.passed}/{p.total}
//                 </p>
//                 <p>Time: {p.timeTaken}s</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default OneVsOneMatch;

import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../socket";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Editor from "@monaco-editor/react";

const OneVsOneMatch = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [state, setState] = useState("MATCHED");
  const [ready, setReady] = useState(false);
  const [problem, setProblem] = useState(null);
  const [players, setPlayers] = useState([]);

  const [code, setCode] = useState("");
  const [language] = useState("python");

  const [submitted, setSubmitted] = useState(false);
  const [opponentSubmitted, setOpponentSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  const [timeLeft, setTimeLeft] = useState(0);
  const [aiResult, setAiResult] = useState(null);

  const timerRef = useRef(null);

  /* ================= SOCKET CONNECT ================= */
  useEffect(() => {
    if (!user || !matchId) return;

    // if (!socket.connected) {
    //   socket.connect();
    // }

    socket.emit("registerUser", { userId: user.id });
    socket.emit("joinMatch", { matchId });
  }, [user, matchId]);

  /* ================= FETCH PLAYERS ================= */
  useEffect(() => {
    if (!matchId) return;

    api
      .get(`/matches/${matchId}`)
      .then((res) => setPlayers(res.data.players || []))
      .catch(() => {});
  }, [matchId]);

  /* ================= SOCKET EVENTS ================= */
  useEffect(() => {
    if (!user) return;

    const handleMatchFound = async ({ matchId }) => {
      try {
        const res = await api.get(`/matches/${matchId}`);
        setPlayers(res.data.players || []);
      } catch {}
    };

    const handleProblemAssigned = async ({ problemId }) => {
      const res = await api.get(`/problems/${problemId}`);
      setProblem(res.data);
      setCode(res.data.starterCode?.[language] || "");
    };

    const handleMatchStarted = async ({ startedAt, duration }) => {
      setState("IN_PROGRESS");

      try {
        const res = await api.get(`/matches/${matchId}`);
        console.log("Players loaded:", res.data.players);
        setPlayers(res.data.players || []);
      } catch (err) {
        console.log(err);
      }

      const startTime = new Date(startedAt).getTime();
      const totalDuration = Number(duration) || 15 * 60 * 1000;

      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = totalDuration - elapsed;
        setTimeLeft(Math.max(0, remaining));
      }, 1000);
    };

    const handleSubmissionUpdate = ({ userId }) => {
      if (userId !== user.id) {
        setOpponentSubmitted(true);
      }
    };

    const handleOpponentLeft = ({ winner }) => {
      clearInterval(timerRef.current);

      if (winner === user.id) {
        setResult("WIN_FORFEIT");
      } else {
        setResult("LOSE_FORFEIT");
      }
    };

    const handleMatchResult = ({ winner, tie }) => {
      clearInterval(timerRef.current);
      if (tie) {
        setResult("TIE");
      } else {
        setResult(winner === user.id ? "WIN" : "LOSE");
      }
    };

    const handleAIResult = (data) => {
      setAiResult(data);
    };

    socket.on("matchFound", handleMatchFound);
    socket.on("problemAssigned", handleProblemAssigned);
    socket.on("matchStarted", handleMatchStarted);
    socket.on("submissionUpdate", handleSubmissionUpdate);
    socket.on("matchResult", handleMatchResult);
    socket.on("opponentLeft", handleOpponentLeft);
    socket.on("aiResult", handleAIResult);

    return () => {
      socket.off("matchFound", handleMatchFound);
      socket.off("problemAssigned", handleProblemAssigned);
      socket.off("matchStarted", handleMatchStarted);
      socket.off("submissionUpdate", handleSubmissionUpdate);
      socket.off("matchResult", handleMatchResult);
      socket.off("opponentLeft", handleOpponentLeft);
      socket.off("aiResult", handleAIResult);
      clearInterval(timerRef.current);
    };
  }, [user, matchId, language]);

  /* ================= ACTIONS ================= */
  const markReady = () => {
    socket.emit("playerReady", { matchId, userId: user.id });
    setReady(true);
  };

  const submitCode = () => {
    if (submitted || state !== "IN_PROGRESS") return;

    if (!code.trim()) {
      alert("You did not write any code.");
      return;
    }

    setSubmitted(true);
    clearInterval(timerRef.current);

    socket.emit("submitCode", {
      matchId,
      userId: user.id,
      code,
      language,
    });
  };

  const leaveMatch = () => {
    socket.emit("leaveMatch", { matchId, userId: user.id });
    navigate("/battle/1v1");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#020617] text-white px-4 py-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* MATCH GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT SIDE */}
          <div className="rounded-2xl bg-white/5 p-6">
            {!problem ? (
              <div className="flex items-center justify-center h-full">
                {!ready ? (
                  <button
                    onClick={markReady}
                    className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700"
                  >
                    Ready
                  </button>
                ) : (
                  <p>Waiting for opponent...</p>
                )}
              </div>
            ) : (
              <>
                {state === "IN_PROGRESS" && (
                  <p className="text-yellow-400 text-center mb-4">
                    ⏱ {Math.floor(timeLeft / 60000)}:
                    {String(Math.floor((timeLeft % 60000) / 1000)).padStart(
                      2,
                      "0",
                    )}
                  </p>
                )}

                {players.length === 2 && (
                  <div className="flex justify-center items-center gap-4 text-lg font-semibold mb-4">
                    <span>{players[0]?.name || "Player 1"}</span>
                    <span className="text-gray-500">VS</span>
                    <span>{players[1]?.name || "Player 2"}</span>
                  </div>
                )}

                <h2 className="text-xl font-bold">{problem.title}</h2>
                <p className="text-gray-300 mt-3 whitespace-pre-line">
                  {problem.description}
                </p>
              </>
            )}
          </div>

          {/* RIGHT SIDE */}
          <div className="rounded-2xl bg-white/5 p-4 flex flex-col">
            <Editor
              theme="vs-dark"
              height="60vh"
              defaultLanguage={language}
              value={code}
              onChange={(value) => setCode(value || "")}
              options={{ readOnly: submitted }}
            />

            <button
              onClick={submitCode}
              disabled={submitted || state !== "IN_PROGRESS"}
              className="mt-4 py-3 bg-green-600 hover:bg-green-700 rounded-xl"
            >
              {submitted ? "Submitted" : "Submit"}
            </button>

            {opponentSubmitted && !result && (
              <p className="text-blue-400 text-center mt-2">
                Opponent submitted
              </p>
            )}

            {result && (
              <div className="mt-6 text-center space-y-2">
                <h2
                  className={`text-3xl font-bold ${
                    result === "WIN" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {result === "WIN" ? "🎉 You Won!" : "😢 You Lost"}
                </h2>

                {result === "TIE" && (
                  <h2 className="text-yellow-400 text-3xl font-bold">
                    🤝 Match Tied
                  </h2>
                )}
                
                {result === "WIN_FORFEIT" && (
                  <h2 className="text-green-400 text-3xl font-bold mt-6">
                    🎉 Opponent Left — You Win!
                  </h2>
                )}

                {result === "LOSE_FORFEIT" && (
                  <h2 className="text-red-400 text-3xl font-bold mt-6">
                    ❌ You Left — You Lost
                  </h2>
                )}

                {aiResult?.players && (
                  <p className="text-gray-400 text-sm">
                    You finished in{" "}
                    {aiResult.players.find((p) => p.userId === user.id)
                      ?.timeTaken ?? 0}
                    s
                  </p>
                )}

                <button
                  onClick={leaveMatch}
                  className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-xl"
                >
                  Leave Match
                </button>
              </div>
            )}
          </div>
        </div>

        {/* AI SUMMARY FULL WIDTH */}
        {aiResult && (
          <div className="bg-purple-900/40 border border-purple-500/20 p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-bold mb-3">🤖 Match Summary</h3>

            <p className="text-gray-200 leading-relaxed break-words whitespace-pre-line mb-6">
              {aiResult.commentary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiResult.players?.map((p) => (
                <div
                  key={p.userId}
                  className="bg-white/5 p-4 rounded-xl border border-white/10"
                >
                  <p className="font-semibold text-lg mb-2">
                    {p.userId === user.id ? "You" : "Opponent"}
                  </p>
                  <p className="text-sm text-gray-400">
                    Score: {p.passed}/{p.total}
                  </p>
                  <p className="text-sm text-gray-400">Time: {p.timeTaken}s</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OneVsOneMatch;
