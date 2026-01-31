const Match = require("../models/Match");
const Problem = require("../models/Problem");
const User = require("../models/User");
const runJudge = require("../utils/piston");
const calculateElo = require("../utils/elo");

/* ================= TIMER ================= */
const startMatchTimer = async (matchId, io) => {
  const match = await Match.findById(matchId);
  if (!match) return;

  setTimeout(async () => {
    const liveMatch = await Match.findById(matchId);
    if (!liveMatch || liveMatch.state !== "IN_PROGRESS") return;

    const [p1, p2] = liveMatch.players;

    const winner =
      (p1.passedTestCases || 0) >= (p2.passedTestCases || 0)
        ? p1.userId
        : p2.userId;

    liveMatch.state = "FINISHED";
    liveMatch.winner = winner;
    await liveMatch.save();

    io.to(matchId).emit("matchTimeout");
    await emitSummaryAndElo(liveMatch, io);
  }, match.duration);
};

/* ================= SUMMARY + ELO ================= */
const emitSummaryAndElo = async (match, io) => {
  const [p1, p2] = match.players;
  const winnerId = match.winner;

  const winnerUser = await User.findById(winnerId);
  const loserUser = await User.findById(
    p1.userId.toString() === winnerId.toString() ? p2.userId : p1.userId,
  );

  const { winnerNew, loserNew } = calculateElo(winnerUser.elo, loserUser.elo);

  winnerUser.elo = winnerNew;
  loserUser.elo = loserNew;
  await winnerUser.save();
  await loserUser.save();

  io.to(match._id.toString()).emit("matchSummary", {
    winner: winnerId,
    players: match.players.map((p) => ({
      userId: p.userId,
      passed: p.passedTestCases || 0,
      total: p.totalTestCases || 0,
      timeTaken: p.timeTaken || null,
    })),
    elo: {
      winner: winnerNew,
      loser: loserNew,
    },
  });
};

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("🔥 SOCKET CONNECTED:", socket.id);

    /* ================= FIND MATCH ================= */
    socket.on("findMatch", async ({ userId, difficulty }) => {
      const existing = await Match.findOne({
        "players.userId": userId,
        state: { $in: ["SEARCHING", "MATCHED", "IN_PROGRESS"] },
      });

      console.log("FIND MATCH:", {
        userId,
        difficulty,
        socketId: socket.id,
      });

      if (existing) {
        socket.emit("matchError", "User already in a match");
        return;
      }

      // let match = await Match.findOne({
      //   state: "SEARCHING",
      //   difficulty,
      //   "players.1": { $exists: false },
      // });
      let match = await Match.findOne({
        state: "SEARCHING",
        "players.1": { $exists: false },
      });

      if (!match) {
        match = await Match.create({
          difficulty,
          players: [{ userId, socketId: socket.id }],
          state: "SEARCHING",
        });
        console.log("MATCH STATE:", {
          matchId: match._id.toString(),
          players: match.players.map((p) => p.userId.toString()),
          state: match.state,
        });

        socket.join(match._id.toString());
        socket.emit("searching");
        return;
      }

      match.players.push({ userId, socketId: socket.id });
      match.state = "MATCHED";
      await match.save();

      socket.join(match._id.toString());
      io.to(match._id.toString()).emit("matchFound", { matchId: match._id });
    });

    /* ================= PLAYER READY ================= */
    socket.on("playerReady", async ({ matchId, userId }) => {
      const match = await Match.findById(matchId);
      if (!match || match.state !== "MATCHED") return;

      const player = match.players.find((p) => p.userId.toString() === userId);
      if (!player) return;

      player.ready = true;
      await match.save();

      console.log("PLAYER READY:", {
        matchId,
        userId,
        players: match.players.map((p) => ({
          id: p.userId.toString(),
          ready: p.ready,
        })),
      });

      if (match.players.length === 2 && match.players.every((p) => p.ready)) {
        match.state = "IN_PROGRESS";
        match.startedAt = Date.now();

        const problem = await Problem.aggregate([
          {
            $match: {
              difficulty: match.difficulty,
              hasJudge: true,
              "testCases.0": { $exists: true },
            },
          },
          { $sample: { size: 1 } },
        ]);

        if (!problem.length) {
          match.state = "CANCELLED";
          await match.save();
          io.to(matchId).emit("matchCancelled", "No problems available");
          return;
        }

        match.problemId = problem[0]._id;
        await match.save();

        io.to(matchId).emit("matchUpdate", { state: "IN_PROGRESS" });
        io.to(matchId).emit("matchStarted", {
          startedAt: match.startedAt,
          duration: match.duration || 15 * 60 * 1000, // fallback
        });

        io.to(matchId).emit("problemAssigned", {
          problemId: match.problemId,
        });

        startMatchTimer(match._id.toString(), io);
      }
    });

    /* ================= SUBMIT CODE ================= */
    socket.on("submitCode", async ({ matchId, userId, code, language }) => {
      const match = await Match.findById(matchId).populate("problemId");
      if (!match || match.state !== "IN_PROGRESS") return;

      const player = match.players.find((p) => p.userId.toString() === userId);
      if (!player || player.code) return;

      player.timeTaken = Math.floor((Date.now() - match.startedAt) / 1000);

      const result = await runJudge({
        code,
        language,
        testCases: match.problemId.testCases,
      });

      player.code = code;
      player.passedTestCases = result.passed;
      player.totalTestCases = result.total;
      player.submittedAt = new Date();

      await match.save();

      io.to(matchId).emit("submissionUpdate", {
        userId,
        passed: result.passed,
        total: result.total,
      });

      if (match.players.every((p) => p.code)) {
        const [p1, p2] = match.players;

        let winner =
          p1.passedTestCases !== p2.passedTestCases
            ? p1.passedTestCases > p2.passedTestCases
              ? p1.userId
              : p2.userId
            : p1.timeTaken < p2.timeTaken
              ? p1.userId
              : p2.userId;

        match.state = "FINISHED";
        match.winner = winner;
        await match.save();

        io.to(matchId).emit("matchResult", { winner });
        await emitSummaryAndElo(match, io);
      }
    });

    /* ================= DISCONNECT ================= */
    socket.on("disconnect", async () => {
      const match = await Match.findOne({
        "players.socketId": socket.id,
        state: { $in: ["SEARCHING", "MATCHED", "IN_PROGRESS"] },
      });
      if (!match) return;

      match.state = "CANCELLED";
      await match.save();

      io.to(match._id.toString()).emit(
        "matchCancelled",
        "Opponent disconnected",
      );
    });
  });
};
