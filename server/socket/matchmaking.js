const Match = require("../models/Match");
const Problem = require("../models/Problem");
const User = require("../models/User");
const runJudge = require("../utils/piston");
const calculateElo = require("../utils/elo");
const analyzeWithAI = require("../utils/aiAnalyzer");

let onlineUsers = new Map();

/* ================= SAFE ELO ================= */
const updateElo = async (match) => {
  if (!match.winner || !match.loser) return;

  const winnerUser = await User.findById(match.winner);
  const loserUser = await User.findById(match.loser);

  if (!winnerUser || !loserUser) return;

  const { winnerNew, loserNew } = calculateElo(winnerUser.elo, loserUser.elo);

  winnerUser.elo = winnerNew;
  loserUser.elo = loserNew;

  await winnerUser.save();
  await loserUser.save();
};

/* ================= FORFEIT ================= */
const handleForfeit = async (match, leavingUserId, io) => {
  if (!match || match.state !== "IN_PROGRESS") return;

  const leaver = match.players.find(
    (p) => p.userId.toString() === leavingUserId.toString()
  );

  const opponent = match.players.find(
    (p) => p.userId.toString() !== leavingUserId.toString()
  );

  if (!opponent) return;

  match.state = "FINISHED";
  match.winner = opponent.userId;
  match.loser = leavingUserId;
  match.endedAt = new Date();

  await match.save();

  // Tell opponent they won because other left
  io.to(match._id.toString()).emit("opponentLeft", {
    loser: leavingUserId,
    winner: opponent.userId,
  });

  io.to(match._id.toString()).emit("matchResult", {
    winner: opponent.userId,
    forfeit: true,
  });

  await updateElo(match);

  // Refresh dashboard
  const sockets = [
    onlineUsers.get(opponent.userId.toString()),
    onlineUsers.get(leavingUserId.toString()),
  ];

  sockets.forEach((s) => {
    if (s) io.to(s).emit("statsRefresh");
  });
};


