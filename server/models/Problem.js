const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  title: String,
  description: String,
  input: String,
  output: String,
  constaraints: String,
  exapmples: Array,
  language: String,
  starterCode: {
    javascript: String,
    python: String,
    java: String,
    cpp: String
  },
  difficulty: String,
  order: Number, 
});

module.exports = mongoose.model("Question", questionSchema);
