const express = require("express");
const runCode = require("../utils/piston");
const Question = require("../models/Problem");
const templates= require("./templates");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    console.log("POST /api/execute HIT");

    const { code, questionId, language } = req.body;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    if (!question.testCases || question.testCases.length === 0) {
      return res.status(400).json({
        error: "No test cases available for this question"
    });
  }

  if (!question.hasJudge) {
    return res.status(400).json({
      error: "Execution not available for this question (Practice Mode)"
    });
  }


  const testCase = question.testCases[0];
const template = templates[language];

    // ✅ Wrap user code safely
if (!template) {
  return res.status(400).json({
    error: "Unsupported language"
  });
}

const wrappedCode = template(code, testCase.input);

    const pistonResult = await runCode({
      code: wrappedCode,
      language
    });

    console.log("PISTON RESULT:", pistonResult);

    res.json({
      stdout: pistonResult.run.stdout.trim(),
      stderr: pistonResult.run.stderr
    });

  } catch (err) {
    console.error("❌ Execute error:", err);
    res.status(500).json({
      error: "Execution failed",
      details: err.message
    });
  }
});

module.exports = router;
