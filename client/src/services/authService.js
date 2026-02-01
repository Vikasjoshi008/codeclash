// const API_URL = import.meta.env.VITE_API_URL;

// export const signup = async (userData) => {
//   const res = await fetch(`${API_URL}/register`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(userData),
//   });

//   if (!res.ok) {
//     throw new Error("Signup failed");
//   }

//   return res.json();
// };

// export const login = async (userData) => {
//   const res = await fetch(`${API_URL}/login`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(userData),
//   });

//   if (!res.ok) {
//     throw new Error("Login failed");
//   }

//   return res.json();
// };

import api from "./api";

export const signup = (userData) =>
  api.post("/auth/register", userData).then(res => res.data);

export const login = (userData) =>
  api.post("/auth/login", userData).then(res => res.data);
