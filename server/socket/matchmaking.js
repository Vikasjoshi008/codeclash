const Match = require("../models/Match");
const Problem = require("../models/Problem");
const runJudge = require("../execution/runJudge");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("🔥 SOCKET CONNECTED:", socket.id);

    /* ================= FIND MATCH ================= */
    socket.on("findMatch", async ({ userId, language, difficulty }) => {
      try {
        // Prevent duplicate matches
        const existingMatch = await Match.findOne({
          "players.userId": userId,
          state: { $in: ["SEARCHING", "MATCHED", "IN_PROGRESS"] },
        });

        if (existingMatch) {
          socket.emit("matchError", "User already in a match");
          return;
        }

        // Find waiting match
        let match = await Match.findOne({
          state: "SEARCHING",
          difficulty,
          "players.1": { $exists: false },
        });

        // Create new match
        if (!match) {
          match = await Match.create({
            difficulty,
            players: [
              {
                userId,
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

        // Join existing match
        match.players.push({
          userId,
          socketId: socket.id,
          ready: false,
        });

        match.state = "MATCHED";
        await match.save();

        socket.join(match._id.toString());

        io.to(match._id.toString()).emit("matchFound", {
          matchId: match._id,
        });
      } catch (err) {
        console.error("❌ findMatch error:", err);
        socket.emit("matchError", "Matchmaking failed");
      }
    });

    /* ================= PLAYER READY ================= */
    socket.on("playerReady", async ({ matchId, userId }) => {
      try {
        const match = await Match.findById(matchId);
        if (!match || match.state !== "MATCHED") return;

        const player = match.players.find(
          (p) => p.userId.toString() === userId
        );
        if (!player) return;

        player.ready = true;
        await match.save();

        // If both ready → start match
        if (match.players.length === 2 && match.players.every((p) => p.ready)) {
          match.state = "IN_PROGRESS";

          // Pick problem (difficulty based)
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
            io.to(matchId).emit(
              "matchCancelled",
              "No problems available"
            );
            return;
          }

          match.problemId = problem[0]._id;
          match.hasJudge = true;
          await match.save();

          io.to(matchId).emit("matchUpdate", {
            state: "IN_PROGRESS",
          });

          io.to(matchId).emit("problemAssigned", {
            problemId: match.problemId,
          });
        }
      } catch (err) {
        console.error("❌ playerReady error:", err);
      }
    });

    /* ================= SUBMIT CODE ================= */
    socket.on("submitCode", async ({ matchId, userId, code, language }) => {
      try {
        const match = await Match.findById(matchId).populate("problemId");
        if (!match || match.state !== "IN_PROGRESS" || !match.hasJudge) return;

        const player = match.players.find(
          (p) => p.userId.toString() === userId
        );
        if (!player || player.code) return;

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

        // Decide winner when both submitted
        if (match.players.every((p) => p.code)) {
          const [p1, p2] = match.players;

          let winner;
          if (p1.passedTestCases !== p2.passedTestCases) {
            winner =
              p1.passedTestCases > p2.passedTestCases
                ? p1.userId
                : p2.userId;
          } else {
            winner =
              p1.submittedAt < p2.submittedAt
                ? p1.userId
                : p2.userId;
          }

          match.state = "FINISHED";
          await match.save();

          io.to(matchId).emit("matchResult", { winner });
        }
      } catch (err) {
        console.error("❌ submitCode error:", err);
      }
    });

    /* ================= DISCONNECT ================= */
    socket.on("disconnect", async () => {
      console.log("❌ DISCONNECTED:", socket.id);

      const match = await Match.findOne({
        "players.socketId": socket.id,
        state: { $in: ["SEARCHING", "MATCHED", "IN_PROGRESS"] },
      });

      if (!match) return;

      match.state = "CANCELLED";
      await match.save();

      io.to(match._id.toString()).emit(
        "matchCancelled",
        "Opponent disconnected"
      );
    });
  });
};
