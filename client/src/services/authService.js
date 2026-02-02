import api from "./api";

export const signup = async (userData) => {
  const res = await api.post("/auth/register", userData);
  return res.data;
};

export const login = async (userData) => {
  const res = await api.post("/auth/login", userData);
  return res.data;
};
