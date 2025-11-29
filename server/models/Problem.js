// server/models/Problem.js

const mongoose = require('mongoose');

const TestSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true,
  },
  expectedOutput: {
    type: String,
    required: true,
  },
  isSecret: {
    type: Boolean,
    default: true, // Hide secret test cases from the user
  },
});

const ProblemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner',
  },
  // Array of test cases for the judging system
  testCases: [TestSchema],
});

module.exports = mongoose.model('Problem', ProblemSchema);