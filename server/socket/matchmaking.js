// const Match = require("../models/Match");
// const Question = require("../models/Problem");

// module.exports = (io) => {

//   io.on("connection", (socket) => {
//     console.log("User connected:", socket.id);

//     /* ================= FIND MATCH ================= */
//     socket.on("findMatch", async ({ userId, language, difficulty }) => {
//       // matchmaking logic
//     });

//     /* ================= PLAYER READY ================= */
//     socket.on("playerReady", async ({ matchId, userId }) => {
//       try {
//         const match = await Match.findById(matchId);
//         if (!match) return;

//         const player = match.players.find(
//           p => p.userId.toString() === userId
//         );
//         if (!player) return;

//         player.ready = true;

//         if (match.players.length === 2 &&
//             match.players.every(p => p.ready)) {

//           match.state = "IN_PROGRESS";

//           const question = await Question.aggregate([
//             { $match: { language: match.language, difficulty: match.difficulty } },
//             { $sample: { size: 1 } }
//           ]);

//           if (!question.length) {
//             match.state = "CANCELLED";
//             await match.save();
//             io.to(matchId).emit("matchCancelled", "No questions available");
//             return;
//           }

//           match.questionId = question[0]._id;
//           match.hasJudge = true;
//         }

//         await match.save();
//         io.to(matchId).emit("matchUpdate", { state: match.state });

//       } catch (err) {
//         console.error(err);
//       }
//     });

//     /* ================= DISCONNECT ================= */
//     socket.on("disconnect", async () => {
//       console.log("Disconnected:", socket.id);

//       const match = await Match.findOne({
//         "players.socketId": socket.id,
//         state: { $in: ["SEARCHING", "MATCHED", "IN_PROGRESS"] }
//       });

//       if (!match) return;

//       match.state = "CANCELLED";
//       await match.save();

//       io.to(match._id.toString()).emit(
//         "matchCancelled",
//         "Opponent disconnected"
//       );
//     });
//   });
// };


const Match = require("../models/Match");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("🔥 SOCKET CONNECTED:", socket.id);

    /* ================= FIND MATCH ================= */
    socket.on("findMatch", async ({ userId, language, difficulty }) => {
      try {
        console.log("findMatch:", userId, language, difficulty);

        // 1️⃣ Prevent duplicate matches for same user
        const existingMatch = await Match.findOne({
          "players.userId": userId,
          state: { $in: ["SEARCHING", "MATCHED", "IN_PROGRESS"] }
        });

        if (existingMatch) {
          socket.emit("matchError", "User already in a match");
          return;
        }

        // 2️⃣ Try to find a waiting match (only ONE player)
        let match = await Match.findOne({
          state: "SEARCHING",
          language,
          difficulty,
          "players.1": { $exists: false }
        });

        if (!match) {
          // 3️⃣ Create new match
          match = await Match.create({
            language,
            difficulty,
            players: [{
              userId,
              socketId: socket.id,
              ready: false
            }],
            state: "SEARCHING"
          });

          socket.join(match._id.toString());
          socket.emit("searching");
          return;
        }

        // 4️⃣ Join existing match
        match.players.push({
          userId,
          socketId: socket.id,
          ready: false
        });

        match.state = "MATCHED";
        await match.save();

        // 5️⃣ Join room + notify both players
        socket.join(match._id.toString());

        io.to(match._id.toString()).emit("matchFound", {
          matchId: match._id
        });

        console.log("✅ MATCH FOUND:", match._id);

      } catch (err) {
        console.error("❌ findMatch error:", err);
        socket.emit("matchError", "Matchmaking failed");
      }
    });

    /* ================= DISCONNECT ================= */
    socket.on("disconnect", async () => {
      console.log("❌ DISCONNECTED:", socket.id);

      const match = await Match.findOne({
        "players.socketId": socket.id,
        state: { $in: ["SEARCHING", "MATCHED", "IN_PROGRESS"] }
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
