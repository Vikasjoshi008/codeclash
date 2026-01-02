const mongoose = require("mongoose");

const testCaseSchema = new mongoose.Schema({
  input: { 
    type: Array, 
    required: true 
  },
  output: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true 
  }
});

const questionSchema = new mongoose.Schema({
  title: String,
  description: String,
  language: {
    type: String,
    enum: ["javascript", "python", "java", "cpp"],
    required: true
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true
  },
  order: Number, // 1,2,3... (important)
  starterCode: String,
  testCases: [testCaseSchema]
});

module.exports = mongoose.model("Question", questionSchema);
