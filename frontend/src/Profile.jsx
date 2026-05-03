import { useState } from "react";
import { useNavigate } from "react-router-dom";

const getUser = () => {
  const savedUser = localStorage.getItem("user");
  if (savedUser) return JSON.parse(savedUser);

  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

const getInitialUser = () => {
  const user = getUser();

  return {
    name: user?.name || "",
    email: user?.email || "Not available",
    role: user?.role || "Member",
  };
};

export default function Profile() {
  const navigate = useNavigate();

  const [user] = useState(getInitialUser);

  return (
    <div className="min-h-screen bg-gray-100">

      {/* 🔹 NAVBAR */}
      <div className="flex justify-between items-center px-8 py-4 bg-white shadow">
        <h1 className="text-xl font-semibold">📁 Team Task Manager</h1>

        <div className="flex gap-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate("/projects")}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Projects
          </button>
          <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm">
            Profile
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white w-10 h-10 flex items-center justify-center rounded-full">
            {user.name?.charAt(0)}
          </div>
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-gray-500">{user.role}</p>
          </div>
        </div>
      </div>

      {/* 🔹 MAIN */}
      <div className="flex justify-center mt-10">
        <div className="w-full max-w-xl">

          {/* 🔹 PROFILE CARD */}
          <div className="bg-white p-6 rounded-xl shadow mb-6">

            <h2 className="text-2xl font-semibold mb-6 text-center">
              Profile
            </h2>

            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gray-200 w-14 h-14 rounded-xl flex items-center justify-center text-xl">
                👤
              </div>

              <div>
                <h3 className="text-lg font-semibold">{user.name}</h3>

                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                  {user.role}
                </span>
              </div>
            </div>

            <hr className="mb-4" />

            <div className="space-y-4 text-gray-600">

              <div>
                <p className="text-sm text-gray-400">Name</p>
                <p className="font-medium">{user.name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>

              <div>
                <p className="text-sm text-gray-400">Role</p>
                <p className="font-medium">{user.role}</p>
              </div>

            </div>

            <button className="mt-6 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
              Edit profile
            </button>

          </div>

          {/* 🔹 ACCOUNT SETTINGS */}
          <div className="bg-white p-6 rounded-xl shadow">

            <h3 className="text-lg font-semibold mb-2">
              Account settings
            </h3>

            <p className="text-gray-500 mb-4 text-sm">
              Manage your account preferences and security
            </p>

            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/");
              }}
              className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
            >
              Logout
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}
