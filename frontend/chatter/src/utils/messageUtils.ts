import type {
  ConversationParticipant,
  Message,
  MessageStatus,
} from '../types/api.types';

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

export const getMessageDeliveryStatus = (
  message: Message,
  currentUserId: string,
  participants: ConversationParticipant[]
): MessageStatus => {
  if (message.senderId !== currentUserId) return 'sent';

  const otherParticipants = participants.filter(
    (p) => p.userId !== currentUserId
  );

  const allRead = otherParticipants.every(
    (p) => p.lastReadAt && new Date(p.lastReadAt) > new Date(message.createdAt)
  );
  if (allRead) return 'read';

  // check if all others have RECEIVED it (exists in deliveries table)
  const allDelivered = otherParticipants.every((p) =>
    (message.deliveries ?? []).some((d) => d.userId === p.userId)
  );
  if (allDelivered) return 'delivered';
  return 'sent';
};
