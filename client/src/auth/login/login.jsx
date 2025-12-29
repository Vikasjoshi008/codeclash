import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-8"
      >
        <h1 className="text-3xl font-bold text-white text-center">
          Welcome back ⚔️
        </h1>
        <p className="text-gray-400 text-center mt-2">
          Login to continue to <span className="text-indigo-400">CodeClash</span>
        </p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-500/10 text-red-400 text-sm p-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Email address"
            className="w-full rounded-lg bg-black/40 px-4 py-3 text-white placeholder-gray-400 outline-none border border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full rounded-lg bg-black/40 px-4 py-3 text-white placeholder-gray-400 outline-none border border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition"
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3 text-gray-400 hover:text-white transition"
            >
              👁️
            </button>
          </div>

          <button
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-60 transition"
          >
            {loading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="text-sm text-gray-400 text-center mt-6">
          New to CodeClash?{" "}
          <Link
            to="/signup"
            className="text-indigo-400 hover:text-indigo-300 transition"
          >
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
