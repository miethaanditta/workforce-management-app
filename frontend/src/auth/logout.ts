import { clearAuth } from './auth.storage';

export const logout = () => {
  clearAuth();
  window.location.href = '/login';
};
