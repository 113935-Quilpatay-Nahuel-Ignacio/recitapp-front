import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError, Observable } from 'rxjs';
import { NotificationPreferencesComponent } from './notification-preferences.component';
import { NotificationService } from '../../services/notification.service';
import { NotificationPreferenceDTO } from '../../models/notification-preference.dto';
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';

class MockNotificationService {
  mockPreferences: NotificationPreferenceDTO = {
    receiveEventPush: true,
    receiveReminderEmails: false,
    receiveWeeklyNewsletter: true,
  };

  getNotificationPreferences(): Observable<NotificationPreferenceDTO> {
    return of(this.mockPreferences);
  }

  updateNotificationPreferences(
    prefs: NotificationPreferenceDTO
  ): Observable<NotificationPreferenceDTO> {
    this.mockPreferences = prefs;
    return of(this.mockPreferences);
  }
}

describe('NotificationPreferencesComponent', () => {
  let component: NotificationPreferencesComponent;
  let fixture: ComponentFixture<NotificationPreferencesComponent>;
  let mockService: MockNotificationService;

  beforeEach(async () => {
    mockService = new MockNotificationService();
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        NotificationPreferencesComponent,
      ],
      providers: [{ provide: NotificationService, useValue: mockService }],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationPreferencesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load preferences on init and patch form', fakeAsync(() => {
    spyOn(mockService, 'getNotificationPreferences').and.callThrough();
    fixture.detectChanges(); // ngOnInit
    tick(); // for async operations

    expect(mockService.getNotificationPreferences).toHaveBeenCalled();
    expect(component.preferencesForm.value.receiveEventPush).toBe(true);
    expect(component.preferencesForm.value.receiveReminderEmails).toBe(false);
    expect(component.isLoading).toBeFalse();
  }));

  it('should handle error when loading preferences', fakeAsync(() => {
    spyOn(mockService, 'getNotificationPreferences').and.returnValue(
      throwError(() => new Error('Load error'))
    );
    fixture.detectChanges(); // ngOnInit
    tick();
    expect(component.errorLoading).toBeTrue();
    expect(component.isLoading).toBeFalse();
  }));

  it('should call updateNotificationPreferences on submit', fakeAsync(() => {
    fixture.detectChanges(); // Load initial data
    tick();

    spyOn(mockService, 'updateNotificationPreferences').and.callThrough();
    component.preferencesForm.patchValue({ receiveEventPush: false });
    component.preferencesForm.markAsDirty();
    component.onSubmit();
    tick();

    expect(mockService.updateNotificationPreferences).toHaveBeenCalledWith({
      ...component.preferencesForm.value, // includes all form fields
    });
    expect(component.isSaving).toBeFalse();
    expect(component.saveSuccess).toBeTrue();
  }));

  it('should handle error when saving preferences', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    spyOn(mockService, 'updateNotificationPreferences').and.returnValue(
      throwError(() => new Error('Save error'))
    );
    component.preferencesForm.patchValue({ receiveEventPush: false });
    component.preferencesForm.markAsDirty();
    component.onSubmit();
    tick();

    expect(component.isSaving).toBeFalse();
    expect(component.errorSaving).toBeTrue();
  }));
}); 