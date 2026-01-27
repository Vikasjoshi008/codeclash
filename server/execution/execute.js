const express = require("express");
const runCode = require("../utils/piston");
const Question = require("../models/Problem");
const templates = require("./templates");
const Submission = require("../models/submission");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    console.log("POST /api/execute HIT");

    const { code, questionId, language } = req.body;

    const question = await Question.findById(questionId);

    console.log({
      hasJudge: question.hasJudge,
      testCases: question.testCases,
      language,
    });

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    if (!question.testCases || question.testCases.length === 0) {
      return res.status(400).json({
        error: "No test cases available for this question",
      });
    }

    if (!question.hasJudge) {
      return res.status(400).json({
        error: "Execution not available for this question (Practice Mode)",
      });
    }

    const testCase = question.testCases[0];
    const template = templates[language];

    // ✅ Wrap user code safely
    if (!template) {
      return res.status(400).json({
        error: "Unsupported language",
      });
    }

    const wrappedCode = template(code, testCase.input);
    console.log("TEST INPUT:", testCase.input);

    const pistonResult = await runCode({
      code: wrappedCode,
      language,
    });

    if (!pistonResult.run) {
      return res.status(500).json({
        error: "Execution engine error",
        details: pistonResult,
      });
    }

    console.log("PISTON RESULT:", pistonResult);

    const normalize = (val) => String(val).replace(/\s+/g, "").trim();

    const actualOutput = normalize(pistonResult.run.stdout);
    const expectedOutput = normalize(testCase.expectedOutput);

    const verdict =
      actualOutput === expectedOutput ? "ACCEPTED" : "WRONG_ANSWER";

    await Submission.create({
      userId: req.user.id, // auth middleware required
      problemId: question._id,
      language,
      code,
      verdict,
    });

    res.json({
      stdout: actualOutput,
      stderr: pistonResult.run.stderr,
      verdict,
    });
  } catch (err) {
    console.error("❌ Execute error:", err);
    res.status(500).json({
      error: "Execution failed",
      details: err.message,
    });
  }
});

module.exports = router;
