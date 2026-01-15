const mongoose = require("mongoose");

const exampleSchema = new mongoose.Schema({
  input: String,
  output: String,
  explanation: String
});

const testCaseSchema = new mongoose.Schema({
  input: mongoose.Schema.Types.Mixed,
  output: mongoose.Schema.Types.Mixed,
  hidden: { type: Boolean, default: false }
});

const problemSchema = new mongoose.Schema({
  // Meta
  title: String,
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"]
  },
  topics: [String],
  companies: [String],
  isPremium: { type: Boolean, default: false },

  // Content
  description: String,
  examples: [exampleSchema],
  constraints: [String],

  // Code
  starterCode: {
    javascript: String,
    python: String,
    java: String,
    cpp: String
  },

  // Judge
  testCases: [testCaseSchema],

  // Practice system
  language: String,
  order: Number
});

module.exports = mongoose.model("Problem", problemSchema);
