const mongoose = require("mongoose");

const User1v1StatsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    level: {
      type: Number,
      default: 0,
    },

    totalWins: {
      type: Number,
      default: 0,
    },

    winsInLevel: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    progressPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    state: {
      type: String,
      enum: ["ONLINE", "SEARCHING", "IN_MATCH"],
      default: "ONLINE",
    },

    currentMatchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      default: null,
    },

    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// helper method to update progress
User1v1StatsSchema.methods.updateProgress = function () {
  this.progressPercent = (this.winsInLevel / 10) * 100;
};

module.exports = mongoose.model("User1v1Stats", User1v1StatsSchema);