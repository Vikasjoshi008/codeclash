const express = require('express');
const Question = require('../models/Problem');

const router = express.Router();

// get questions list
router.get("/", async (req, res) => {
  const { language, difficulty } = req.query;

  const questions = await Question.find({ language, difficulty })
    .sort({ order: 1 })
    .select("_id title order");

  res.json(questions);
});

// get single question by order
router.get("/:order", async (req, res) => {
  const { order } = req.params;
  const { language, difficulty } = req.query;

  const question = await Question.findOne({
    language,
    difficulty,
    order: Number(order)
  });

  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }

  res.json(question);
});

module.exports = router;