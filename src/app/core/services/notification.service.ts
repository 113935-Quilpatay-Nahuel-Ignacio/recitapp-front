import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotificationPreference, Notification, NotificationChannel } from '../models/notification.model';
import { environment } from '../../../environments/environment';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  private adminApiUrl = `${environment.apiUrl}/admin`; // Adjusted for admin endpoints

  constructor(
    private http: HttpClient,
    private sessionService: SessionService
  ) { }

  // ================================================================================
  // USER NOTIFICATION PREFERENCES
  // ================================================================================

  getUserNotificationPreferences(): Observable<NotificationPreference> {
    const userId = this.sessionService.getCurrentUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    return this.http.get<NotificationPreference>(`${this.apiUrl}/user/${userId}/preferences`);
  }

  updateUserNotificationPreferences(preferences: NotificationPreference): Observable<NotificationPreference> {
    const userId = this.sessionService.getCurrentUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    return this.http.put<NotificationPreference>(`${this.apiUrl}/user/${userId}/preferences`, preferences);
  }

  // RAPP113935-123: Emitir alertas de eventos nuevos - This is likely a backend-triggered process.
  // Frontend might subscribe to a WebSocket or similar for real-time alerts, or fetch periodically.
  // For now, we can provide a method to fetch new/unread notifications.
  getUnreadNotifications(): Observable<Notification[]> {
    const userId = this.sessionService.getCurrentUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    return this.http.get<Notification[]>(`${this.apiUrl}/user/${userId}/unread`);
  }


  // RAPP113935-124: Generar notificaciones de baja disponibilidad de entradas - Mostly backend.
  // Admin can trigger this. We can add the admin endpoint call if needed.
  triggerLowAvailabilityCheck(): Observable<void> {
    const userId = this.sessionService.getCurrentUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    return this.http.post<void>(`${this.adminApiUrl}/notifications/check-low-availability`, {});
  }


  // RAPP113935-125: Consultar historial de notificaciones
  getUserNotificationHistory(startDate?: string, endDate?: string): Observable<Notification[]> {
    const userId = this.sessionService.getCurrentUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    return this.http.get<Notification[]>(`${this.apiUrl}/user/${userId}/history`, { params });
  }

  // RAPP113935-126: Registrar notificaciones por cancelación o modificación - Mostly backend triggered
  // Admin can trigger these.
  notifyEventModification(eventId: number, changeDescription: string): Observable<void> {
    const userId = this.sessionService.getCurrentUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    return this.http.post<void>(`${this.adminApiUrl}/events/${eventId}/notify-modification`, null, { params: { changeDescription } });
  }

  notifyEventCancellation(eventId: number): Observable<void> {
    const userId = this.sessionService.getCurrentUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    return this.http.post<void>(`${this.adminApiUrl}/events/${eventId}/notify-cancellation`, null);
  }

  // RAPP113935-127: Emitir recomendaciones basadas en preferencias - Mostly backend.
  // Admin can trigger this.
  triggerWeeklyRecommendations(): Observable<void> {
    const userId = this.sessionService.getCurrentUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    return this.http.post<void>(`${this.adminApiUrl}/notifications/generate-recommendations`, {});
  }


  // RAPP113935-128: Actualizar canales de notificación (Admin task)
  getAllNotificationChannels(): Observable<NotificationChannel[]> {
    const userId = this.sessionService.getCurrentUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    return this.http.get<NotificationChannel[]>(`${this.adminApiUrl}/notifications/channels`);
  }

  updateNotificationChannel(channelId: number, channelData: Partial<NotificationChannel>): Observable<NotificationChannel> {
    const userId = this.sessionService.getCurrentUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    return this.http.put<NotificationChannel>(`${this.adminApiUrl}/notifications/channels/${channelId}`, channelData);
  }

  // Helper methods that might be useful based on NotificationController
  markNotificationAsRead(notificationId: number): Observable<Notification> {
    const userId = this.sessionService.getCurrentUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    return this.http.patch<Notification>(`${this.apiUrl}/${notificationId}/read`, {});
  }

  markMultipleNotificationsAsRead(notificationIds: number[]): Observable<void> {
    const userId = this.sessionService.getCurrentUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    return this.http.patch<void>(`${this.apiUrl}/user/${userId}/read-multiple`, notificationIds);
  }
} 