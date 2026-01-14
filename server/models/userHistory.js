const mongoose = require("mongoose");

const userSolveHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true
    },
    language: String,
    difficulty: String,
    order: Number,
    solvedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

userSolveHistorySchema.index(
  { userId: 1, problemId: 1 },
  { unique: true }
);

module.exports = mongoose.model("UserSolveHistory", userSolveHistorySchema);
