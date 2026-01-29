const express = require("express");
const mongoose = require("mongoose");
const auth = require("../middleware/auth.js");

const User1v1Stats = require("../models/User1v1Stats.js");
const Match = require("../models/Match.js");
const MatchQueue = require("../models/MatchQueue");

const router = express.Router();

router.post("/start", async (req, res) => {
  try {
    const { userId, username, language, difficulty } = req.body;

    // 1. Validation
    if (!userId || !language || !difficulty || !username) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    // 2. Get or create User1v1Stats
    let stats = await User1v1Stats.findOne({ userId });

    if (!stats) {
      stats = await User1v1Stats.create({ userId });
    }

    // 3. State check
    if (stats.state !== "ONLINE") {
      return res.status(400).json({
        message: "User already searching or in a match",
      });
    }

    // 4. Set user to SEARCHING
    stats.state = "SEARCHING";
    stats.lastActiveAt = new Date();
    await stats.save();

    // 5. Try to find opponent
    const opponent = await MatchQueue.findOne({
      level: stats.level,
      language,
      difficulty,
      userId: { $ne: userId },
    });

    // 6. If opponent found → create match
    if (opponent) {
      // remove opponent from queue
      await MatchQueue.deleteOne({ userId: opponent.userId });

      // update opponent state
      const opponentStats = await User1v1Stats.findOne({
        userId: opponent.userId,
      });

      if (!opponentStats || opponentStats.state !== "SEARCHING") {
        // opponent invalid, continue searching
        await MatchQueue.create({
          userId,
          level: stats.level,
          language,
          difficulty,
        });

        return res.json({ message: "Searching for opponent..." });
      }

      // create match
      const match = await Match.create({
        player1: {
          userId,
          username,
        },
        player2: {
          userId: opponent.userId,
          username: opponent.username,
        },
        language,
        difficulty,
        questionId: null, // will assign later
        timeLimit: 1200, // 20 minutes
        status: "RUNNING",
        startedAt: new Date(),
      });

      // update both users
      stats.state = "IN_MATCH";
      stats.currentMatchId = match._id;

      opponentStats.state = "IN_MATCH";
      opponentStats.currentMatchId = match._id;

      await stats.save();
      await opponentStats.save();

      return res.json({
        message: "Match found",
        matchId: match._id,
        players: {
          you: username,
          opponent: opponent.username,
        },
      });
    }

    // 7. No opponent → add to queue
    await MatchQueue.create({
      userId,
      username,
      level: stats.level,
      language,
      difficulty,
    });

    return res.json({
      message: "Searching for opponent...",
    });
  } catch (error) {
    console.error("1v1 start error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/status", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "userId required" });
    }

    const stats = await User1v1Stats.findOne({ userId });

    if (!stats) {
      return res.status(404).json({ message: "Stats not found" });
    }

    return res.json({
      state: stats.state,
      matchId: stats.currentMatchId,
    });
  } catch (err) {
    console.error("1v1 status error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;