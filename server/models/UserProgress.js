const mongoose=require('mongoose');

const userProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
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
    solvedOrders: {
      type: [Number],
    },
    currentOrder: {
      type: Number,
      default: 1
    }
  },
  { timestamps: true }
);

userProgressSchema.index(
  { userId: 1, language: 1, difficulty: 1 },
  { unique: true }
);

module.exports = mongoose.model("UserProgress", userProgressSchema);
