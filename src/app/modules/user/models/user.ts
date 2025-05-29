import { Role } from './role';

export interface User {
  id?: number;
  email: string;
  firstName: string;
  lastName: string;
  dni: string;
  country: string;
  city: string;
  registrationDate?: Date;
  roleName?: string;
  role?: Role;
  authMethod?: string;
  active?: boolean | number;
  walletBalance?: number;
  lastConnection?: Date;
  phone?: string;
  address?: string;
  profileImage?: string;
}

export interface UserRegistration {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dni: string;
  country: string;
  city: string;
  firebaseUid?: string;
}

export interface UserUpdate {
  email?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  city?: string;
  password?: string;
  phone?: string;
  address?: string;
}
