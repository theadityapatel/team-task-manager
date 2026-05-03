const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const auth = require("../middleware/auth");

const handleTaskError = (res, err) => {
  console.log(err);

  if (err.name === "ValidationError" || err.name === "CastError") {
    return res.status(400).json({ msg: err.message });
  }

  return res.status(500).json({ msg: "Server error" });
};

const pickTaskUpdates = (body) => {
  const allowedFields = [
    "title",
    "description",
    "status",
    "priority",
    "dueDate",
    "project"
  ];

  return allowedFields.reduce((updates, field) => {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }

    return updates;
  }, {});
};

// 🔹 CREATE TASK
router.post("/", auth, async (req, res) => {
  try {
    const task = await Task.create({
      title: req.body.title,
      description: req.body.description,
      status: req.body.status || "To Do",
      priority: req.body.priority || "Low",
      dueDate: req.body.dueDate,
      assignedTo: req.user.id,
      project: req.body.project
    });

    res.json(task);
  } catch (err) {
    handleTaskError(res, err);
  }
});

// 🔹 GET TASKS
router.get("/", auth, async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.user.id
    }).sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// 🔹 UPDATE TASK
router.put("/:id", auth, async (req, res) => {
  try {
    const updated = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        assignedTo: req.user.id
      },
      pickTaskUpdates(req.body),
      {
        new: true,
        runValidators: true
      }
    );

    if (!updated) {
      return res.status(404).json({ msg: "Task not found" });
    }

    res.json(updated);
  } catch (err) {
    handleTaskError(res, err);
  }
});

// 🔹 DELETE TASK
router.delete("/:id", auth, async (req, res) => {
  try {
    const deleted = await Task.findOneAndDelete({
      _id: req.params.id,
      assignedTo: req.user.id
    });

    if (!deleted) {
      return res.status(404).json({ msg: "Task not found" });
    }

    res.json({ msg: "Task deleted" });
  } catch (err) {
    handleTaskError(res, err);
  }
});

module.exports = router;
