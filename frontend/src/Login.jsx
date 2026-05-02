import { useState } from "react";
import API, { setToken } from "./api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [data, setData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    try {
      setLoading(true);
      setMsg("");

      const res = await API.post("/auth/login", data);

      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);

      navigate("/dashboard");
    } catch (err) {
      setMsg("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-gray-200">

      {/* LOGO */}
      <div className="bg-blue-600 text-white w-12 h-12 flex items-center justify-center rounded-xl mb-4 font-bold text-lg shadow-md">
        IT
      </div>

      {/* TITLE */}
      <h1 className="text-3xl font-bold text-gray-800 text-center">
        Team Task Manager
      </h1>

      <p className="text-gray-500 mb-6 text-center">
        Manage your team tasks efficiently
      </p>

      {/* CARD */}
      <div className="bg-white p-8 rounded-2xl shadow-lg w-[350px]">

        <h2 className="text-xl font-semibold text-center mb-6">
          Sign In
        </h2>

        {/* ERROR */}
        {msg && (
          <div className="mb-3 text-sm text-red-500 text-center">
            {msg}
          </div>
        )}

        {/* EMAIL */}
        <label className="text-sm text-gray-600">Email</label>
        <input
          type="email"
          className="w-full mt-1 mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setData({ ...data, email: e.target.value })}
        />

        {/* PASSWORD */}
        <label className="text-sm text-gray-600">Password</label>
        <input
          type="password"
          className="w-full mt-1 mb-5 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setData({ ...data, password: e.target.value })}
        />

        {/* BUTTON */}
        <button
          onClick={login}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 rounded-lg font-medium hover:opacity-90 transition"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        {/* LINK */}
        <p className="text-sm text-gray-500 mt-4 text-center">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-blue-600 font-medium">
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
}