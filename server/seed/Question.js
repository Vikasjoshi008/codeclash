require("dotenv").config();
const mongoose = require("mongoose");
const Problem = require("../models/Problem");
const questions = require("./leetcode.json");

mongoose.connect(process.env.MONGO_URI);

const LANGUAGE = "javascript";
const DIFFICULTY = "easy";

function normalizeExamples(exampleText) {
  if (!exampleText) return [];
  return [
    {
      input: exampleText,
      output: ""
    }
  ];
}

function normalizeConstraints(constraintText) {
  if (!constraintText) return [];
  return constraintText
    .split("\n")
    .map(c => c.trim())
    .filter(Boolean);
}

function extractFirstTestCase(description) {
  if (!description) return null;

  const numsMatch = description.match(/nums\s*=\s*\[([^\]]+)\]/);
  const targetMatch = description.match(/target\s*=\s*(-?\d+)/);

  if (!numsMatch || !targetMatch) return null;

  return {
    input: [
      numsMatch[1].split(",").map(n => Number(n.trim())),
      Number(targetMatch[1])
    ],
    output: null,
    hidden: false
  };
}

async function seed() {
  console.log("⏳ Seeding questions from LeetCode dataset...");

  await Problem.deleteMany({});
  console.log("✅ Deleted existing questions");

  const formatted = questions
    .filter(q => q.difficulty?.toLowerCase() === "easy")
    .slice(0, 60)
    .map((q, index) => {
      const testCase = extractFirstTestCase(q.description || q.Question);

      return {
        title: q.title || q.Title,
        description: q.description || q.Question || "",
        difficulty: "easy",
        topics: q.topics ? q.topics.split(",") : [],
        examples: normalizeExamples(q.examples || q.Example),
        constraints: normalizeConstraints(q.constraints || q.Constraints),
        starterCode: {
          javascript: "function solve(nums, target) {\n  \n}"
        },
        testCases: testCase ? [testCase] : [],
        language: LANGUAGE,
        order: index + 1,
        hasJudge: q.testCases && q.testCases.length > 0
      };
    });

  await Problem.insertMany(formatted);

  console.log("✅ Seeded 60 JavaScript Easy questions with test cases");
  process.exit();
}

seed();
