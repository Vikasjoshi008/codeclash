const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    username: {   // ✅ ADD THIS
      type: String,
      required: true,
    },

    socketId: String,
    ready: { type: Boolean, default: false },

    code: String,
    submittedAt: Date,

    passedTestCases: { type: Number, default: 0 },
    totalTestCases: { type: Number, default: 0 },
    timeTaken: Number,
  },
  { _id: false }
);

const matchSchema = new mongoose.Schema(
  {
    players: [playerSchema],

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },

    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
    },

    state: {
      type: String,
      enum: [
        "SEARCHING",
        "MATCHED",
        "IN_PROGRESS",
        "FINISHED",
        "CANCELLED",
      ],
      default: "SEARCHING",
    },

    startedAt: Date, // keep as Date
    endedAt: Date,   // ✅ ADD THIS

    duration: { type: Number, default: 15 * 60 * 1000 },

    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    loser: {   // ✅ ADD THIS
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Match", matchSchema);
