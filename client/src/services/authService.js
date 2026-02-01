const API_URL = import.meta.env.VITE_API_URL; 
// use deployed URL later

export const signup = async (userData) => {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData)
  });
  return res.json();
};

export const login = async (userData) => {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData)
  });
  return res.json();
};