/* ================= MODULE ================= */
module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("New socket:", socket.id);

    socket.onAny((event, ...args) => {
      console.log("Received event:", event);
    });

    /* REGISTER USER */
    socket.on("registerUser", async ({ userId }) => {
      if (!userId) return;

      onlineUsers.set(userId.toString(), socket.id);
      io.emit("playerCount", onlineUsers.size);
    });

    /* FIND MATCH */
    socket.on("findMatch", async ({ userId, difficulty }) => {
      if (!userId || !difficulty) return;

      const user = await User.findById(userId);
      if (!user) return;

      // Try to atomically find and update
      let match = await Match.findOneAndUpdate(
        {
          state: "SEARCHING",
          difficulty,
          "players.1": { $exists: false },
        },
        {
          $push: {
            players: {
              userId,
              username: user.username,
              socketId: socket.id,
              ready: false,
            },
          },
          $set: { state: "MATCHED" },
        },
        { new: true },
      );

      if (!match) {
        // No existing match → create one
        match = await Match.create({
          difficulty,
          players: [
            {
              userId,
              username: user.username,
              socketId: socket.id,
              ready: false,
            },
          ],
          state: "SEARCHING",
        });

        socket.join(match._id.toString());
        socket.emit("searching");
        return;
      }

      socket.join(match._id.toString());

      io.to(match._id.toString()).emit("matchFound", {
        players: match.players,
        matchId: match._id,
      });
    });

    /* PLAYER READY */
    socket.on("playerReady", async ({ matchId, userId }) => {
      try {
        if (!matchId || !userId) return;

        const match = await Match.findById(matchId);
        if (!match) return;

        // Only allow ready if match is not finished
        if (["FINISHED", "CANCELLED"].includes(match.state)) return;

        // Find player
        const player = match.players.find(
          (p) => p.userId.toString() === userId.toString(),
        );
        if (!player) return;

        // Prevent double ready clicks
        if (player.ready) return;

        // Set ready
        player.ready = true;

        // If second player joined, ensure state becomes MATCHED
        if (match.players.length === 2 && match.state === "SEARCHING") {
          match.state = "MATCHED";
        }

        await match.save();

        // Re-fetch updated match
        const updatedMatch = await Match.findById(matchId);

        // If both players ready → start match
        if (
          updatedMatch.players.length === 2 &&
          updatedMatch.players.every((p) => p.ready)
        ) {
          const problem = await Problem.aggregate([
            {
              $match: {
                difficulty: updatedMatch.difficulty,
              },
            },
            { $sample: { size: 1 } },
          ]);

          if (!problem.length) {
            updatedMatch.state = "CANCELLED";
            await updatedMatch.save();
            io.to(matchId).emit("matchCancelled");
            return;
          }

          updatedMatch.state = "IN_PROGRESS";
          updatedMatch.startedAt = new Date();
          updatedMatch.problemId = problem[0]._id;

          await updatedMatch.save();

          io.to(matchId).emit("matchStarted", {
            startedAt: updatedMatch.startedAt,
            duration: updatedMatch.duration,
          });

          io.to(matchId).emit("problemAssigned", {
            problemId: problem[0]._id,
          });
        }
      } catch (err) {
        console.error("playerReady error:", err);
      }
    });

    socket.on("joinMatch", ({ matchId }) => {
      if (matchId) {
        socket.join(matchId);
      }
    });

    /* SUBMIT CODE */
    socket.on("submitCode", async ({ matchId, userId, code, language }) => {
  try {
    const match = await Match.findById(matchId).populate("problemId");
    if (!match || match.state !== "IN_PROGRESS") return;

    const player = match.players.find(
      (p) => p.userId.toString() === userId.toString()
    );
    if (!player || player.submittedAt) return;

    const starterCode =
      match.problemId?.starterCode?.[language]?.trim() || "";

    const cleanedCode = code ? code.trim() : "";

    player.timeTaken = Math.floor(
      (Date.now() - new Date(match.startedAt).getTime()) / 1000
    );

    const testCases = match.problemId?.testCases || [];

    // Only judge if meaningful
    const isMeaningful = () => {
      if (!cleanedCode) return false;
      if (cleanedCode === starterCode) return false;
      return true;
    };

    if (isMeaningful()) {
      try {
        const result = await runJudge({
          code: cleanedCode,
          language,
          testCases,
        });

        player.passedTestCases = result?.passed || 0;
        player.totalTestCases = result?.total || testCases.length;
      } catch {
        player.passedTestCases = 0;
        player.totalTestCases = testCases.length;
      }
    } else {
      player.passedTestCases = 0;
      player.totalTestCases = testCases.length;
    }

    player.code = cleanedCode;
    player.submittedAt = new Date();

    await match.save();

    io.to(matchId).emit("submissionUpdate", { userId });

    const updatedMatch = await Match.findById(matchId);
    if (!updatedMatch.players.every((p) => p.submittedAt)) return;

    const [p1, p2] = updatedMatch.players;

    const p1Meaningful =
      p1.code &&
      p1.code.trim() &&
      p1.code.trim() !== starterCode;

    const p2Meaningful =
      p2.code &&
      p2.code.trim() &&
      p2.code.trim() !== starterCode;

    let winner = null;
    let isTie = false;

    // 🚨 BOTH EMPTY OR BOTH STARTER → TIE
    if (!p1Meaningful && !p2Meaningful) {
      isTie = true;
    }

    // 🚨 ONE MEANINGFUL
    else if (p1Meaningful && !p2Meaningful) {
      winner = p1.userId;
    }
    else if (!p1Meaningful && p2Meaningful) {
      winner = p2.userId;
    }

    // 🚀 BOTH MEANINGFUL → NORMAL JUDGING
    else {
      const p1Correct = p1.passedTestCases === p1.totalTestCases;
      const p2Correct = p2.passedTestCases === p2.totalTestCases;

      if (p1Correct && !p2Correct) winner = p1.userId;
      else if (!p1Correct && p2Correct) winner = p2.userId;
      else if (p1Correct && p2Correct)
        winner =
          p1.timeTaken <= p2.timeTaken ? p1.userId : p2.userId;
      else {
        if (p1.passedTestCases !== p2.passedTestCases)
          winner =
            p1.passedTestCases > p2.passedTestCases
              ? p1.userId
              : p2.userId;
        else
          winner =
            p1.timeTaken <= p2.timeTaken
              ? p1.userId
              : p2.userId;
      }
    }

    updatedMatch.state = "FINISHED";
    updatedMatch.winner = isTie ? null : winner;
    updatedMatch.loser =
      !isTie && winner
        ? winner.toString() === p1.userId.toString()
          ? p2.userId
          : p1.userId
        : null;
    updatedMatch.endedAt = new Date();

    await updatedMatch.save();

    io.to(matchId).emit("matchResult", {
      winner,
      tie: isTie,
    });

    // 🔥 Dashboard Refresh
    const sockets = [
      onlineUsers.get(p1.userId.toString()),
      onlineUsers.get(p2.userId.toString()),
    ];

    sockets.forEach((s) => {
      if (s) io.to(s).emit("statsRefresh");
    });

    // 🚀 AI LOGIC
    if (isTie) {
      // No AI on tie
    }
    else if (p1Meaningful && !p2Meaningful) {
      // AI only for p1
      analyzeWithAI(p1, null, p1.username)
        .then((commentary) => {
          io.to(matchId).emit("aiResult", {
            winner,
            commentary,
            players: [
              {
                userId: p1.userId,
                passed: p1.passedTestCases,
                total: p1.totalTestCases,
                timeTaken: p1.timeTaken,
              },
            ],
          });
        })
        .catch(() => {});
    }
    else if (!p1Meaningful && p2Meaningful) {
      // AI only for p2
      analyzeWithAI(p2, null, p2.username)
        .then((commentary) => {
          io.to(matchId).emit("aiResult", {
            winner,
            commentary,
            players: [
              {
                userId: p2.userId,
                passed: p2.passedTestCases,
                total: p2.totalTestCases,
                timeTaken: p2.timeTaken,
              },
            ],
          });
        })
        .catch(() => {});
    }
    else {
      // BOTH meaningful → full AI
      const winnerName =
        winner?.toString() === p1.userId.toString()
          ? p1.username
          : p2.username;

      analyzeWithAI(p1, p2, winnerName)
        .then((commentary) => {
          io.to(matchId).emit("aiResult", {
            winner,
            commentary,
            players: [
              {
                userId: p1.userId,
                passed: p1.passedTestCases,
                total: p1.totalTestCases,
                timeTaken: p1.timeTaken,
              },
              {
                userId: p2.userId,
                passed: p2.passedTestCases,
                total: p2.totalTestCases,
                timeTaken: p2.timeTaken,
              },
            ],
          });
        })
        .catch(() => {});
    }

    if (!isTie && winner) {
      await updateElo(updatedMatch);
    }

  } catch (err) {
    console.error("submitCode error:", err);
  }
});


    /* DISCONNECT */
    socket.on("disconnect", async () => {
      let userId;

      for (let [id, s] of onlineUsers.entries()) {
        if (s === socket.id) {
          userId = id;
          onlineUsers.delete(id);
          break;
        }
      }

      io.emit("playerCount", onlineUsers.size);

      if (!userId) return;

      const match = await Match.findOne({
        "players.userId": userId,
        state: "IN_PROGRESS",
      });

      if (match) await handleForfeit(match, userId, io);
    });

    socket.on("leaveMatch", async ({ matchId, userId }) => {
      const match = await Match.findById(matchId);
      
      if (!match) return;

      if (match.state === "IN_PROGRESS") {
        await handleForfeit(match, userId, io);
      } else {
        match.state = "CANCELLED";
        await match.save();
      }
    });
  });
};
