// API response format for the frontend to handle responses from the backend.
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
}

export interface ApiError {
  success: boolean;
  error: string;
  stack?: string;
}

// User types
export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  bio?: string;
}

// authentication response from the backend
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  success: boolean;
  message: string;
}

// message types
export interface Message {
  id: string;
  senderId: string;
  content: string;
  conversationId: string;
  createdAt: Date;
  updatedAt: Date;
}

// conversation types
export interface Conversation {
  id: string;
  participants: User[];
  type: 'private' | 'group';
  name?: string; // Only for group conversations
  avatar?: string; // Only for group conversations
  lastMessage?: Message;
  unreadCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: string;
  user: User;
  role?: 'admin' | 'member';
  createdAt: Date;
  updatedAt: Date;
}

// pagination types
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
