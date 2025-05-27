export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  dni?: string;
  phone?: string;
  address?: string;
  profileImage?: string;
  registrationDate?: Date;
  lastConnection?: Date;
  active: boolean;
  country?: string;
  city?: string;
  authMethod?: string;
  walletBalance?: number;
  role: Role;
}

export interface Role {
  id: number;
  name: string;
  description: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserRegistrationRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  dni: string;
  phone?: string;
  address?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  refreshToken: string;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
} 