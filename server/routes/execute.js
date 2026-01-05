const express = require("express");
const runCode = require("../utils/judge0");
const Question = require("../models/Problem");
const router = express.Router();


router.post("/", async (req, res) => {
  try {
    console.log("POST /api/execute HIT");
    console.log("REQ BODY:", req.body);

    const { code, questionId, language } = req.body;

    if (!code || !questionId || !language) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    if (!question.testCases || !question.testCases.length) {
      return res.status(400).json({ error: "No test cases found" });
    }

    const testCase = question.testCases[0];
    console.log("TEST CASE:", testCase);

  // const wrappedCode = `${code}`;

    const result = await runCode({
      code,
      input: "",
      language
    });

    console.log("JUDGE0 RESULT:", result);

    res.json({
    stdout: result.stdout || "",
    stderr: result.stderr || result.compile_output || "",
    status: result.status
  });


  } catch (err) {
    console.error("❌ EXECUTE ERROR:", err);
    res.status(500).json({
      error: "Code execution failed",
      details: err.message
    });
  }
});

module.exports = router;