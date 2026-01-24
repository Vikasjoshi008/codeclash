const express = require('express');
const Question = require('../models/Problem');

const router = express.Router();

// get questions list
router.get("/", async (req, res) => {
  const { language, difficulty } = req.query;

  const questions = await Question.find({ 
    difficulty: difficulty.toLocaleLowerCase(),
  }).sort({ order: 1 });

  res.json(questions);
});

// get single question by order
router.get("/:order", async (req, res) => {
  const { order } = req.params;
  const { difficulty } = req.query;

  const question = await Question.findOne({
    difficulty: difficulty.toLocaleLowerCase(),
    order: Number(order)
  });

  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }

  res.json(question);
});

module.exports = router;