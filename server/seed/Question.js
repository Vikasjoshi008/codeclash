require("dotenv").config();
const mongoose = require("mongoose");
const problem = require("../models/Problem");
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

async function seed() {
  console.log("⏳ Seeding questions from CSV dataset...");
    console.log("deleting questions");

  await problem.deleteMany({ });

  console.log("✅ Deleted existing questions");

  const formatted = questions
    .filter(q => q.difficulty?.toLowerCase() === "easy")
    .slice(0, 60)
    .map((q, index) => ({
      title: q.title || q.Title,
      description: q.description || q.Question || "",
      difficulty: "easy",
      topics: q.topics ? q.topics.split(",") : [],
      examples: normalizeExamples(q.examples || q.Example),
      constraints: normalizeConstraints(q.constraints || q.Constraints),
      starterCode: {
        javascript: "function solve(...) {\n  \n}"
      },
      testCases: [],
      language: LANGUAGE,
      order: index + 1
    }));

  await problem.insertMany(formatted);

  console.log("✅ Seeded 60 JavaScript Easy questions from CSV");
  process.exit();
}

seed();
