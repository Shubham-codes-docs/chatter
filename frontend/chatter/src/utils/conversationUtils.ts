import type { Conversation, TypingIndicator } from '../types/api.types';

export const getConversationName = (
  conversation: Conversation,
  currentUserId: string
) => {
  if (conversation.type === 'group') return conversation.name || 'Group';

  const otherParticipant = conversation.participants.find(
    (p) => p.userId !== currentUserId
  );
  return otherParticipant?.user.fullName || 'Unknown';
};

export const getConversationAvatar = (
  conversation: Conversation,
  currentUserId: string
): string => {
  if (conversation.type === 'group') return conversation.name?.charAt(0) || 'G';
  const otherParticipant = conversation.participants.find(
    (p) => p.userId !== currentUserId
  );
  return otherParticipant?.user.fullName?.charAt(0) || '?';
};

export const getLastMessage = (
  conversation: Conversation,
  typingUsers: Record<string, TypingIndicator[]>,
  currentUserId: string
): string => {
  const typingInMessage = (typingUsers[conversation.id] || []).filter(
    (t) => t.userId !== currentUserId
  );
  if (typingInMessage.length > 0) return 'typing...';

  const lastMsg = conversation.messages[0];
  if (!lastMsg) return 'No messages yet';
  if (lastMsg.deletedAt) return 'Message deleted';
  return lastMsg.content;
};

export const getOnlineStatus = (
  conversation: Conversation,
  currentUserId: string,
  onlineUsers: string[]
): boolean => {
  if (conversation.type === 'group') return false;
  const otherParticipant = conversation.participants.find(
    (p) => p.userId !== currentUserId
  );
  if (!otherParticipant) return false;
  return onlineUsers.includes(otherParticipant.userId);
};

export const formatConversationTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  if (days === 1) return 'Yesterday';
  if (days < 7) return date.toLocaleDateString('en-US', { weekday: 'long' });
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const getTypersName = (
  userId: string,
  activeConversationId: string,
  conversations: Conversation[]
) => {
  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );
  const participant = activeConversation?.participants.find(
    (p) => p.userId === userId
  );
  return participant?.user.fullName || 'Someone';
};
