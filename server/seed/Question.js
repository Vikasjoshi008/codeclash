require("dotenv").config();
const mongoose = require("mongoose");
const Problem = require("../models/Problem");
const userProgress = require("../models/UserProgress");
const { GoogleGenerativeAI } = require("@google/generative-ai");

mongoose.connect(process.env.MONGO_URI);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const LANGUAGE = "javascript";
const DIFFICULTY = "easy";

async function generateQuestions() {
const prompt = `
Generate EXACTLY 60 UNIQUE LeetCode-style coding problems.

Language: ${LANGUAGE}
Difficulty: ${DIFFICULTY}

VERY IMPORTANT:
These problems MUST look and feel EXACTLY like LeetCode problems.

Each problem MUST:
- Have a real-world or algorithmic description (NOT "write a function that...")
- Include multiple paragraphs if needed
- Include examples written like LeetCode
- Include constraints section
- Use realistic variable names (nums, arr, s, target, k, etc.)
- Be solvable with standard DSA techniques
- Avoid trivial tutorial-style wording

STRICT JSON RULES:
- Output MUST be valid JSON parsable by JSON.parse()
- NO markdown
- NO comments
- NO extra text
- NO undefined / NaN / Infinity
- Use only string, number, boolean, null, array, object

Return a STRICT JSON ARRAY ONLY.

Each object MUST have this EXACT structure:

{
  "title": "Two Sum",
  "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
  "inputDescription": "An array of integers nums and an integer target.",
  "outputDescription": "An array containing the indices of the two numbers.",
  "constraints": "2 <= nums.length <= 10^4, -10^9 <= nums[i] <= 10^9, -10^9 <= target <= 10^9",
  "examples": [
    {
      "input": "nums = [2,7,11,15], target = 9",
      "output": "[0,1]"
    }
  ],
  "starterCode": {
    "javascript": "function solve(nums, target) { }",
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
      "input": { "nums": [2,7,11,15], "target": 9 },
      "output": [0,1],
      "hidden": false
    },
    {
      "input": { "nums": [3,2,4], "target": 6 },
      "output": [1,2],
      "hidden": true
    }
  ]
}

ADDITIONAL RULES:
- Each question MUST be different from the others
- Avoid repeating the same pattern too often
- Mix arrays, strings, objects, math, two pointers, hashing, recursion, etc.
- DO NOT generate more than 60 items
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

function normalizeExamples(examples) {
  if (!Array.isArray(examples)) return [];
  return examples.map(ex => ({
    input: JSON.stringify(ex.input),
    output: JSON.stringify(ex.output)
  }));
}

function normalizeTestCases(testCases) {
  return testCases.map(tc => {
    let input = tc.input;

    if (typeof input === "string") {
      const trimmed = input.trim();

      // convert ONLY if space-separated numbers
      if (/^-?\d+(\s+-?\d+)+$/.test(trimmed)) {
        input = trimmed.split(/\s+/).map(Number);
      }
    }

    return { ...tc, input };
  });
}



async function seed() {
  console.log("⏳ Generating questions using Gemini...");

  const questions = await generateQuestions();

  await Problem.deleteMany({ language: LANGUAGE, difficulty: DIFFICULTY });

  await Problem.insertMany(
    questions.map((q, index) =>
      validateQuestion({
      ...q,
      examples: normalizeExamples(q.examples),
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
