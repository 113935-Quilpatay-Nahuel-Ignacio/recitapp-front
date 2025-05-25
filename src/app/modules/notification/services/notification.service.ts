import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { NotificationPreferenceDTO } from '../models/notification-preference.dto';
import { Notification } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  // TODO: Replace with actual API URL from environment config
  private apiUrlBase = '/api'; // Example base API URL 
  private userId = '4'; // Placeholder for actual logged-in user ID, updated to 4

  constructor() { }

  // RAPP113935-122 & RAPP113935-128: User Notification Preferences
  getNotificationPreferences(): Observable<NotificationPreferenceDTO> {
    return this.http.get<NotificationPreferenceDTO>(
      `${this.apiUrlBase}/users/${this.userId}/notification-preferences`
    );
  }

  updateNotificationPreferences(
    preferencesDTO: NotificationPreferenceDTO
  ): Observable<NotificationPreferenceDTO> {
    return this.http.put<NotificationPreferenceDTO>(
      `${this.apiUrlBase}/users/${this.userId}/notification-preferences`,
      preferencesDTO
    );
  }

  // RAPP113935-125: Consultar historial de notificaciones
  getNotificationHistory(startDate?: string, endDate?: string): Observable<Notification[]> {
    let params = new HttpParams();
    if (startDate) {
      params = params.append('startDate', startDate);
    }
    if (endDate) {
      params = params.append('endDate', endDate);
    }
    return this.http.get<Notification[]>(
      `${this.apiUrlBase}/notifications/user/${this.userId}/history`,
      { params }
    );
  }

  // For Notification Center - typically unread or recent
  getNotifications(): Observable<Notification[]> {
    // API provides /unread endpoint. Or could use history with date filters.
    // For simplicity, using /unread for now.
    return this.http.get<Notification[]>(
      `${this.apiUrlBase}/notifications/user/${this.userId}/unread`
    );
  }

  // RAPP113935-123 (partially, as backend sends these)
  // No direct frontend method to "emit" alerts, but can fetch them.
  // getNewEventAlerts() could call getNotifications() and filter by type if needed,
  // or rely on a specific API if available (not obvious from controller for unread new events).

  markNotificationAsRead(notificationId: string): Observable<Notification> {
    return this.http.patch<Notification>(
      `${this.apiUrlBase}/notifications/${notificationId}/read`,
      {}
    );
  }

  markMultipleAsRead(notificationIds: string[]): Observable<void> {
    return this.http.patch<void>(
      `${this.apiUrlBase}/notifications/user/${this.userId}/read-multiple`,
      notificationIds
    );
  }

  // The following methods are for admin or backend-triggered actions, 
  // not typically called directly from standard user flows in the frontend
  // based on the HU list provided (RAPP113935-123 to RAPP113935-128 for FE).
  // - sendNewEventAlert
  // - sendLowAvailabilityAlert
  // - sendEventCancellationNotification
  // - sendEventModificationNotification
  // - sendPersonalizedRecommendations
}
