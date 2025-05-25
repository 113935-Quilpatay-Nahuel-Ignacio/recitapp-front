import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { of, Observable, throwError } from 'rxjs';
import { NotificationCenterComponent } from './notification-center.component';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../models/notification.model';
import { HttpClientTestingModule } from '@angular/common/http/testing';

// Mock NotificationService
class MockNotificationService {
  mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'newEventAlert',
      title: 'Test Event',
      message: 'This is a test event notification.',
      timestamp: new Date(),
      isRead: false,
      relatedEntityId: 'event123',
    },
    {
      id: '2',
      type: 'recommendation',
      title: 'Test Recommendation',
      message: 'This is a test recommendation.',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      isRead: true,
      relatedEntityId: 'artist456',
    },
  ];

  getNotifications(): Observable<Notification[]> {
    return of(this.mockNotifications);
  }

  markNotificationAsRead(notificationId: string): Observable<Notification> {
    const notification = this.mockNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      return of({ ...notification });
    }
    return throwError(() => new Error('Notification not found'));
  }

  markAllNotificationsAsRead(): Observable<void> {
    this.mockNotifications.forEach(n => n.isRead = true);
    return of(undefined);
  }

  // Add other methods used by component if any, e.g., getNewEventAlerts
   getNewEventAlerts(): Observable<Notification[]> {
    return of(this.mockNotifications.filter(n => n.type === 'newEventAlert'));
  }
}

describe('NotificationCenterComponent', () => {
  let component: NotificationCenterComponent;
  let fixture: ComponentFixture<NotificationCenterComponent>;
  let mockNotificationService: MockNotificationService;

  beforeEach(async () => {
    mockNotificationService = new MockNotificationService();

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RouterModule.forRoot([]), // Necessary for routerLink
        HttpClientTestingModule,
        NotificationCenterComponent, // Component is standalone
      ],
      providers: [
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationCenterComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges(); // Trigger ngOnInit
    expect(component).toBeTruthy();
  });

  it('should load notifications on init', fakeAsync(() => {
    spyOn(mockNotificationService, 'getNotifications').and.callThrough();
    fixture.detectChanges(); // ngOnInit
    tick(); // allow async operations to complete
    expect(mockNotificationService.getNotifications).toHaveBeenCalled();
    expect(component.isLoading).toBeFalse();
    component.notifications$.subscribe(notifications => {
      expect(notifications.length).toBe(mockNotificationService.mockNotifications.length);
    });
  }));

  it('should call markNotificationAsRead when an unread notification is clicked', () => {
    fixture.detectChanges(); // ngOnInit
    const unreadNotification = mockNotificationService.mockNotifications.find(n => !n.isRead)!;
    spyOn(mockNotificationService, 'markNotificationAsRead').and.callThrough();
    spyOn(component, 'loadNotifications').and.callThrough(); // To check if it reloads

    component.markAsRead(unreadNotification);

    expect(mockNotificationService.markNotificationAsRead).toHaveBeenCalledWith(unreadNotification.id);
    // Check if loadNotifications was called after marking as read
    // This depends on the implementation detail (e.g., if it re-fetches or updates locally)
    // Based on current implementation, it calls loadNotifications()
    expect(component.loadNotifications).toHaveBeenCalled();
  });

  it('should not call markNotificationAsRead if notification is already read', () => {
    fixture.detectChanges();
    const readNotification = mockNotificationService.mockNotifications.find(n => n.isRead)!;
    spyOn(mockNotificationService, 'markNotificationAsRead').and.callThrough();
    component.markAsRead(readNotification);
    expect(mockNotificationService.markNotificationAsRead).not.toHaveBeenCalled();
  });

  it('should call markAllNotificationsAsRead and reload notifications', () => {
    fixture.detectChanges();
    spyOn(mockNotificationService, 'markAllNotificationsAsRead').and.callThrough();
    spyOn(component, 'loadNotifications').and.callThrough();

    component.markAllAsRead();

    expect(mockNotificationService.markAllNotificationsAsRead).toHaveBeenCalled();
    expect(component.loadNotifications).toHaveBeenCalled();
  });

  it('should set errorLoading to true when getNotifications fails', fakeAsync(() => {
    spyOn(mockNotificationService, 'getNotifications').and.returnValue(throwError(() => new Error('Failed to load')));
    fixture.detectChanges(); // ngOnInit
    tick();
    expect(component.isLoading).toBeFalse();
    expect(component.errorLoading).toBeTrue();
  }));

  it('should generate correct router link for event notifications', () => {
    const eventNotification: Notification = {
      id: 'ev01', type: 'newEventAlert', title: '', message: '', timestamp: new Date(), isRead: false, relatedEntityId: 'eventXYZ'
    };
    expect(component.getNotificationLink(eventNotification)).toBe('/events/eventXYZ');

    const lowAvailabilityNotification: Notification = {
      id: 'la01', type: 'lowTicketAvailability', title: '', message: '', timestamp: new Date(), isRead: false, relatedEntityId: 'eventABC'
    };
    expect(component.getNotificationLink(lowAvailabilityNotification)).toBe('/events/eventABC');

    const cancellationNotification: Notification = {
      id: 'ec01', type: 'eventCancellation', title: '', message: '', timestamp: new Date(), isRead: false, relatedEntityId: 'eventCXL'
    };
    expect(component.getNotificationLink(cancellationNotification)).toBe('/events/eventCXL');

    const modificationNotification: Notification = {
      id: 'em01', type: 'eventModification', title: '', message: '', timestamp: new Date(), isRead: false, relatedEntityId: 'eventMOD'
    };
    expect(component.getNotificationLink(modificationNotification)).toBe('/events/eventMOD');

    const recommendationNotification: Notification = {
      id: 'rec01', type: 'recommendation', title: '', message: '', timestamp: new Date(), isRead: false, relatedEntityId: 'artistXYZ'
    };
    expect(component.getNotificationLink(recommendationNotification)).toBe('/artists/artistXYZ');
  });

  it('should return null for notifications without relatedEntityId or unhandled types', () => {
    const noIdNotification: Notification = {
      id: 'no01', type: 'newEventAlert', title: '', message: '', timestamp: new Date(), isRead: false
    };
    const unhandledType: Notification = {
       id: 'un01', type: 'recommendation', title: '', message: '', timestamp: new Date(), isRead: false, relatedEntityId: 'abc' // Assuming 'recommendation' link isn't set up in getNotificationLink
    };
    expect(component.getNotificationLink(noIdNotification)).toBeNull();
    expect(component.getNotificationLink(unhandledType)).toBeNull(); // Based on current getNotificationLink logic
  });

});
