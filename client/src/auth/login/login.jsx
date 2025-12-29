// import { useState } from "react";
// import { login } from "../../services/authService";
// import { Navigate, useNavigate } from "react-router-dom";

// function Login() {
//   const [form, setForm] = useState({
//     email: "",
//     password: ""
//   });
//   const navigate=useNavigate();

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const data = await login(form);

//     if (data.token) {
//       localStorage.setItem("token", data.token);
//       navigate("/dashboard");
//     } else {
//       alert(data.message);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <input name="email" onChange={handleChange} placeholder="Email" /><br /><br />
//       <input type="password" name="password" onChange={handleChange} placeholder="Password" /><br />br
//       <button type="submit">Login</button>
//     </form>
//   );
// }

// export default Login;
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { login } from "../../services/authService";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await login(form);

      if (data.token) {
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-xl"
      >
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          Login to CodeClash
        </h2>

        {error && (
          <p className="bg-red-500/10 text-red-400 text-sm p-3 rounded mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <span
              className="absolute right-4 top-3 cursor-pointer text-gray-400"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <button
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-3 rounded-lg font-semibold transition"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="text-gray-400 text-sm text-center mt-4">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-indigo-400 hover:underline">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;


