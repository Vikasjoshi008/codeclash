import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-blue text-white shadow-md">
      <h1 className="font-bold text-xl cursor-pointer">
        <Link to="/">CodeClash</Link>
        </h1>

      <div className="flex gap-6 items-center cursor-pointer">
        <Link to="/practice">Practice</Link>

        {isLoggedIn && <Link to="/dashboard">Dashboard</Link>}

        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="text-red-400 hover:text-red-300 cursor-pointer"
          >
            Logout
          </button>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}
