import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotificationPreference, Notification, NotificationChannel } from '../models/notification.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  private adminApiUrl = `${environment.apiUrl}/admin`; // Adjusted for admin endpoints

  // MOCKED USER ID
  private userId = 4;

  constructor(private http: HttpClient) { }

  // RAPP113935-122: Registrar preferencias de notificación
  getUserNotificationPreferences(): Observable<NotificationPreference> {
    return this.http.get<NotificationPreference>(`${this.apiUrl}/user/${this.userId}/preferences`);
  }

  updateUserNotificationPreferences(preferences: NotificationPreference): Observable<NotificationPreference> {
    return this.http.put<NotificationPreference>(`${this.apiUrl}/user/${this.userId}/preferences`, preferences);
  }

  // RAPP113935-123: Emitir alertas de eventos nuevos - This is likely a backend-triggered process.
  // Frontend might subscribe to a WebSocket or similar for real-time alerts, or fetch periodically.
  // For now, we can provide a method to fetch new/unread notifications.
  getUnreadNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/user/${this.userId}/unread`);
  }


  // RAPP113935-124: Generar notificaciones de baja disponibilidad de entradas - Mostly backend.
  // Admin can trigger this. We can add the admin endpoint call if needed.
  triggerLowAvailabilityCheck(): Observable<void> {
    return this.http.post<void>(`${this.adminApiUrl}/notifications/check-low-availability`, {});
  }


  // RAPP113935-125: Consultar historial de notificaciones
  getUserNotificationHistory(startDate?: string, endDate?: string): Observable<Notification[]> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    return this.http.get<Notification[]>(`${this.apiUrl}/user/${this.userId}/history`, { params });
  }

  // RAPP113935-126: Registrar notificaciones por cancelación o modificación - Mostly backend triggered
  // Admin can trigger these.
  notifyEventModification(eventId: number, changeDescription: string): Observable<void> {
    return this.http.post<void>(`${this.adminApiUrl}/events/${eventId}/notify-modification`, null, { params: { changeDescription } });
  }

  notifyEventCancellation(eventId: number): Observable<void> {
    return this.http.post<void>(`${this.adminApiUrl}/events/${eventId}/notify-cancellation`, null);
  }

  // RAPP113935-127: Emitir recomendaciones basadas en preferencias - Mostly backend.
  // Admin can trigger this.
  triggerWeeklyRecommendations(): Observable<void> {
    return this.http.post<void>(`${this.adminApiUrl}/notifications/generate-recommendations`, {});
  }


  // RAPP113935-128: Actualizar canales de notificación (Admin task)
  getAllNotificationChannels(): Observable<NotificationChannel[]> {
    return this.http.get<NotificationChannel[]>(`${this.adminApiUrl}/notifications/channels`);
  }

  updateNotificationChannel(channelId: number, channelData: Partial<NotificationChannel>): Observable<NotificationChannel> {
    return this.http.put<NotificationChannel>(`${this.adminApiUrl}/notifications/channels/${channelId}`, channelData);
  }

  // Helper methods that might be useful based on NotificationController
  markNotificationAsRead(notificationId: number): Observable<Notification> {
    return this.http.patch<Notification>(`${this.apiUrl}/${notificationId}/read`, {});
  }

  markMultipleNotificationsAsRead(notificationIds: number[]): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/user/${this.userId}/read-multiple`, notificationIds);
  }
} 