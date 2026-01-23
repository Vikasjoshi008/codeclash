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
    javascript: "function solve(...) {}",
    python: "def solve(...):\n    pass",
    java: "class Solution { public static void main(...) {} }",
    cpp: "#include <bits/stdc++.h>\nint main() {}",
    c: "#include <stdio.h>\nint main() {}",
    csharp: "using System;\nclass Program { static void Main() {} }",
    go: "package main\nfunc main() {}",
    ruby: "def solve()\nend",
    php: "<?php\nfunction solve() {}\n?>",
    typescript: "function solve(...) {}"
  },


  // Judge
  testCases: [testCaseSchema],

  // Practice system
  language: String,
  order: Number,
  hasJudge: {
    type: Boolean,
    default: false
}

});

module.exports = mongoose.model("Problem", problemSchema);
