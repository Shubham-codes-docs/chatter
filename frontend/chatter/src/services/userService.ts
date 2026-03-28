import api, { apiRequest } from './api';
import type { User } from '../types/api.types';

export const userService = {
  searchUsers: async (query: string): Promise<User[]> => {
    const { data } = await apiRequest<User[]>(
      api.get('/users/search', { params: { q: query } })
    );
    return data;
  },
  getUserById: async (id: string): Promise<User> => {
    const { data } = await apiRequest<{ user: User }>(api.get(`/users/${id}`));
    return data.user;
  },
  updateProfile: async (
    fullName: string,
    username: string,
    bio: string
  ): Promise<User> => {
    const { data } = await apiRequest<User>(
      api.put('/users/profile', { fullName, username, bio })
    );
    return data;
  },
  updatePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<void> => {
    await apiRequest(
      api.put('/users/password', { currentPassword, newPassword })
    );
  },
  deleteAccount: async (email: string): Promise<void> => {
    await apiRequest(api.delete('/users/account', { data: { email } }));
  },
};
