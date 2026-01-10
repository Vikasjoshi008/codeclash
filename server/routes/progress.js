const express = require("express");
const mongoose=require("mongoose");
const UserProgress = require("../models/UserProgress");

const router = express.Router();

router.get("/", async (req, res) => {
  const { userId, language, difficulty } = req.query;

  if (!userId || !language || !difficulty) {
    return res.status(400).json({ message: "Missing parameters" });
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid userId" });
  }


  let progress = await UserProgress.findOne({
    userId,
    language,
    difficulty
  });

  if (!progress) {
    progress = await UserProgress.create({
      userId,
      language,
      difficulty,
      currentOrder: 1
    });
  }

  res.json(progress);
});

router.post("/advance", async (req, res) => {
  const { userId, language, difficulty, order } = req.body;

  let progress = await UserProgress.findOne({ userId, language, difficulty });

  if (!progress) {
    progress = new UserProgress({
      userId,
      language,
      difficulty,
      solvedOrders: [],
      currentOrder: 1
    });
  }

  // prevent duplicates
  if (!progress.solvedOrders.includes(order)) {
    progress.solvedOrders.push(order);
  }
   // ✅ add solved order if not already present
  if (!progress.solvedOrders.includes(order)) {
    progress.solvedOrders.push(order);
  }

  // unlock next
  if (order >= progress.currentOrder) {
    progress.currentOrder = order + 1;
  }

  await progress.save();

  res.json(progress);
});


module.exports = router;
