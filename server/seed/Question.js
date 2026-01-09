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
Generate EXACTLY 60 UNIQUE coding questions only.

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
  {
    "input": [1, 2, 3, 4, 5],
    "output": 15,
    "hidden": false
  },
  {
    "input": [10, -5, 3],
    "output": 8,
    "hidden": true
  }
]

IMPORTANT JSON RULES (STRICT):
- Output MUST be valid JSON parsable by JSON.parse()
- DO NOT use undefined, NaN, Infinity
- Use null instead of undefined
- Use only: string, number, boolean, null, array, object
- testCases.input MUST be valid JSON
- NEVER include JavaScript-only values


}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

    function safeParseJSON(text) {
    // Remove JavaScript-only tokens
    const cleaned = text
      .replace(/\bundefined\b/g, "null")
      .replace(/\bNaN\b/g, "null")
      .replace(/\bInfinity\b/g, "null");

    return JSON.parse(cleaned);
  }

  const parsed = safeParseJSON(text); 
  const questions= parsed.slice(0, 60);

  return questions;
}

function validateQuestion(q, index) {
  if (!Array.isArray(q.testCases)) {
    throw new Error(`Question ${index + 1}: testCases must be array`);
  }

  q.testCases.forEach((tc, i) => {
    if (tc.input === undefined) {
      throw new Error(`Question ${index + 1}, testCase ${i + 1}: input is undefined`);
    }
  });

  return q;
}


function normalizeTestCases(testCases) {
  return testCases.map(tc => {
    let input = tc.input;

    // If input is string → convert to array
    if (typeof input === "string") {
      input = input
        .trim()
        .split(/\s+/)
        .map(Number);
    }

    return {
      ...tc,
      input
    };
  });
}


async function seed() {
  console.log("⏳ Generating questions using Gemini...");

  const questions = await generateQuestions();

  // await Problem.deleteMany({ language: LANGUAGE, difficulty: DIFFICULTY });
  await Problem.deleteMany({ language: "javascript", difficulty: "easy" });

  await Problem.insertMany(
    questions.map((q, index) =>
      validateQuestion({
      ...q,
      testCases: normalizeTestCases(q.testCases),
      language: LANGUAGE,
      difficulty: DIFFICULTY,
      order: index + 1
    },
    index
  )
)
);

  console.log(`✅ Seeded 60 ${LANGUAGE} ${DIFFICULTY} questions`);
  process.exit();
}

seed();
