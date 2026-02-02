const express = require("express");
const Match = require("../models/Match");
const router = express.Router();

/**
 * GET /matches/:matchId
 * Used for refresh / reconnect
 */
router.get("/:matchId", async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findById(matchId).populate(
      "players.userId",
      "username",
    );

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    res.json({
      matchId: match._id,
      state: match.state,
      players: match.players.map((p) => ({
        userId: p.userId._id,
        name: p.name || p.userId.username,
      })),
    });
  } catch (err) {
    console.error("GET /matches/:matchId error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
