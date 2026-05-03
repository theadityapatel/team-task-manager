const router = require("express").Router();
const Project = require("../models/Project");
const auth = require("../middleware/auth");

// CREATE PROJECT
router.post("/", auth, async (req, res) => {
  if (!req.body.name) {
    return res.status(400).json({ msg: "Project name is required" });
  }

  const project = await Project.create({
    name: req.body.name,
    description: req.body.description,
    owner: req.user.id,
    members: [{ user: req.user.id, role: "Admin" }]
  });

  res.json(project);
});

// GET PROJECTS
router.get("/", auth, async (req, res) => {
  const projects = await Project.find({
    "members.user": req.user.id
  }).populate("members.user", "name email");

  res.json(projects);
});

// ADD PROJECT MEMBER
router.patch("/:id/members", auth, async (req, res) => {
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ msg: "User is required" });

  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ msg: "Project not found" });

  if (project.owner.toString() !== req.user.id && req.user.role !== "Admin") {
    return res.status(403).json({ msg: "Only project admin can add members" });
  }

  const alreadyMember = project.members.some((member) => member.user.toString() === userId);
  if (!alreadyMember) {
    project.members.push({ user: userId, role: "Member" });
    await project.save();
  }

  const updatedProject = await project.populate("members.user", "name email");
  res.json(updatedProject);
});

module.exports = router;
