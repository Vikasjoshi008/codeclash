const express = require("express");
const UserProgress = require("../models/UserProgress");

const router = express.Router();

router.get("/", async (req, res) => {
  const { userId, language, difficulty } = req.query;

  if (!userId || !language || !difficulty) {
    return res.status(400).json({ message: "Missing parameters" });
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
  const { userId, language, difficulty } = req.body;

  const progress = await UserProgress.findOne({
    userId,
    language,
    difficulty
  });

  if (!progress) {
    return res.status(404).json({ message: "Progress not found" });
  }

  progress.currentOrder += 1;
  await progress.save();

  res.json(progress);
});

module.exports = router;
