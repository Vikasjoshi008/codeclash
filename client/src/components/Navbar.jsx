// import React from "react";
// import { Link, useNavigate } from "react-router-dom";

// export default function Navbar() {
//   const navigate = useNavigate();
//   const isLoggedIn = !!localStorage.getItem("token");

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("userId");
//     navigate("/login");
//   };

//   return (
//     <nav className="flex justify-between items-center px-6 py-4 bg-blue text-white shadow-md">
//       <h1 className="font-bold text-xl cursor-pointer">
//         <Link to="/">CodeClash</Link>
//       </h1>

//       <div className="flex gap-6 items-center cursor-pointer">
//         <Link to="/practice">Practice</Link>

//         {isLoggedIn && <Link to="/dashboard">Dashboard</Link>}

//         {isLoggedIn ? (
//           <button
//             onClick={handleLogout}
//             className="text-red-400 hover:text-red-300 cursor-pointer"
//           >
//             Logout
//           </button>
//         ) : (
//           <Link to="/login">Login</Link>
//         )}
//       </div>
//     </nav>
//   );
// }
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaCode,
  FaUser,
  FaSignOutAlt,
  FaSignInAlt
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
    <nav className="flex justify-between items-center px-6 py-4 text-white shadow-md">
      {/* Logo */}
      <h1 className="font-bold text-xl">
        <Link to="/" className="flex items-center gap-2">
          <FaCode />
          CodeClash
        </Link>
      </h1>

      {/* Links */}
      <div className="flex gap-6 items-center">
        {/* Home */}
        <Link to="/" className="flex items-center gap-2 hover:text-gray-200">
          <FaHome />
          Home
        </Link>

        {/* Practice */}
        <Link
          to="/practice"
          className="flex items-center gap-2 hover:text-gray-200"
        >
          <FaCode />
          Practice
        </Link>

        {/* Dashboard (only if logged in) */}
        {isLoggedIn && (
          <Link
            to="/dashboard"
            className="flex items-center gap-2 hover:text-gray-200"
          >
            <FaUser />
            Dashboard
          </Link>
        )}

        {/* Login / Logout */}
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-300 hover:text-red-200"
          >
            <FaSignOutAlt />
            Logout
          </button>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-2 hover:text-gray-200"
          >
            <FaSignInAlt />
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
