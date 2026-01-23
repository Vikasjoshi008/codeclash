require("dotenv").config();
const mongoose = require("mongoose");
const Problem = require("../models/Problem");
const questions = require("./leetcode.json");

mongoose.connect(process.env.MONGO_URI);

const LANGUAGES = [
  "javascript",
  "python",
  "java",
  "cpp",
  "c",
  "csharp",
  "go",
  "ruby",
  "php",
  "typescript"
];

function extractFirstTestCase(description) {
  if (!description) return null;

  const numsMatch = description.match(/nums\s*=\s*\[([^\]]+)\]/);
  const targetMatch = description.match(/target\s*=\s*(-?\d+)/);

  if (!numsMatch || !targetMatch) return null;

  return {
    input: {
      nums: numsMatch[1].split(",").map(n => Number(n.trim())),
      target: Number(targetMatch[1])
    },
    output: null,
    hidden: false
  };
}

async function seed() {
  console.log("⏳ Seeding LeetCode questions...");

  for (const difficulty of ["easy", "medium", "hard"]) {
    const filtered = questions
      .filter(q => q.difficulty?.toLowerCase() === difficulty)
      .slice(0, 60);

    const formatted = filtered.map((q, index) => {
      const testCase = extractFirstTestCase(q.description);

      return {
        title: q.title,
        description: q.description,
        difficulty,
        topics: q.related_topics?.split(",") || [],
        companies: q.companies?.split(",") || [],
        constraints: q.description
          ?.split("Constraints:")[1]
          ?.split("\n")
          .map(s => s.trim())
          .filter(Boolean) || [],

        examples: [],

        starterCode: {
          javascript: "function solve(nums, target) {\n\n}",
          python: "def solve(nums, target):\n    pass",
          java: "class Solution { public int[] solve(int[] nums, int target) { return null; } }",
          cpp: "#include <vector>\nusing namespace std;",
          c: "#include <stdio.h>",
          csharp: "class Solution { }",
          go: "package main",
          ruby: "def solve(nums, target)\nend",
          php: "<?php function solve($nums, $target) {} ?>",
          typescript: "function solve(nums: number[], target: number): number[] {}"
        },

        testCases: testCase ? [testCase] : [],
        hasJudge: Boolean(testCase),

        order: index + 1
      };
    });

    await Problem.deleteMany({ difficulty });
    await Problem.insertMany(formatted);

    console.log(`✅ Seeded ${difficulty} questions`);
  }

  process.exit();
}

seed();
