import { useState } from "react";
import { login } from "../../services/authService";
import { Navigate, useNavigate } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const navigate=useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = await login(form);

    if (data.token) {
      localStorage.setItem("token", data.token);
      navigate("/battle");
    } else {
      alert(data.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" onChange={handleChange} placeholder="Email" />
      <input type="password" name="password" onChange={handleChange} placeholder="Password" />
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;
