import api from "./axiosclient";

export function login({ email, password }) {
  return api.post("/auth/login", { email, password });
}