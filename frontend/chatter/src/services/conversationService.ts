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
};
