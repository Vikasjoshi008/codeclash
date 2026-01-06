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

    const testCase = question.testCases[0];

    // 🔥 WRAP USER CODE
    const wrappedCode = `
${code}

try {
  const input = ${JSON.stringify(testCase.input)};
  const output = solve(input);
  console.log(JSON.stringify(output));
} catch (err) {
  console.error(err.message);
}
`;

    const result = await runCode({
      code: wrappedCode,
      input: testCase.input,
      language
    });

    res.json({
      stdout: result.run?.stdout || "",
      stderr: result.run?.stderr || ""
    });

  } catch (err) {
    console.error("❌ Execute error:", err);
    res.status(500).json({ error: "Execution failed", details: err.message });
  }
});


module.exports = router;