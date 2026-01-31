// const mongoose = require("mongoose");

// const PlayerSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     username: {
//       type: String,
//       required: true,
//     },

//     code: {
//       type: String,
//       default: "",
//     },

//     submittedAt: {
//       type: Date,
//       default: null,
//     },

//     passedTestCases: {
//       type: Number,
//       default: 0,
//     },

//     totalTestCases: {
//       type: Number,
//       default: 0,
//     },

//     timeTaken: {
//       type: Number, // in seconds
//       default: null,
//     },

//     status: {
//       type: String,
//       enum: ["WAITING", "SUBMITTED", "TIMEOUT"],
//       default: "WAITING",
//     },
//   },
//   { _id: false },
// );

// const matchSchema = new mongoose.Schema({
//   players: [
//     {
//       userId: { type: mongoose.Schema.Types.ObjectId, required: true },
//       socketId: {
//         type: String,
//         default: null,
//       },
//       ready: {
//         type: Boolean,
//         default: false,
//       },
//       ready: { type: Boolean, default: false },
//     },
//   ],

//   language: { type: String, required: true },
//   difficulty: { type: String, required: true },

//   questionId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Question",
//   },

//   state: {
//     type: String,
//     enum: ["SEARCHING", "MATCHED", "IN_PROGRESS", "FINISHED", "CANCELLED"],
//     default: "SEARCHING",
//   },

//   hasJudge: { type: Boolean, default: false },

//   startedAt: Date,
//   duration: {
//     type: Number, // milliseconds
//     default: 15 * 60 * 1000, // 15 minutes
//   },
//   winner: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//   },
// });

// module.exports = mongoose.model("Match", matchSchema);

const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
      enum: ["SEARCHING", "MATCHED", "IN_PROGRESS", "FINISHED", "CANCELLED"],
      default: "SEARCHING",
    },

    startedAt: Date,
    duration: { type: Number, default: 15 * 60 * 1000 },

    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Match", matchSchema);

