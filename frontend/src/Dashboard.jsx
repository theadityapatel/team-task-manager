import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "./api";

export default function Dashboard() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [userName, setUserName] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "To Do",
    dueDate: "",
  });

  // 🔹 USER FROM TOKEN
  const getUser = () => {
    const token = localStorage.getItem("token");
    if (!token) return "User";

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.name;
    } catch {
      return "User";
    }
  };

  // 🔹 FETCH TASKS
  const fetchTasks = async () => {
    try {
      const res = await API.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // 🔹 CREATE TASK
  const createTask = async () => {
    try {
      await API.post("/tasks", newTask);
      setShowModal(false);
      setNewTask({
        title: "",
        description: "",
        status: "To Do",
        dueDate: "",
      });
      fetchTasks();
    } catch (err) {
      console.log(err);
    }
  };

  // 🔹 UPDATE STATUS
  const updateStatus = async (id, status) => {
    try {
      await API.put(`/tasks/${id}`, { status });
      fetchTasks();
    } catch (err) {
      console.log(err);
    }
  };

  // 🔹 DELETE TASK
  const deleteTask = async (id) => {
    try {
      await API.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    setUserName(getUser());
    fetchTasks();
  }, []);

  // 🔹 COUNTS
  const count = (status) =>
    tasks.filter((t) => t.status === status).length;

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* 🔥 SIDEBAR */}
      <div className="w-64 bg-white shadow p-5">

      <div className="flex items-center gap-3 mb-6">
  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white w-9 h-9 flex items-center justify-center rounded-lg shadow">
    📊
  </div>
  <span className="text-lg font-semibold text-gray-800">
    TaskFlow
  </span>
</div>

        <nav className="space-y-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="block w-full text-left bg-blue-600 text-white px-3 py-2 rounded"
          >
            Dashboard
          </button>

          <button
            onClick={() => navigate("/projects")}
            className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
          >
            Projects
          </button>

          <button
            onClick={() => navigate("/profile")}
            className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
          >
            Profile
          </button>
        </nav>
      </div>

      {/* 🔥 MAIN */}
      <div className="flex-1 p-8">

        {/* TOP BAR */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Dashboard</h2>

          <div className="flex items-center gap-3">
            <div className="bg-purple-500 text-white w-10 h-10 flex items-center justify-center rounded-full">
              {userName[0]}
            </div>
          </div>
        </div>

        <p className="text-gray-500 mb-6">
          Here's an overview of your work.
        </p>

        {/* 🔥 STATS */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card title="Total Tasks" value={tasks.length} />
          <Card title="To Do" value={count("To Do")} />
          <Card title="In Progress" value={count("In Progress")} />
          <Card title="Completed" value={count("Completed")} />
        </div>

        {/* 🔥 SECTIONS */}
        <div className="grid grid-cols-2 gap-6">

          {/* TASKS */}
          <div className="bg-white p-6 rounded-xl shadow">

            <div className="flex justify-between mb-4">
              <h3 className="font-semibold">My Tasks</h3>

              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                + Task
              </button>
            </div>

            {tasks.length === 0 ? (
              <p className="text-gray-400 text-center py-6">
                No tasks assigned yet
              </p>
            ) : (
              <div className="space-y-3">
                {tasks.map((t) => (
                  <div
                    key={t._id}
                    className="border p-3 rounded flex justify-between"
                  >
                    <div>
                      <h4 className="font-medium">{t.title}</h4>

                      <select
                        value={t.status}
                        onChange={(e) =>
                          updateStatus(t._id, e.target.value)
                        }
                        className="mt-1 border p-1 rounded text-sm"
                      >
                        <option>To Do</option>
                        <option>In Progress</option>
                        <option>Completed</option>
                      </select>
                    </div>

                    <button
                      onClick={() => deleteTask(t._id)}
                      className="text-red-500 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ACTIVITY (dummy for now) */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold mb-4">Recent Activity</h3>

            <p className="text-gray-400 text-center py-6">
              No recent activity
            </p>
          </div>
        </div>
      </div>

      {/* 🔥 MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">
          <div className="bg-white p-6 rounded w-96">

            <h2 className="text-lg font-semibold mb-4">
              Create Task
            </h2>

            <input
              placeholder="Title"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
              className="w-full border p-2 mb-3"
            />

            <textarea
              placeholder="Description"
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
              className="w-full border p-2 mb-3"
            />

            <input
              type="date"
              value={newTask.dueDate}
              onChange={(e) =>
                setNewTask({ ...newTask, dueDate: e.target.value })
              }
              className="w-full border p-2 mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 px-4 py-2"
              >
                Cancel
              </button>

              <button
                onClick={createTask}
                className="bg-blue-600 text-white px-4 py-2"
              >
                Create
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// 🔹 CARD
function Card({ title, value }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-2xl font-bold">{value}</h2>
    </div>
  );
}