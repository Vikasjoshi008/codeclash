const express = require("express");
const auth = require("../middleware/auth");
const Match = require("../models/Match");

const router = express.Router();

/* START MATCH (socket handles logic) */
router.post("/start", auth, (req, res) => {
  res.json({ ok: true });
});

/* 1v1 HISTORY */
router.get("/history", auth, async (req, res) => {
  const userId = req.user.id;

  const matches = await Match.find({
    state: "FINISHED",
    "players.userId": userId,
  }).sort({ createdAt: -1 });

  const wins = matches.filter(
    (m) => m.winner?.toString() === userId
  ).length;

  res.json({
    totalMatches: matches.length,
    wins,
    losses: matches.length - wins,
    matches,
  });
});

module.exports = router;
