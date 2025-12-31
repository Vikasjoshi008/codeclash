const express = require("express");
const { generateProblem } = require("../../utils/geminiEngine");
const router = express.Router();

router.post("/problem", async (req, res) => {
  try {
    const { level , language} = req.body;

    if (!level || !language) {
      return res.status(400).json({ error: "Level and language required" });
    }

    const problem = await generateProblem(level, language);
    res.json(problem);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI generation failed" });
  }
});

module.exports= router;
