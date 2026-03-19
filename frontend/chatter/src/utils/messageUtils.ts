import type { Message, MessageStatus } from '../types/api.types';

export const getMessageTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const getStatusIcon = (
  status: MessageStatus | undefined,
  isSent: boolean
) => {
  if (!isSent) return null;
  switch (status) {
    case 'pending':
      return 'pending';
    case 'sent':
      return 'sent';
    case 'delivered':
      return 'delivered';
    case 'read':
      return 'read';
    case 'failed':
      return 'failed';
    default:
      return 'sent';
  }
};

export const isMessageDeleted = (message: Message): boolean => {
  return !!message.deletedAt;
};
