const express = require("express");
const UserProgress = require("../models/UserProgress");
const auth = require("../middleware/auth");
const UserSolveHistory = require("../models/userHistory.js");

const router = express.Router();

router.get("/:language/:difficulty", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { language, difficulty } = req.params;

    let progress = await UserProgress.findOne({
      userId,
      language,
      difficulty
    });

    // create progress if first time user
    if (!progress) {
      progress = await UserProgress.create({
        userId,
        language,
        difficulty,
        solvedOrders: [],
        currentOrder: 1
      });
    }

    res.json( progress );
  } catch (err) {
    console.error("Progress fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/advance", auth, async (req, res) => {
  const userId = req.user.id;
  const { language, difficulty, order, problemId } = req.body;

  const progress = await UserProgress.findOneAndUpdate(
    { userId, language, difficulty },
    {
      $addToSet: { solvedOrders: order },
      $set: { currentOrder: order + 1 }
    },
    { upsert: true, new: true }
  );

  // SAVE HISTORY
  await UserSolveHistory.findOneAndUpdate(
    { userId, problemId, language },
    { 
      userId, 
      problemId,
      title: req.body.title,
      language, 
      difficulty, 
      order 
    },
    { upsert: true }
  );

  res.json(progress);
});

// GET user progress
router.get("/", async (req, res) => {
  try {
    const { userId, language, difficulty } = req.query;

    if (!userId || !language || !difficulty) {
      return res.status(400).json({ message: "Missing parameters" });
    }

    let progress = await UserProgress.findOne({
      userId,
      language,
      difficulty
    });

    // If no progress yet, return default
    if (!progress) {
      return res.json({
        userId,
        language,
        difficulty,
        currentOrder: 1,
        solvedOrders: []
      });
    }

    res.json(progress);
  } catch (err) {
    console.error("Progress GET error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;