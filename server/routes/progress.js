const express = require("express");
const UserProgress = require("../models/UserProgress");
const auth = require("../middleware/auth");
const UserSolveHistory = require("../models/userHistory.js");

const router = express.Router();

router.get("/:userId/:language/:difficulty", auth, async (req, res) => {
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

    res.json({
      currentOrder: progress.currentOrder,
      solvedOrders: progress.solvedOrders
    });
  } catch (err) {
    console.error("Progress fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/advance", async (req, res) => {
  try {
    const { userId, language, difficulty, order } = req.body;

    // 1️⃣ Find the problem
    const question = await Problem.findOne({
      difficulty,
      order
    });

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // 2️⃣ Update progress (your existing logic)
    await UserProgress.findOneAndUpdate(
      { userId, language, difficulty },
      {
        $addToSet: { solvedOrders: order },
        $set: { currentOrder: order + 1 }
      },
      { upsert: true }
    );

    // 3️⃣ SAVE SOLVE HISTORY ✅ (THIS IS WHERE IT GOES)
    await UserSolveHistory.findOneAndUpdate(
      {
        userId,
        problemId: question._id,
        language
      },
      {
        userId,
        problemId: question._id,
        title: question.title,
        language,
        difficulty,
        order
      },
      { upsert: true, new: true }
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
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