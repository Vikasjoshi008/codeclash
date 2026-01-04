const express= require("express");
const runCode=require("../utils/judge0");
const Question=require("../models/Problem");

const router= express.Router();

router.post("/", async (req, res) => {
  const { code, questionId, language } = req.body;
  const question = await Question.findById(questionId);

  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }

  const testCase = question.testCases[0]; // visible test only

  const result = await runCode({
    code,
    input: JSON.stringify(testCase.input),
    language
  });

  res.json({
    stdout: result.stdout,
    stderr: result.stderr,
    expected: testCase.output
  });
});

module.exports = router;