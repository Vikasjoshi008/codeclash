const mongoose = require("mongoose");

const MatchQueueSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    level: {
      type: Number,
      required: true,
    },

    language: {
      type: String,
      required: true,
    },

    difficulty: {
      type: String,
      required: true,
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

module.exports = mongoose.model("MatchQueue", MatchQueueSchema);
