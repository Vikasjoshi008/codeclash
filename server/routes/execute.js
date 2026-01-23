const express = require("express");
const runCode = require("../utils/piston");
const Question = require("../models/Problem");

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

  const testCase = question.testCases[0];


    // ✅ Wrap user code safely
    const wrappedCode = `
${code}

try {
  const input = ${JSON.stringify(testCase.input)};
  const result = solve(...input);
  console.log(JSON.stringify(result));
} catch (err) {
  console.error(err.message);
}
`;

    const pistonResult = await runCode({
      code: wrappedCode,
      language
    });

    console.log("PISTON RESULT:", pistonResult);

    res.json({
      stdout: pistonResult.run?.output || "",
      stderr: pistonResult.run?.stderr || ""
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
