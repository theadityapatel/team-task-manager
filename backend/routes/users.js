const router = require("express").Router();
const User = require("../models/user");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({ msg: "Only Admin can view users" });
  }

  const users = await User.find().select("name email role");
  res.json(users);
});

module.exports = router;
