const mongoose = require("mongoose");

const testCaseSchema = new mongoose.Schema({
  input: mongoose.Schema.Types.Mixed,
  output: mongoose.Schema.Types.Mixed,
  hidden: { type: Boolean, default: false }
});

const problemSchema = new mongoose.Schema({
  title: String,
  description: String,
  inputDescription: String,
  outputDescription: String,
  constraints: String,

  examples: [
    {
      input: String,
      output: String
    }
  ],

  starterCode: {
    javascript: String,
    python: String,
    java: String,
    cpp: String
  },

  testCases: [testCaseSchema],

  language: {
    type: String,
    enum: [
      "javascript", 
      "python", 
      "java", 
      "cpp",
      "c",
      "csharp",
      "ruby",
      "php",
      "typescript",
    ],
    required: true
  },

  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"]
  },

  order: Number
});

module.exports = mongoose.model("Problem", problemSchema);
