import { useEffect, useState } from "react";
import API from "./api";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [title, setTitle] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const fetchTasks = async () => {
    const res = await API.get("/tasks");
    setTasks(res.data);
  };

  const fetchUsers = async () => {
    const res = await API.get("/users");
    setUsers(res.data);
  };

  const createTask = async () => {
    await API.post("/tasks", {
      title,
      assignedTo
    });
    fetchTasks();
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>

      <input
        placeholder="Task title"
        onChange={(e) => setTitle(e.target.value)}
      />

      <select onChange={(e) => setAssignedTo(e.target.value)}>
        <option>Select user</option>
        {users.map((u) => (
          <option key={u._id} value={u._id}>
            {u.name}
          </option>
        ))}
      </select>

      <button onClick={createTask}>Create Task</button>

      <h3>Tasks</h3>
      {tasks.map((t) => (
        <div key={t._id}>
          {t.title} → {t.assignedTo?.name}
        </div>
      ))}
    </div>
  );
}