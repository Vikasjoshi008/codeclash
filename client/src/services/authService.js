import api from "./api";

export const signup = (userData) =>
  api.post("/auth/register", userData).then(res => res.data);

export const login = (userData) =>
  api.post("/auth/login", userData).then(res => res.data);
