const router = require("express").Router();
const Project = require("../models/Project");
const auth = require("../middleware/auth");

// CREATE PROJECT
router.post("/", auth, async (req, res) => {
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

module.exports = router;