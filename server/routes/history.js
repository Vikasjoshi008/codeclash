const express = require("express");
const UserSolveHistory = require("../models/userHistory.js");
const auth = require("../middleware/auth.js");

const router = express.Router();

// Get user solve history
router.get("/:userId", async (req, res) => {
  try {
    const history = await UserSolveHistory.find({
      userId: req.params.userId
    }).sort({ solvedAt: -1 });

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", auth, async (req, res) => {
  const userId = req.user.id;

  const history = await UserSolveHistory.find({ userId })
    .sort({ solvedAt: -1 });

  res.json(history);
});


module.exports = router;