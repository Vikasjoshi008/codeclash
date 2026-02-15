const Match = require("../models/Match");
const Problem = require("../models/Problem");
const User = require("../models/User");
const runJudge = require("../utils/piston");
const calculateElo = require("../utils/elo");

let onlineUsers = new Map();

/* ================= FORFEIT ================= */
const handleForfeit = async (match, leavingUserId, io) => {
  if (!match || match.state !== "IN_PROGRESS") return;

  const opponent = match.players.find(
    (p) => p.userId.toString() !== leavingUserId.toString()
  );

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
  await emitStatsRefresh(match, io);
};

/* ================= ELO ================= */
const updateElo = async (match) => {
  const winnerUser = await User.findById(match.winner);
  const loserUser = await User.findById(match.loser);

  const { winnerNew, loserNew } = calculateElo(
    winnerUser.elo,
    loserUser.elo
  );

  winnerUser.elo = winnerNew;
  loserUser.elo = loserNew;

  await winnerUser.save();
  await loserUser.save();
};

/* ================= STATS REFRESH ================= */
const emitStatsRefresh = async (match, io) => {
  const sockets = [
    onlineUsers.get(match.winner?.toString()),
    onlineUsers.get(match.loser?.toString()),
  ];

  sockets.forEach((s) => {
    if (s) io.to(s).emit("statsRefresh");
  });
};

/* ================= MODULE ================= */
module.exports = (io) => {
  io.on("connection", (socket) => {

    /* REGISTER */
    socket.on("registerUser", ({ userId }) => {
      onlineUsers.set(userId, socket.id);
    });

    /* FIND MATCH */
    socket.on("findMatch", async ({ userId, difficulty }) => {
      const user = await User.findById(userId);

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
        return socket.emit("searching");
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

    /* READY */
    socket.on("playerReady", async ({ matchId, userId }) => {
      const match = await Match.findById(matchId);
      if (!match) return;

      const player = match.players.find(
        (p) => p.userId.toString() === userId
      );

      player.ready = true;
      await match.save();

      if (match.players.every((p) => p.ready)) {
        match.state = "IN_PROGRESS";
        match.startedAt = Date.now();

        const problem = await Problem.aggregate([
          { $match: { difficulty: match.difficulty } },
          { $sample: { size: 1 } },
        ]);

        match.problemId = problem[0]._id;
        await match.save();

        io.to(matchId).emit("matchUpdate", {
          state: "IN_PROGRESS",
        });

        io.to(matchId).emit("problemAssigned", {
          problemId: problem[0]._id,
        });

        io.to(matchId).emit("matchStarted", {
          startedAt: match.startedAt,
          duration: match.duration,
        });
      }
    });

    /* SUBMIT */
    socket.on("submitCode", async ({ matchId, userId, code, language }) => {
      const match = await Match.findById(matchId).populate("problemId");
      if (!match || match.state !== "IN_PROGRESS") return;

      const player = match.players.find(
        (p) => p.userId.toString() === userId
      );

      if (!player || player.code) return;

      player.timeTaken = Math.floor(
        (Date.now() - match.startedAt) / 1000
      );

      if (!code.trim()) {
        player.passedTestCases = 0;
        player.totalTestCases = match.problemId.testCases.length;
      } else {
        const result = await runJudge({
          code,
          language,
          testCases: match.problemId.testCases,
        });

        player.passedTestCases = result.passed;
        player.totalTestCases = result.total;

        const improvements = [];
        if (code.length > 400)
          improvements.push("Try reducing code length.");
        player.improvements = improvements;
      }

      player.code = code;
      player.submittedAt = new Date();
      await match.save();

      io.to(matchId).emit("submissionUpdate", {
        userId,
      });

      if (!match.players.every((p) => p.code)) return;

      const [p1, p2] = match.players;

      let winner =
        p1.passedTestCases !== p2.passedTestCases
          ? p1.passedTestCases > p2.passedTestCases
            ? p1.userId
            : p2.userId
          : p1.timeTaken <= p2.timeTaken
          ? p1.userId
          : p2.userId;

      match.state = "FINISHED";
      match.winner = winner;
      match.loser =
        winner.toString() === p1.userId.toString()
          ? p2.userId
          : p1.userId;
      match.endedAt = new Date();

      await match.save();

      io.to(matchId).emit("matchResult", { winner });

      await updateElo(match);
      await emitStatsRefresh(match, io);
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

      if (!userId) return;

      const match = await Match.findOne({
        "players.userId": userId,
        state: "IN_PROGRESS",
      });

      if (match) await handleForfeit(match, userId, io);
    });
  });
};
