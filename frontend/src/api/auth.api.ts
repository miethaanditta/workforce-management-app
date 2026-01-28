import { http } from './http';

export interface LoginRequest {
  email: string;
  password: string;
};

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
};

export interface LoginResponse {
  access_tokens: string;
  user: User
};

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface RegisterResponse {
  message: string,
  userId: string
}

export const login = async (payload: LoginRequest) => {
  const res = await http.post<LoginResponse>('/security/login', payload);
  return res.data;
};

export const register = async (userRole: string, payload: RegisterRequest) => {
  const res = await http.post<RegisterResponse>('/security/register', payload, {
    headers: {
      'x-user-role': userRole 
    }
  });
  return res.data;
};

export const updatePassword = async (id: string, newPassword: string) => {
  const res = await http.put<string>(`/security/update-password/${id}`, {
    password: newPassword
  });
  return res.data;
};
