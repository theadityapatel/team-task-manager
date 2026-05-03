import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "./api";

const getSavedUser = () => {
  try {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    const parsedUser = savedUser ? JSON.parse(savedUser) : null;

    if (!token) return parsedUser;

    const tokenUser = JSON.parse(atob(token.split(".")[1]));
    return { ...parsedUser, ...tokenUser };
  } catch {
    return null;
  }
};

const isOverdue = (task) => {
  if (!task.dueDate || task.status === "Completed") return false;
  return new Date(task.dueDate) < new Date(new Date().toDateString());
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser] = useState(getSavedUser);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [project, setProject] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [msg, setMsg] = useState("");
  const isAdmin = currentUser?.role === "Admin";

  const summary = useMemo(() => ({
    totalProjects: projects.length,
    toDo: tasks.filter((task) => task.status === "To Do").length,
    inProgress: tasks.filter((task) => task.status === "In Progress").length,
    completed: tasks.filter((task) => task.status === "Completed").length,
    overdue: tasks.filter(isOverdue).length
  }), [projects.length, tasks]);

  const fetchTasks = async () => {
    const res = await API.get("/tasks");
    setTasks(res.data);
  };

  const fetchProjects = async () => {
    const res = await API.get("/projects");
    setProjects(res.data);
  };

  const fetchUsers = async () => {
    const res = await API.get("/users");
    setUsers(res.data);
  };

  const clearForm = () => {
    setTitle("");
    setDescription("");
    setProject("");
    setAssignedTo("");
    setDueDate("");
    setMsg("");
  };

  const createTask = async () => {
    if (!isAdmin) {
      setMsg("Only Admin can create and assign tasks");
      return;
    }

    if (!projects.length) {
      setMsg("Create a project first, then assign a task");
      return;
    }

    if (!users.length) {
      setMsg("No users found. Create a member account first");
      return;
    }

    if (!project) {
      setMsg("Select a project");
      return;
    }

    if (!title.trim()) {
      setMsg("Enter a task title");
      return;
    }

    if (!assignedTo) {
      setMsg("Select the user who should receive this task");
      return;
    }

    try {
      setMsg("");

      await API.post("/tasks", {
        title,
        description,
        project,
        assignedTo,
        dueDate
      });

      clearForm();
      await Promise.all([fetchTasks(), fetchProjects()]);
    } catch (err) {
      setMsg(err.response?.data?.msg || "Could not create task");
    }
  };

  const updateTaskStatus = async (id, status) => {
    try {
      setMsg("");
      await API.patch(`/tasks/${id}/status`, { status });
      fetchTasks();
    } catch (err) {
      setMsg(err.response?.data?.msg || "Could not update task");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setMsg("");
        if (isAdmin) {
          await Promise.all([fetchTasks(), fetchProjects(), fetchUsers()]);
        } else {
          await Promise.all([fetchTasks(), fetchProjects()]);
        }
      } catch (err) {
        setMsg(err.response?.data?.msg || "Please login again");
      }
    };

    loadDashboard();
  }, [isAdmin]);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold">Team Task Manager</h1>
            <p className="text-sm text-gray-500">
              {currentUser?.name || "User"} - {currentUser?.role || "Member"}
            </p>
          </div>

          <nav className="flex items-center gap-2">
            <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm">
              Dashboard
            </button>
            <button
              onClick={() => navigate("/projects")}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Projects
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Profile
            </button>
            <button
              onClick={logout}
              className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Total Projects", summary.totalProjects, "text-slate-700"],
            ["To Do", summary.toDo, "text-blue-700"],
            ["In Progress", summary.inProgress, "text-amber-700"],
            ["Completed", summary.completed, "text-green-700"],
            ["Overdue", summary.overdue, "text-red-700"]
          ].map(([label, value, color]) => (
            <div key={label} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">{label}</p>
              <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </section>

        {msg && (
          <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {msg}
          </div>
        )}

        {isAdmin && (
          <section className="mb-8 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Assign Task</h2>
              <button
                onClick={clearForm}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Clear
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <select
                className="rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                value={project}
                onChange={(e) => setProject(e.target.value)}
              >
                <option value="">Select project</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <input
                className="rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <input
                className="rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Task description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <select
                className="rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              >
                <option value="">Select user</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                ))}
              </select>

              <input
                className="rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={createTask}
                className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                Create Task
              </button>
            </div>
          </section>
        )}

        {!isAdmin && (
          <div className="mb-8 rounded-lg border border-gray-200 bg-white p-5 text-sm text-gray-600 shadow-sm">
            Task creation is available only for Admin users. Members can start and complete assigned tasks.
          </div>
        )}

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Tasks</h2>
            <span className="rounded-full bg-white px-3 py-1 text-sm text-gray-600 ring-1 ring-gray-200">
              {tasks.length} total
            </span>
          </div>

          {tasks.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
              No tasks yet
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((t) => (
                <div
                  key={t._id}
                  className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{t.title}</h3>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          t.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : t.status === "In Progress"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {t.status}
                      </span>
                      {isOverdue(t) && (
                        <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                          Overdue
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {t.project?.name || "No project"} - Assigned to {t.assignedTo?.name || "Unknown user"}
                    </p>
                    {t.dueDate && (
                      <p className="mt-1 text-sm text-gray-500">
                        Due {new Date(t.dueDate).toLocaleDateString()}
                      </p>
                    )}
                    {t.description && (
                      <p className="mt-2 text-sm text-gray-700">{t.description}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {!isAdmin && t.status === "To Do" && (
                      <button
                        onClick={() => updateTaskStatus(t._id, "In Progress")}
                        className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-600"
                      >
                        Start
                      </button>
                    )}

                    {!isAdmin && t.status !== "Completed" && (
                      <button
                        onClick={() => updateTaskStatus(t._id, "Completed")}
                        className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
