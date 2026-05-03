const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/auth", require("./routes/auth"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/users", require("./routes/users"));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("DB error:", err));

app.get("/", (req, res) => {
  res.send("API Running...");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
