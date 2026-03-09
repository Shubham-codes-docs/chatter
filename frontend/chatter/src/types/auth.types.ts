export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterInput {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  bio?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
