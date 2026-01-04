const express= require("express");
const runCode=require("../utils/judge0");
const Question=require("../models/Problem");

const router= express.Router();

router.post("/", async (req, res) => {
  console.log("POST /api/execute HIT");
  const { code, questionId, language } = req.body;
  const question = await Question.findById(questionId);

  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }

  const testCase = question.testCases[0]; // visible test only

  const wrappedCode = ` ${code}
  const input = ${JSON.stringify(testCase.input)};
  const output = solve(input);
  console.log(JSON.stringify(output));
  `;

  const result = await runCode({
    code: wrappedCode,
    input: "",
    language
  });


  res.json({
  fullResult: result,
  stdout: result.stdout,
  stderr: result.stderr
});
});

module.exports = router;