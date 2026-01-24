const express = require("express");
const Question = require("../models/Problem");

const router = express.Router();

// ✅ GET QUESTIONS LIST
router.get("/", async (req, res) => {
  try {
    const { language, difficulty } = req.query;

    // ✅ safety check
    if (!language || !difficulty) {
      return res.status(400).json({ message: "Missing filters" });
    }

    const questions = await Question.find({
      language: language.toLowerCase(),
      difficulty: difficulty.toLowerCase(),
    }).sort({ order: 1 });

    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET SINGLE QUESTION BY ORDER
router.get("/:order", async (req, res) => {
  try {
    const { order } = req.params;
    const { language, difficulty } = req.query;

    if (!language || !difficulty) {
      return res.status(400).json({ message: "Missing filters" });
    }

    const question = await Question.findOne({
      language: language.toLowerCase(),
      difficulty: difficulty.toLowerCase(),
      order: Number(order),
    });

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.json(question);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
