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
    const { data } = await apiRequest<User>(api.get(`/users/${id}`));
    return data;
  },
  updateProfile: async (
    fullName: string,
    username: string,
    bio: string,
    avatar?: string
  ): Promise<User> => {
    const { data } = await apiRequest<User>(
      api.put('/users/profile', { fullName, username, bio, avatar })
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
  blockUser: async (userId: string): Promise<void> => {
    await apiRequest(api.post(`/users/${userId}/block`));
  },
  unBlockUser: async (userId: string): Promise<void> => {
    await apiRequest(api.delete(`/users/${userId}/block`));
  },
  getBlockedUsers: async (): Promise<
    {
      blockedId: string;
      blocked: Pick<User, 'id' | 'username' | 'fullName' | 'avatar'>;
    }[]
  > => {
    const { data } = await apiRequest<
      {
        blockedId: string;
        blocked: Pick<User, 'id' | 'username' | 'fullName' | 'avatar'>;
      }[]
    >(api.get('/users/blocked'));
    return data;
  },
};
