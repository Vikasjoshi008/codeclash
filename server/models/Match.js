const mongoose = require("mongoose");

const PlayerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    username: {
      type: String,
      required: true,
    },

    code: {
      type: String,
      default: "",
    },

    submittedAt: {
      type: Date,
      default: null,
    },

    passedTestCases: {
      type: Number,
      default: 0,
    },

    totalTestCases: {
      type: Number,
      default: 0,
    },

    timeTaken: {
      type: Number, // in seconds
      default: null,
    },

    status: {
      type: String,
      enum: ["WAITING", "SUBMITTED", "TIMEOUT"],
      default: "WAITING",
    },
  },
  { _id: false },
);

// const MatchSchema = new mongoose.Schema(
//   {
//     player1: {
//       type: PlayerSchema,
//       required: true,
//     },

//     player2: {
//       type: PlayerSchema,
//       required: true,
//     },

//     language: {
//       type: String,
//       enum: ["python", "javascript", "java", "cpp"],
//       required: true,
//     },

//     difficulty: {
//       type: String,
//       enum: ["easy", "medium", "hard"],
//       required: true,
//     },

//     questionId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Question",
//       required: true,
//     },

//     timeLimit: {
//       type: Number, // seconds
//       required: true,
//     },

//     status: {
//       type: String,
//       enum: ["WAITING", "RUNNING", "COMPLETED"],
//       default: "WAITING",
//     },

//     winner: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       default: null,
//     },

//     startedAt: {
//       type: Date,
//       default: null,
//     },

//     endedAt: {
//       type: Date,
//       default: null,
//     },
//   },
//   { timestamps: true }
// );

const matchSchema = new mongoose.Schema({
  players: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, required: true },
      socketId: {
        type: String,
        default: null,
      },
      ready: {
        type: Boolean,
        default: false,
      },
      ready: { type: Boolean, default: false },
    },
  ],

  language: { type: String, required: true },
  difficulty: { type: String, required: true },

  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
  },

  state: {
    type: String,
    enum: ["SEARCHING", "MATCHED", "IN_PROGRESS", "FINISHED", "CANCELLED"],
    default: "SEARCHING",
  },

  hasJudge: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Match", matchSchema);
