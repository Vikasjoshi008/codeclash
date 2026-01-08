require("dotenv").config();
const mongoose = require("mongoose");
const Problem = require("../models/Problem");
const { GoogleGenerativeAI } = require("@google/generative-ai");

mongoose.connect(process.env.MONGO_URI);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const LANGUAGE = "javascript";
const DIFFICULTY = "easy";

async function generateQuestions() {
  const prompt = `
Generate EXACTLY 60 UNIQUE coding questions.

Language: ${LANGUAGE}
Difficulty: ${DIFFICULTY}

Return STRICT JSON ARRAY ONLY.
NO text outside JSON.
NO markdown.

Each object must have:

{
  "title": "",
  "description": "",
  "inputDescription": "",
  "outputDescription": "",
  "constraints": "",
  "examples": [
    { "input": "", "output": "" }
  ],
  "starterCode": {
    "javascript": "function solve(...) { }",
    "python": "",
    "java": "",
    "cpp": "",
    "c": "",
    "csharp": "",
    "go": "",
    "ruby": "",
    "php": "",
    "typescript": ""
  },
  "testCases": [
    { "input": ..., "output": ..., "hidden": false },
    { "input": ..., "output": ..., "hidden": true }
  ]
}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const questions = JSON.parse(text); // IMPORTANT

  return questions;
}

async function seed() {
  console.log("⏳ Generating questions using Gemini...");

  const questions = await generateQuestions();

  await Problem.deleteMany({ language: LANGUAGE, difficulty: DIFFICULTY });

  await Problem.insertMany(
    questions.map((q, index) => ({
      ...q,
      language: LANGUAGE,
      difficulty: DIFFICULTY,
      order: index + 1
    }))
  );

  console.log(`✅ Seeded 60 ${LANGUAGE} ${DIFFICULTY} questions`);
  process.exit();
}

seed();
