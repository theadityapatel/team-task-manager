const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  status: {
    type: String,
    enum: ["To Do", "In Progress", "Completed"],
    default: "To Do"
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Low"
  },
  dueDate: Date,
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" }
}, {
  timestamps: true
});

module.exports = mongoose.model("Task", taskSchema);
