import api, { apiRequest } from './api';
import type { Reaction } from '../types/api.types';

export const messageService = {
  reactToMessage: async (messageId: string, reaction: string) => {
    const { data } = await apiRequest<Reaction>(
      api.post(`/messages/${messageId}/reactions`, { reaction })
    );
    return data;
  },
};
