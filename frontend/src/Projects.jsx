import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "./api";

const getSavedUser = () => {
  try {
    const savedUser = localStorage.getItem("user");
    if (savedUser) return JSON.parse(savedUser);

    const token = localStorage.getItem("token");
    if (!token) return null;

    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [msg, setMsg] = useState("");
  const [memberByProject, setMemberByProject] = useState({});
  const [currentUser] = useState(getSavedUser);
  const isAdmin = currentUser?.role === "Admin";

  const fetchProjects = async () => {
    try {
      const res = await API.get("/projects");
      setProjects(res.data);
    } catch (err) {
      setMsg(err.response?.data?.msg || "Could not load projects");
    }
  };

  const fetchUsers = async () => {
    if (!isAdmin) return;

    try {
      const res = await API.get("/users");
      setUsers(res.data);
    } catch (err) {
      setMsg(err.response?.data?.msg || "Could not load users");
    }
  };

  const createProject = async () => {
    if (!name.trim()) {
      setMsg("Enter a project name");
      return;
    }

    try {
      setMsg("");
      await API.post("/projects", { name, description });
      setName("");
      setDescription("");
      fetchProjects();
    } catch (err) {
      setMsg(err.response?.data?.msg || "Could not create project");
    }
  };

  const addMember = async (projectId) => {
    const userId = memberByProject[projectId];
    if (!userId) {
      setMsg("Select a user to add");
      return;
    }

    try {
      setMsg("");
      await API.patch(`/projects/${projectId}/members`, { userId });
      setMemberByProject({ ...memberByProject, [projectId]: "" });
      fetchProjects();
    } catch (err) {
      setMsg(err.response?.data?.msg || "Could not add member");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  useEffect(() => {
    let isMounted = true;

    const loadProjects = async () => {
      try {
        const res = await API.get("/projects");
        if (isMounted) setProjects(res.data);
        if (isAdmin) await fetchUsers();
      } catch (err) {
        if (isMounted) setMsg(err.response?.data?.msg || "Could not load projects");
      }
    };

    loadProjects();

    return () => {
      isMounted = false;
    };
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
            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Dashboard
            </button>
            <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm">
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
        {msg && (
          <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {msg}
          </div>
        )}

        <section className="mb-8 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Create Project</h2>
            <button
              onClick={() => {
                setName("");
                setDescription("");
                setMsg("");
              }}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Clear
            </button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project name"
            />

            <input
              className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
            />

            <button
              onClick={createProject}
              disabled={!name.trim()}
              className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              Create Project
            </button>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Projects</h2>
            <span className="rounded-full bg-white px-3 py-1 text-sm text-gray-600 ring-1 ring-gray-200">
              {projects.length} total
            </span>
          </div>

          {projects.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
              No projects yet
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {projects.map((p) => (
                <div key={p._id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <h3 className="font-semibold">{p.name}</h3>
                  {p.description && (
                    <p className="mt-2 text-sm text-gray-600">{p.description}</p>
                  )}
                  <p className="mt-3 text-sm text-gray-500">
                    Members: {p.members?.length || 0}
                  </p>

                  {isAdmin && (
                    <div className="mt-4 flex gap-2">
                      <select
                        className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        value={memberByProject[p._id] || ""}
                        onChange={(e) => setMemberByProject({
                          ...memberByProject,
                          [p._id]: e.target.value
                        })}
                      >
                        <option value="">Add member</option>
                        {users.map((u) => (
                          <option key={u._id} value={u._id}>
                            {u.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => addMember(p._id)}
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
