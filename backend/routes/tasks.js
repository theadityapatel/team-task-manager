const router = require("express").Router();
const Task = require("../models/Task");
const Project = require("../models/Project");
const auth = require("../middleware/auth");

const validStatuses = ["To Do", "In Progress", "Completed"];

// create task (Admin assigns)
router.post("/", auth, async (req, res) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({ msg: "Only Admin can assign" });
  }

  if (!req.body.title || !req.body.assignedTo || !req.body.project) {
    return res.status(400).json({ msg: "Title, project and assigned user are required" });
  }

  const project = await Project.findById(req.body.project);
  if (!project) return res.status(404).json({ msg: "Project not found" });

  const task = await Task.create({
    title: req.body.title,
    description: req.body.description,
    project: req.body.project,
    assignedTo: req.body.assignedTo,
    createdBy: req.user.id,
    dueDate: req.body.dueDate || undefined
  });

  await Project.updateOne(
    { _id: req.body.project, "members.user": { $ne: req.body.assignedTo } },
    { $push: { members: { user: req.body.assignedTo, role: "Member" } } }
  );

  const savedTask = await task.populate([
    { path: "assignedTo", select: "name email" },
    { path: "project", select: "name" }
  ]);

  res.json(savedTask);
});

// get tasks (admin sees assigned tasks they created, member sees assigned tasks)
router.get("/", auth, async (req, res) => {
  const filter = req.user.role === "Admin"
    ? { createdBy: req.user.id }
    : { assignedTo: req.user.id };

  const tasks = await Task.find(filter)
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email")
    .populate("project", "name")
    .sort({ createdAt: -1 });

  res.json(tasks);
});

// update task status (member updates assigned task, admin updates tasks they created)
router.patch("/:id/status", auth, async (req, res) => {
  const { status } = req.body;

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ msg: "Invalid task status" });
  }

  const task = await Task.findById(req.params.id);

  if (!task) return res.status(404).json({ msg: "Task not found" });

  const isAssignedMember = task.assignedTo.toString() === req.user.id;
  const isCreatorAdmin = req.user.role === "Admin" && task.createdBy.toString() === req.user.id;

  if (!isAssignedMember && !isCreatorAdmin) {
    return res.status(403).json({ msg: "You cannot update this task" });
  }

  task.status = status;
  await task.save();

  const updatedTask = await task.populate([
    { path: "assignedTo", select: "name email" },
    { path: "project", select: "name" }
  ]);

  res.json(updatedTask);
});

// complete task (member can complete their assigned task)
router.patch("/:id/complete", auth, async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) return res.status(404).json({ msg: "Task not found" });

  if (task.assignedTo.toString() !== req.user.id) {
    return res.status(403).json({ msg: "You can only complete your assigned tasks" });
  }

  task.status = "Completed";
  await task.save();

  const updatedTask = await task.populate([
    { path: "assignedTo", select: "name email" },
    { path: "project", select: "name" }
  ]);
  res.json(updatedTask);
});

module.exports = router;
