// Wrapper Response to unwrap the axios response
export interface UnWrappedResponse<T> {
  message: string;
  data: T;
}

// API response format for the frontend to handle responses from the backend.
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiError {
  success: boolean;
  message: string;
  errors?: unknown;
}

// User types
export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: string;
  createdAt: Date;
  updatedAt: Date;
}

// authentication response from the backend
export interface AuthData {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// reaction to messages
export interface Reaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: string;
}

// message types
export interface Message {
  id: string;
  content: string;
  conversationId: string;
  senderId: string;
  type: 'text' | 'audio' | 'video' | 'image' | 'file';
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  replyToId: string | null;
  replyTo: Message | null;
  editedAt: string | null;
  deletedAt: string | null;
  tempId?: string;
  reactions: Reaction[];
  sender: Pick<User, 'id' | 'username' | 'fullName' | 'avatar'>;
  createdAt: Date;
  updatedAt: Date;
}

// message status
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read';

// Typing indicator
export interface TypingIndicator {
  userId: string;
  conversationId: string;
}

// Conversation Participant
export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: string;
  role: 'admin' | 'member';
  joinedAt: string;
  lastReadAt: string | null;
  lastDeliveredAt: string | null;
  user: Pick<User, 'id' | 'username' | 'fullName' | 'avatar' | 'status'>;
}

// Conversation type
export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name: string | null;
  avatar: string | null;
  description: string | null;
  createdBy: string | null;
  participants: ConversationParticipant[];
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

// Call types
export interface Call {
  id: string;
  conversationId: string;
  initiatorId: string;
  type: 'audio' | 'video';
  status: 'ongoing' | 'ended' | 'missed' | 'rejected';
  startedAt: string;
  endedAt: string | null;
  duration: number | null;
}

// pagination types
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  nextCursor: string | null;
}
