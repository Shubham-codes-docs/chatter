import api, { apiRequest } from './api';
import { type RegisterInput, type LoginInput } from '../schemas/auth.schema';
import { type AuthData, type User } from '../types/api.types';

export const authService = {
  register: async (data: RegisterInput) => {
    const { data: authData, message } = await apiRequest<AuthData>(
      api.post('/auth/register', data)
    );
    return { data: authData, message };
  },

  login: async (data: LoginInput) => {
    const { data: authData, message } = await apiRequest<AuthData>(
      api.post('/auth/login', data)
    );
    return { data: authData, message };
  },

  getCurrentUser: async () => {
    const { data, message } = await apiRequest<{ user: User }>(
      api.get('/auth/me')
    );
    return { data: data.user, message };
  },

  logout: async () => {
    await apiRequest(api.post('/auth/logout'));
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};
