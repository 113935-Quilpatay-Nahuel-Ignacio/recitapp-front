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
  authMethod?: string;
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
}
