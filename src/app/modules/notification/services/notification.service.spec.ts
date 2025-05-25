import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { NotificationService } from './notification.service';
import { NotificationPreferenceDTO } from '../models/notification-preference.dto';
import { Notification } from '../models/notification.model';

describe('NotificationService', () => {
  let service: NotificationService;
  let httpMock: HttpTestingController;
  const baseApiUrl = '/api'; // Matches service
  const userId = '4'; // Updated to 4, matches service placeholder

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NotificationService],
    });
    service = TestBed.inject(NotificationService);
    httpMock = TestBed.inject(HttpTestingController);
    // service.userId = userId; // If userId were public and set this way
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Notification Preferences', () => {
    it('getNotificationPreferences should fetch user preferences from API', () => {
      const mockPrefs: NotificationPreferenceDTO = { receiveEventPush: true };
      service.getNotificationPreferences().subscribe(prefs => {
        expect(prefs).toEqual(mockPrefs);
      });
      const req = httpMock.expectOne(`${baseApiUrl}/users/${userId}/notification-preferences`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPrefs);
    });

    it('updateNotificationPreferences should send PUT to update preferences', () => {
      const prefsToUpdate: NotificationPreferenceDTO = { receiveEventPush: false };
      service.updateNotificationPreferences(prefsToUpdate).subscribe(res => {
        expect(res).toEqual(prefsToUpdate);
      });
      const req = httpMock.expectOne(`${baseApiUrl}/users/${userId}/notification-preferences`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(prefsToUpdate);
      req.flush(prefsToUpdate);
    });
  });

  describe('General Notifications', () => {
    it('getNotificationHistory should fetch user notification history from API', () => {
      const mockHistory: Notification[] = [{ id: '1', type: 'newEventAlert', title: 'Test', message: 'Msg', timestamp: new Date(), isRead: false }];
      service.getNotificationHistory().subscribe(history => {
        expect(history).toEqual(mockHistory);
      });
      const req = httpMock.expectOne(`${baseApiUrl}/notifications/user/${userId}/history?`); // Added ? for HttpParams if empty
      expect(req.request.method).toBe('GET');
      req.flush(mockHistory);
    });
    
    it('getNotificationHistory should include date params if provided', () => {
      const mockHistory: Notification[] = [];
      const startDate = new Date().toISOString();
      const endDate = new Date().toISOString();
      service.getNotificationHistory(startDate, endDate).subscribe(history => {
        expect(history).toEqual(mockHistory);
      });
      const req = httpMock.expectOne(`${baseApiUrl}/notifications/user/${userId}/history?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockHistory);
    });

    it('getNotifications should fetch unread notifications from API', () => {
      const mockNotifications: Notification[] = [{ id: 'unread1', type: 'newEventAlert', title: 'Unread', message: '', timestamp: new Date(), isRead: false }];
      service.getNotifications().subscribe(notifications => {
        expect(notifications).toEqual(mockNotifications);
      });
      const req = httpMock.expectOne(`${baseApiUrl}/notifications/user/${userId}/unread`);
      expect(req.request.method).toBe('GET');
      req.flush(mockNotifications);
    });

    it('markNotificationAsRead should send PATCH to mark a notification as read', () => {
      const notificationId = 'notif123';
      const mockResp: Notification = { id: notificationId, type: 'newEventAlert', title: '', message: '', timestamp: new Date(), isRead: true };
      service.markNotificationAsRead(notificationId).subscribe(response => {
        expect(response.isRead).toBeTrue();
      });
      const req = httpMock.expectOne(`${baseApiUrl}/notifications/${notificationId}/read`);
      expect(req.request.method).toBe('PATCH');
      req.flush(mockResp);
    });

    it('markMultipleAsRead should send PATCH with IDs to mark multiple as read', () => {
      const idsToMark = ['id1', 'id2'];
      service.markMultipleAsRead(idsToMark).subscribe();
      const req = httpMock.expectOne(`${baseApiUrl}/notifications/user/${userId}/read-multiple`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(idsToMark);
      req.flush(null);
    });
  });
});
