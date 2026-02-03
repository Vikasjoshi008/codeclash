import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaCode,
  FaUser,
  FaSignOutAlt,
  FaSignInAlt,
} from "react-icons/fa";

export default function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#020617]/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between text-white">
        {/* ===== Logo ===== */}
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-bold tracking-wide hover:text-purple-400 transition cursor-pointer"
        >
          <FaCode className="text-purple-400" />
          CodeClash
        </Link>

        {/* ===== Desktop Links ===== */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-300 hover:text-white transition cursor-pointer"
          >
            <FaHome />
            Home
          </Link>

          <Link
            to="/practice"
            className="flex items-center gap-2 text-gray-300 hover:text-white transition cursor-pointer"
          >
            <FaCode />
            Practice
          </Link>

          {isLoggedIn && (
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-gray-300 hover:text-white transition cursor-pointer"
            >
              <FaUser />
              Dashboard
            </Link>
          )}

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-400 hover:text-red-300 transition cursor-pointer"
            >
              <FaSignOutAlt />
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 text-gray-300 hover:text-white transition cursor-pointer"
            >
              <FaSignInAlt />
              Login
            </Link>
          )}
        </div>

        {/* ===== Mobile Menu ===== */}
        <div className="md:hidden flex items-center gap-4">
          <Link
            to="/"
            className="text-gray-300 hover:text-white transition cursor-pointer"
            title="Home"
          >
            <FaHome size={18} />
          </Link>

          <Link
            to="/practice"
            className="text-gray-300 hover:text-white transition cursor-pointer"
            title="Practice"
          >
            <FaCode size={18} />
          </Link>

          {isLoggedIn && (
            <Link
              to="/dashboard"
              className="text-gray-300 hover:text-white transition cursor-pointer"
              title="Dashboard"
            >
              <FaUser size={18} />
            </Link>
          )}

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 transition cursor-pointer"
              title="Logout"
            >
              <FaSignOutAlt size={18} />
            </button>
          ) : (
            <Link
              to="/login"
              className="text-gray-300 hover:text-white transition cursor-pointer"
              title="Login"
            >
              <FaSignInAlt size={18} />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
