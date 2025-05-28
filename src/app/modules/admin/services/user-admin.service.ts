import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UserRegistration, UserUpdate } from '../../user/models/user';
import { environment } from '../../../../environments/environment';

export interface AdminUserRegistration extends UserRegistration {
  roleName: string;
}

export interface UserDeletionSummary {
  userId: number;
  email: string;
  fullName: string;
  role: string;
  registrationDate: Date;
  active: boolean;
  relatedDataCounts: {
    refreshTokens: number;
    passwordResetTokens: number;
    notificationHistory: number;
    transactions: number;
    tickets: number;
    savedEvents: number;
    artistFollowers: number;
    venueFollowers: number;
    waitingRoomEntries: number;
    notificationPreferences: number;
  };
  totalRelatedRecords: number;
  warnings: string[];
  deletionImpact: 'BAJO' | 'MEDIO' | 'ALTO';
}

@Injectable({
  providedIn: 'root'
})
export class UserAdminService {
  private baseUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  // Obtener todos los usuarios
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users`);
  }

  // Obtener usuario por ID
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/users/${id}`);
  }

  // Crear usuario con rol específico (solo admins)
  createUserWithRole(userData: AdminUserRegistration): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/admin/users/create`, userData);
  }

  // Actualizar usuario
  updateUser(id: number, userData: UserUpdate): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/users/${id}`, userData);
  }

  // Eliminar usuario
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/${id}`);
  }

  // Obtener resumen de eliminación (información sobre datos relacionados)
  getUserDeletionSummary(id: number): Observable<UserDeletionSummary> {
    return this.http.get<UserDeletionSummary>(`${this.baseUrl}/users/${id}/related-data`);
  }

  // Obtener historial de compras de un usuario
  getUserPurchases(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/users/${userId}/purchases`);
  }

  // Obtener artistas seguidos por un usuario
  getUserFollowedArtists(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/users/${userId}/artists/following`);
  }

  // Obtener venues seguidos por un usuario
  getUserFollowedVenues(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/users/${userId}/venues/following`);
  }

  // Obtener preferencias de notificación de un usuario
  getUserNotificationPreferences(userId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/users/${userId}/notification-preferences`);
  }

  // Actualizar preferencias de notificación de un usuario
  updateUserNotificationPreferences(userId: number, preferences: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/users/${userId}/notification-preferences`, preferences);
  }
} 