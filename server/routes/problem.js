const express = require("express");
const Problem = require("../models/Problem");
const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }
    res.json(problem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch problem" });
  }
});

module.exports = router;
