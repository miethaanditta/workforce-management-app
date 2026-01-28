import type { LoginResponse, User } from "../api/auth.api";

export const saveAuth = (res: LoginResponse) => {
  localStorage.setItem('accessToken', res.access_tokens);
  localStorage.setItem('user', JSON.stringify(res.user));
};

export const clearAuth = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
};

export const getToken = () => {
  return localStorage.getItem('accessToken');
};

export const getUser = (): User | null => {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
};
