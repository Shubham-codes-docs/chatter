import api, { apiRequest } from './api';
import type { Conversation } from '../types/api.types';

export const conversationService = {
  create: async (
    type: 'direct' | 'group',
    participantIds: string[],
    name?: string,
    about?: string
  ): Promise<Conversation> => {
    const { data } = await apiRequest<Conversation>(
      api.post('/conversations', { type, name, participantIds, about })
    );
    return data;
  },
  leaveGroup: async (conversationId: string, userId: string): Promise<void> => {
    await apiRequest(
      api.delete(`/conversations/${conversationId}/participants/${userId}`)
    );
  },
  updateParticipantRole: async (
    conversationId: string,
    userId: string,
    role: 'admin' | 'member'
  ): Promise<void> => {
    await apiRequest(
      api.put(`/conversations/${conversationId}/participants/${userId}`, {
        role,
      })
    );
  },
  removeParticipant: async (
    conversationId: string,
    userId: string
  ): Promise<void> => {
    await apiRequest(
      api.delete(`/conversations/${conversationId}/participants/${userId}`)
    );
  },
  getConversationDetails: async (
    conversationId: string
  ): Promise<Conversation> => {
    const { data } = await apiRequest<Conversation>(
      api.get(`/conversations/${conversationId}`)
    );
    return data;
  },
  editConversationDetails: async (
    conversationId: string,
    name: string,
    description?: string
  ): Promise<Conversation> => {
    const { data } = await apiRequest<Conversation>(
      api.put(`/conversations/${conversationId}`, { name, description })
    );
    return data;
  },
  deleteConversation: async (conversationId: string): Promise<void> => {
    await apiRequest(api.delete(`/conversations/${conversationId}`));
  },
};
