const router = require("express").Router();
const Task = require("../models/Task");
const auth = require("../middleware/auth");

// create task (Admin assigns)
router.post("/", auth, async (req, res) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({ msg: "Only Admin can assign" });
  }

  const task = await Task.create({
    title: req.body.title,
    description: req.body.description,
    assignedTo: req.body.assignedTo,
    createdBy: req.user.id
  });

  res.json(task);
});

// get tasks (member sees assigned)
router.get("/", auth, async (req, res) => {
  const tasks = await Task.find({
    assignedTo: req.user.id
  }).populate("assignedTo", "name");

  res.json(tasks);
});

module.exports = router;