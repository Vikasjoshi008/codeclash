const mongoose = require("mongoose");

const SubmissionSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  problemId: mongoose.Schema.Types.ObjectId,
  language: String,
  code: String,
  verdict: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Submission", SubmissionSchema);
