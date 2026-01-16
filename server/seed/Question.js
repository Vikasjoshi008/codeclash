require("dotenv").config();
const mongoose = require("mongoose");
const Problem = require("../models/Problem");

// ---------- SAFE FETCH FOR NODE ----------
const fetch =
  global.fetch ||
  ((...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args)));

// ---------- DB ----------
mongoose.connect(process.env.MONGO_URI);

// ---------- CONFIG ----------
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";

const LANGUAGE = "javascript";
const DIFFICULTY = "easy";

// ---------- PROMPT ----------
const prompt = `
Generate EXACTLY 60 UNIQUE LeetCode-style coding problems.

Language: ${LANGUAGE}
Difficulty: ${DIFFICULTY}

VERY IMPORTANT:
These problems MUST look and feel EXACTLY like LeetCode problems.

Each problem MUST:
- Have a real algorithmic description (NOT "write a function that...")
- Use realistic variable names (nums, arr, s, target, k, etc.)
- Include clear examples
- Include constraints
- Be solvable using standard DSA techniques

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
  "description": "Problem description here",
  "inputDescription": "Input description here",
  "outputDescription": "Output description here",
  "constraints": "Constraints here",
  "examples": [
    {
      "input": "nums = [2,7,11,15], target = 9",
      "output": "[0,1]"
    }
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
- Each question MUST be different
- Avoid repeating patterns
- Mix arrays, strings, math, hashing, two pointers, etc.
- DO NOT generate more than 60 items
`;

// ---------- HELPERS ----------
function extractJSON(text) {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");

  if (start === -1 || end === -1) {
    throw new Error("❌ No JSON array found in Gemini response");
  }

  const raw = text.slice(start, end + 1);
  const repaired = repairJSON(raw);

  try {
    return JSON.parse(repaired);
  } catch (err) {
    console.error("❌ JSON PARSE FAILED");
    console.error("RAW RESPONSE:", raw.slice(0, 1000));
    throw err;
  }
}

function repairJSON(text) {
  let repaired = text;

  // Fix unquoted object keys: title: → "title":
  repaired = repaired.replace(
    /([{,]\s*)([a-zA-Z0-9_]+)\s*:/g,
    '$1"$2":'
  );

  // Replace single quotes with double quotes
  repaired = repaired.replace(/'/g, '"');

  // Remove trailing commas
  repaired = repaired.replace(/,\s*([}\]])/g, "$1");

  return repaired;
}

function normalizeExamples(examples) {
  if (!Array.isArray(examples)) return [];
  return examples.map(ex => ({
    input: String(ex.input),
    output: String(ex.output)
  }));
}

function normalizeTestCases(testCases) {
  if (!Array.isArray(testCases)) return [];
  return testCases.map(tc => ({
    input: tc.input,
    output: tc.output,
    hidden: Boolean(tc.hidden)
  }));
}

function validateQuestion(q, index) {
  if (!q.title || !q.description) {
    throw new Error(`Question ${index + 1}: missing title or description`);
  }
  if (!Array.isArray(q.testCases) || q.testCases.length === 0) {
    throw new Error(`Question ${index + 1}: testCases missing`);
  }
  return q;
}


// ---------- GEMINI CALL ----------
async function generateQuestions() {
  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`❌ Gemini API error: ${err}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("❌ Gemini returned empty response");
  }

  const parsed = extractJSON(text);
  return parsed.slice(0, 60); // HARD LIMIT
}

// ---------- SEED ----------
async function seed() {
  console.log("⏳ Generating questions using Gemini...");

  const questions = await generateQuestions();

  await Problem.deleteMany({ language: LANGUAGE, difficulty: DIFFICULTY });

  await Problem.insertMany(
    questions.map((q, index) =>
      validateQuestion(
        {
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
