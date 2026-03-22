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
};
