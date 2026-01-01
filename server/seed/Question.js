require("dotenv").config();
const mongoose=require("mongoose");
const Question=require("../models/Problem");

mongoose.connect(process.env.MONGO_URI);

const questions=[
    {
    title: "Capitalize First Letter",
    description: "Capitalize the first letter of each word.",
    language: "javascript",
    difficulty: "easy",
    order: 1,
    starterCode: `function solve(words) {\n  \n}`,
    testCases: [
      {
        input: [["hello", "world"]],
        output: ["Hello", "World"]
      }
    ]
  },
  {
    title: "Reverse And Join Strings",
    description: "Reverse each string and join them.",
    language: "javascript",
    difficulty: "easy",
    order: 2,
    starterCode: `function solve(arr) {\n  \n}`,
    testCases: [
      {
        input: [["abc", "def"]],
        output: "cbafed"
      }
    ]
  }
];

async function seed() {
  await Question.deleteMany({});
  await Question.insertMany(questions);
  console.log("✅ Questions seeded");
  process.exit();
}

seed();