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

  const opponent = match.players.find(
    (p) => p.userId.toString() !== leavingUserId.toString(),
  );

  if (!opponent) return;

  match.state = "FINISHED";
  match.winner = opponent.userId;
  match.loser = leavingUserId;
  match.endedAt = new Date();

  await match.save();

  io.to(match._id.toString()).emit("opponentLeft");
  io.to(match._id.toString()).emit("matchResult", {
    winner: opponent.userId,
  });

  await updateElo(match);
};

/* ================= MODULE ================= */
module.exports = (io) => {
  io.on("connection", (socket) => {
    /* REGISTER USER */
    socket.on("registerUser", async ({ userId }) => {
      if (!userId) return;

      onlineUsers.set(userId.toString(), socket.id);

      await Match.updateMany(
        {
          "players.userId": userId,
          state: { $in: ["SEARCHING", "MATCHED"] },
        },
        { $set: { state: "CANCELLED" } },
      );
      io.emit("playerCount", onlineUsers.size);
    });

    /* FIND MATCH */
    socket.on("findMatch", async ({ userId, difficulty }) => {
      if (!userId || !difficulty) return;

      // Clean stale matches
      await Match.updateMany(
        {
          "players.userId": userId,
          state: { $in: ["SEARCHING", "MATCHED"] },
        },
        { $set: { state: "CANCELLED" } },
      );

      // Prevent user joining multiple matches
      const activeMatch = await Match.findOne({
        "players.userId": userId,
        state: "IN_PROGRESS",
      });

      if (activeMatch) {
        socket.emit("matchError", "Already in a match");
        return;
      }

      const user = await User.findById(userId);
      if (!user) return;

      let match = await Match.findOne({
        state: "SEARCHING",
        difficulty,
        "players.1": { $exists: false },
      });

      if (!match) {
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

      match.players.push({
        userId,
        username: user.username,
        socketId: socket.id,
        ready: false,
      });

      match.state = "MATCHED";
      await match.save();

      socket.join(match._id.toString());

      io.to(match._id.toString()).emit("matchFound", {
        players: match.players,
        matchId: match._id,
      });
    });

    socket.on("joinMatch", ({ matchId }) => {
      socket.join(matchId);
    });

    /* PLAYER READY */
    socket.on("playerReady", async ({ matchId, userId }) => {
      const match = await Match.findById(matchId);
      if (!match || match.state !== "MATCHED") return;

      const player = match.players.find((p) => p.userId.toString() === userId);

      if (!player) return;

      player.ready = true;
      await match.save();

      if (match.players.length === 2 && match.players.every((p) => p.ready)) {
        const problem = await Problem.aggregate([
          { $match: { difficulty: match.difficulty } },
          { $sample: { size: 1 } },
        ]);

        if (!problem.length) {
          match.state = "CANCELLED";
          await match.save();
          io.to(matchId).emit("matchCancelled");
          return;
        }

        match.state = "IN_PROGRESS";
        match.startedAt = new Date();
        match.problemId = problem[0]._id;
        await match.save();

        io.to(matchId).emit("matchStarted", {
          startedAt: match.startedAt,
          duration: match.duration,
        });

        io.to(matchId).emit("problemAssigned", {
          problemId: problem[0]._id,
        });
      }
    });

    /* SUBMIT CODE */
    socket.on("submitCode", async ({ matchId, userId, code, language }) => {
      const match = await Match.findById(matchId).populate("problemId");
      if (!match || match.state !== "IN_PROGRESS") return;

      const player = match.players.find((p) => p.userId.toString() === userId);

      if (!player || player.code) return;

      player.timeTaken = Math.floor(
        (Date.now() - new Date(match.startedAt).getTime()) / 1000,
      );

      const testCases = match.problemId?.testCases || [];

      if (!code || !code.trim()) {
        player.passedTestCases = 0;
        player.totalTestCases = testCases.length;
      } else {
        try {
          const result = await runJudge({
            code,
            language,
            testCases,
          });

          player.passedTestCases = result?.passed || 0;
          player.totalTestCases = result?.total || testCases.length;
        } catch {
          player.passedTestCases = 0;
          player.totalTestCases = testCases.length;
        }
      }

      player.code = code;
      player.submittedAt = new Date();
      await match.save();

      io.to(matchId).emit("submissionUpdate", { userId });

      if (!match.players.every((p) => p.code)) return;

      const [p1, p2] = match.players;

      const p1Correct = p1.passedTestCases === p1.totalTestCases;
      const p2Correct = p2.passedTestCases === p2.totalTestCases;

      let winner;

      if (p1Correct && !p2Correct) winner = p1.userId;
      else if (!p1Correct && p2Correct) winner = p2.userId;
      else if (p1Correct && p2Correct)
        winner = p1.timeTaken <= p2.timeTaken ? p1.userId : p2.userId;
      else {
        if (p1.passedTestCases !== p2.passedTestCases)
          winner =
            p1.passedTestCases > p2.passedTestCases ? p1.userId : p2.userId;
        else winner = p1.timeTaken <= p2.timeTaken ? p1.userId : p2.userId;
      }

      match.state = "FINISHED";
      match.winner = winner;
      match.loser =
        winner.toString() === p1.userId.toString() ? p2.userId : p1.userId;
      match.endedAt = new Date();

      await match.save();

      io.to(matchId).emit("matchResult", { winner });

      const winnerName =
        p1.userId.toString() === winner.toString() ? p1.username : p2.username;

      // Non-blocking AI call
      analyzeWithAI(p1, p2, winnerName)
        .then((aiCommentary) => {
          io.to(matchId).emit("aiResult", {
            commentary: aiCommentary,
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

      await updateElo(match);
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
