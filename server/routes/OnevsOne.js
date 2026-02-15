const express = require("express");
const auth = require("../middleware/auth");
const Match = require("../models/Match");

const router = express.Router();

/* ================= START MATCH ================= */
router.post("/start", auth, (req, res) => {
  res.json({ ok: true });
});

/* ================= 1v1 STATS ================= */
router.get("/history", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const matches = await Match.find({
      state: "FINISHED",
      "players.userId": userId,
    });

    let wins = 0;
    let solved = 0;

    matches.forEach((m) => {
      const player = m.players.find(
        (p) => p.userId.toString() === userId
      );

      if (!player) return;

      if (m.winner?.toString() === userId) {
        wins++;
      }

      if (
        player.passedTestCases === player.totalTestCases &&
        player.totalTestCases > 0
      ) {
        solved++;
      }
    });

    res.json({
      totalMatches: matches.length,
      wins,
      losses: matches.length - wins,
      solved,
    });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/* ================= DETAILED MATCH HISTORY ================= */
router.get("/history/details", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const type = req.query.type; // wins | losses | undefined

    let matches = await Match.find({
      state: "FINISHED",
      "players.userId": userId,
    })
      .populate("problemId", "title")
      .sort({ endedAt: -1 });

    if (type === "wins") {
      matches = matches.filter(
        (m) => m.winner?.toString() === userId
      );
    }

    if (type === "losses") {
      matches = matches.filter(
        (m) => m.winner?.toString() !== userId
      );
    }

    const detailed = matches.map((m) => {
      const player = m.players.find(
        (p) => p.userId.toString() === userId
      );

      const opponent = m.players.find(
        (p) => p.userId.toString() !== userId
      );

      return {
        matchId: m._id,
        problemTitle: m.problemId?.title || "Unknown Problem",
        opponent: opponent?.username || "Unknown",
        result:
          m.winner?.toString() === userId ? "WIN" : "LOSS",
        score: `${player?.passedTestCases || 0}/${
          player?.totalTestCases || 0
        }`,
        timeTaken: player?.timeTaken || 0,
        date: m.endedAt,
      };
    });

    res.json(detailed);

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
