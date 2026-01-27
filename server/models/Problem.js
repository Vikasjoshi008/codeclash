const mongoose = require("mongoose");

const exampleSchema = new mongoose.Schema({
  input: String,
  output: String,
  explanation: String
});

const testCaseSchema = new mongoose.Schema({
  input: mongoose.Schema.Types.Mixed,
  output: mongoose.Schema.Types.Mixed,
  expectedOutput: {
  type: String,
  required: true
},
  hidden: Boolean
});

const starterCodeSchema = new mongoose.Schema({
  javascript: String,
  python: String,
  java: String,
  cpp: String,
  c: String,
  csharp: String,
});

const problemSchema = new mongoose.Schema({
  title: String,
  description: String,
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"]
  },
  topics: [String],
  companies: [String],

  examples: [exampleSchema],
  constraints: [String],

  starterCode: starterCodeSchema,

  testCases: [testCaseSchema],
  hasJudge: Boolean,

  order: Number
});

module.exports = mongoose.model("Problem", problemSchema);
