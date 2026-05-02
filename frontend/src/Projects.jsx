import { useEffect, useState } from "react";
import API from "./api";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");

  const fetchProjects = async () => {
    try {
      const res = await API.get("/projects");
      setProjects(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const createProject = async () => {
    try {
      await API.post("/projects", { name });
      setName("");
      fetchProjects();
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Projects</h1>

      <div className="flex gap-2 mb-6">
        <input
          className="border p-2 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Project name"
        />

        <button
          onClick={createProject}
          className="bg-blue-600 text-white px-4 rounded"
        >
          Create
        </button>
      </div>

      {projects.length === 0 ? (
        <p>No projects yet</p>
      ) : (
        projects.map((p) => (
          <div key={p._id} className="p-4 bg-white shadow rounded mb-3">
            <h2 className="font-semibold">{p.name}</h2>
          </div>
        ))
      )}
    </div>
  );
}