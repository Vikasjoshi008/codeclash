const express = require("express");
const { generateProblem } = require("../../utils/geminiEngine");
const router = express.Router();

router.post("/problem", async (req, res) => {
  try {
    const { level, language } = req.body;
    const problem = await generateProblem(level, language);
    res.json(problem);
  } catch (err) {
    console.error("❌ AI error:", err.message);

    res.json({
      title: "Temporary Problem",
      description: "Solve a basic problem while AI is unavailable.",
      input_format: "Array of strings",
      output_format: "Array of strings",
      example: '["hello"] → ["Hello"]',
      testCases: [
        {
          input: [["hello"]],
          output: ["Hello"]
        }
      ]
    });
  }
});


module.exports= router;
