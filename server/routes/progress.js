// const express = require("express");
// const mongoose=require("mongoose");
// const UserProgress = require("../models/UserProgress");
// const auth = require("../middleware/auth");

// const router = express.Router();

// router.get("/", async (req, res) => {
//   const { userId, language, difficulty } = req.query;

//   if (!userId || !language || !difficulty) {
//     return res.status(400).json({ message: "Missing parameters" });
//   }

//   if (!mongoose.Types.ObjectId.isValid(userId)) {
//     return res.status(400).json({ message: "Invalid userId" });
//   }


//   let progress = await UserProgress.findOne({
//     userId,
//     language,
//     difficulty
//   });

//   if (!progress) {
//     progress = await UserProgress.create({
//       userId,
//       language,
//       difficulty,
//       currentOrder: 1
//     });
//   }

//   res.json(progress);
// });

// router.get("/:language/:difficulty", auth ,async (req, res) => {
//   const userId = req.user.id;
//   const { language, difficulty } = req.params;

//   const progress = await UserProgress.findOne({
//     userId,
//     language,
//     difficulty
//   });

//   if (!progress) {
//     return res.json({ currentOrder: 1 });
//   }

//   res.json({
//     currentOrder: progress.currentOrder
//   });
// });


// router.post("/advance", auth ,async (req, res) => {
//   const userId = req.user.id;
//   const {  language, difficulty, order } = req.body;

//   let progress = await UserProgress.findOne({ userId, language, difficulty });

//   if (!progress) {
//     progress = new UserProgress({
//       userId,
//       language,
//       difficulty,
//       solvedOrders: [],
//       currentOrder: 1
//     });
//   }

//   // prevent duplicates
//   if (!progress.solvedOrders.includes(order)) {
//     progress.solvedOrders.push(order);
//   }
//    // ✅ add solved order if not already present
//   if (!progress.solvedOrders.includes(order)) {
//     progress.solvedOrders.push(order);
//   }

//   // unlock next
//   if (order >= progress.currentOrder) {
//     progress.currentOrder = order + 1;
//   }

//   await progress.save();

//   res.json(progress);
// });


// module.exports = router;
const express = require("express");
const UserProgress = require("../models/UserProgress");
const auth = require("../middleware/auth");

const router = express.Router();

/**
 * GET current progress for logged-in user
 * Used for:
 * - locking/unlocking questions
 * - showing "already solved" banner
 */
router.get("/:language/:difficulty", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { language, difficulty } = req.params;

    let progress = await UserProgress.findOne({
      userId,
      language,
      difficulty
    });

    // create progress if first time user
    if (!progress) {
      progress = await UserProgress.create({
        userId,
        language,
        difficulty,
        solvedOrders: [],
        currentOrder: 1
      });
    }

    res.json({
      currentOrder: progress.currentOrder,
      solvedOrders: progress.solvedOrders
    });
  } catch (err) {
    console.error("Progress fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST advance progress (mark question as solved)
 * Called when user clicks "Mark as Solved"
 */
router.post("/advance", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { language, difficulty, order } = req.body;

    let progress = await UserProgress.findOne({
      userId,
      language,
      difficulty
    });

    if (!progress) {
      progress = new UserProgress({
        userId,
        language,
        difficulty,
        solvedOrders: [],
        currentOrder: 1
      });
    }

    // add solved order (no duplicates)
    if (!progress.solvedOrders.includes(order)) {
      progress.solvedOrders.push(order);
    }

    // unlock next question
    if (order >= progress.currentOrder) {
      progress.currentOrder = order + 1;
    }

    await progress.save();

    res.json({
      currentOrder: progress.currentOrder,
      solvedOrders: progress.solvedOrders
    });
  } catch (err) {
    console.error("Progress advance error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
