const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/users", require("./routes/users"));

// DB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

// Test Route
app.get("/", (req, res) => {
  res.send("API Running...");
});

// Start server
app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});
