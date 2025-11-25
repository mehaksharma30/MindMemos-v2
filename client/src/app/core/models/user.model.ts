export interface User {
  id: string;
  username: string;
  email: string;
  tokens: number;
  xp: number;
  level: number;
  badge: 'none' | 'silver' | 'gold' | 'diamond';
  createdAt?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}
