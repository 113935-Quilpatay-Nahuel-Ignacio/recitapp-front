import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { NotificationPreferenceDTO } from '../models/notification-preference.dto';
import { Notification } from '../models/notification.model';
import { SessionService } from '../../../core/services/session.service';
import { environment } from '../../../../environments/environment';
import { 
  NotificationPreferences, 
  TestEmailRequest, 
  TestPushRequest, 
  TestSmsRequest,
  ApiResponse 
} from '../models/notification.models';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private sessionService = inject(SessionService);
  private apiUrlBase = environment.apiUrl; 

  constructor() { }

  // RAPP113935-122 & RAPP113935-128: User Notification Preferences
  getNotificationPreferences(): Observable<NotificationPreferenceDTO> {
    const userId = this.sessionService.getCurrentUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    return this.http.get<NotificationPreferenceDTO>(`${this.apiUrlBase}/notifications/user/${userId}/preferences`);
  }

  updateNotificationPreferences(
    preferencesDTO: NotificationPreferenceDTO
  ): Observable<NotificationPreferenceDTO> {
    const userId = this.sessionService.getCurrentUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    return this.http.put<NotificationPreferenceDTO>(
      `${this.apiUrlBase}/notifications/user/${userId}/preferences`,
      preferencesDTO
    );
  }

  // RAPP113935-125: Consultar historial de notificaciones (legacy method)
  getNotificationHistoryByDate(startDate?: string, endDate?: string): Observable<Notification[]> {
    const userId = this.sessionService.getCurrentUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    let params = new HttpParams();
    if (startDate) {
      params = params.append('startDate', startDate);
    }
    if (endDate) {
      params = params.append('endDate', endDate);
    }
    return this.http.get<Notification[]>(
      `${this.apiUrlBase}/notifications/user/${userId}/history`,
      { params }
    );
  }

  // For Notification Center - typically unread or recent
  getNotifications(): Observable<Notification[]> {
    // API provides /unread endpoint. Or could use history with date filters.
    // For simplicity, using /unread for now.
    const userId = this.sessionService.getCurrentUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    return this.http.get<Notification[]>(
      `${this.apiUrlBase}/notifications/user/${userId}/history`
    );
  }

  // Get only unread notifications
  getUnreadNotifications(): Observable<Notification[]> {
    const userId = this.sessionService.getCurrentUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    return this.http.get<Notification[]>(
      `${this.apiUrlBase}/notifications/user/${userId}/unread`
    );
  }

  // RAPP113935-123 (partially, as backend sends these)
  // No direct frontend method to "emit" alerts, but can fetch them.
  // getNewEventAlerts() could call getNotifications() and filter by type if needed,
  // or rely on a specific API if available (not obvious from controller for unread new events).

  markNotificationAsRead(notificationId: string): Observable<Notification> {
    const userId = this.sessionService.getCurrentUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    return this.http.patch<Notification>(
      `${this.apiUrlBase}/notifications/${notificationId}/read`,
      {}
    );
  }

  markMultipleAsRead(notificationIds: string[]): Observable<void> {
    const userId = this.sessionService.getCurrentUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    return this.http.patch<void>(
      `${this.apiUrlBase}/notifications/user/${userId}/read-multiple`,
      notificationIds
    );
  }

  // Delete notification methods
  deleteNotification(notificationId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrlBase}/notifications/${notificationId}`
    );
  }

  deleteMultipleNotifications(notificationIds: string[]): Observable<void> {
    const userId = this.sessionService.getCurrentUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    return this.http.delete<void>(
      `${this.apiUrlBase}/notifications/user/${userId}/multiple`,
      { body: notificationIds }
    );
  }

  deleteReadNotifications(): Observable<void> {
    const userId = this.sessionService.getCurrentUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    return this.http.delete<void>(
      `${this.apiUrlBase}/notifications/user/${userId}/read`
    );
  }

  // Device Token Management for Push Notifications
  registerDeviceToken(deviceToken: string, deviceType: string, deviceName?: string): Observable<any> {
    const userId = this.sessionService.getCurrentUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    
    const requestBody = {
      userId: userId,
      deviceToken: deviceToken,
      deviceType: deviceType,
      deviceName: deviceName || navigator.userAgent.split(' ')[0] // Fallback device name
    };
    
    return this.http.post<any>(`${this.apiUrlBase}/device-tokens/register-from-app`, requestBody);
  }

  updateDeviceToken(oldToken: string, newToken: string): Observable<any> {
    const userId = this.sessionService.getCurrentUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    
    const params = new HttpParams()
      .set('userId', userId.toString())
      .set('oldToken', oldToken)
      .set('newToken', newToken);
    
    return this.http.put<any>(`${this.apiUrlBase}/device-tokens/update`, null, { params });
  }

  deactivateDeviceToken(deviceToken: string): Observable<void> {
    const params = new HttpParams().set('deviceToken', deviceToken);
    return this.http.delete<void>(`${this.apiUrlBase}/device-tokens/deactivate`, { params });
  }

  getUserDeviceTokens(): Observable<any[]> {
    const userId = this.sessionService.getCurrentUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    
    return this.http.get<any[]>(`${this.apiUrlBase}/device-tokens/user/${userId}`);
  }

  validateDeviceToken(deviceToken: string): Observable<boolean> {
    const params = new HttpParams().set('deviceToken', deviceToken);
    return this.http.get<boolean>(`${this.apiUrlBase}/device-tokens/validate`, { params });
  }

  // Enhanced methods for notification preferences
  getUserPreferences(): Observable<NotificationPreferences> {
    const userId = this.sessionService.getCurrentUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    return this.http.get<NotificationPreferences>(`${this.apiUrlBase}/notifications/user/${userId}/preferences`);
  }

  updateUserPreferences(preferences: NotificationPreferences): Observable<NotificationPreferences> {
    const userId = this.sessionService.getCurrentUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    return this.http.put<NotificationPreferences>(
      `${this.apiUrlBase}/notifications/user/${userId}/preferences`,
      preferences
    );
  }

  // Enhanced test methods for notification system
  testEmailNotification(request?: TestEmailRequest): Observable<ApiResponse<string>> {
    const userId = this.sessionService.getCurrentUserId();
    const body = {
      to: request?.to || 'test@example.com',
      subject: request?.subject || 'Test Email RecitApp',
      message: request?.message || 'Esta es una notificación de prueba desde RecitApp'
    };
    
    return this.http.post<ApiResponse<string>>(`${this.apiUrlBase}/notifications/test/email`, body);
  }

  testPushNotification(request?: TestPushRequest): Observable<ApiResponse<string>> {
    const userId = this.sessionService.getCurrentUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    
    const body = {
      deviceToken: request?.deviceToken || '',
      title: request?.title || 'Test Push RecitApp',
      body: request?.body || 'Esta es una notificación push de prueba',
      data: request?.data || { test: true }
    };
    
    return this.http.post<ApiResponse<string>>(`${this.apiUrlBase}/notifications/test/push`, body);
  }

  testSmsNotification(request?: TestSmsRequest): Observable<ApiResponse<string>> {
    const body = {
      phoneNumber: request?.phoneNumber || '+549113456789',
      message: request?.message || 'Hola! Este es un test SMS desde RecitApp'
    };
    
    return this.http.post<ApiResponse<string>>(`${this.apiUrlBase}/notifications/test/sms`, body);
  }

  // Notification metrics and monitoring
  getNotificationMetrics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrlBase}/notifications/metrics`);
  }

  getNotificationHistory(page: number = 0, size: number = 20): Observable<any> {
    const userId = this.sessionService.getCurrentUserId();
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<any>(`${this.apiUrlBase}/notifications/user/${userId}/history`, { params });
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
