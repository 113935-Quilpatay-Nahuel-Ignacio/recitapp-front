import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';
import { NotificationPreferenceDTO } from '../../models/notification-preference.dto';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-notification-preferences',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './notification-preferences.component.html',
  styleUrls: ['./notification-preferences.component.scss'],
})
export class NotificationPreferencesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private notificationService = inject(NotificationService);

  preferencesForm!: FormGroup;
  isLoading = true;
  errorLoading = false;
  isSaving = false;
  errorSaving = false;
  saveSuccess = false;

  // Define the structure of your preference items for the template
  preferenceItems = [
    { key: 'receiveEventPush', label: 'New Event Alerts (In-App)' },
    { key: 'receiveAvailabilityPush', label: 'Low Ticket Availability (In-App)' },
    { key: 'receiveReminderEmails', label: 'Event Reminders (Email)' },
    { key: 'receiveWeeklyNewsletter', label: 'Weekly Recommendations (Email)' },
    { key: 'receiveArtistPush', label: 'Updates from Followed Artists (In-App)' },
    // Add more as they are defined in your DTO and API logic
  ];

  ngOnInit(): void {
    this.preferencesForm = this.fb.group({
      receiveReminderEmails: [false],
      receiveEventPush: [false],
      receiveArtistPush: [false],
      receiveAvailabilityPush: [false],
      receiveWeeklyNewsletter: [false],
    });
    this.loadPreferences();
  }

  loadPreferences(): void {
    this.isLoading = true;
    this.errorLoading = false;
    this.notificationService.getNotificationPreferences()
      .pipe(
        tap(prefs => {
          this.preferencesForm.patchValue(prefs);
          this.isLoading = false;
        }),
        catchError(err => {
          console.error('Error loading notification preferences:', err);
          this.isLoading = false;
          this.errorLoading = true;
          return of(null); // Keep the stream alive
        })
      ).subscribe();
  }

  onSubmit(): void {
    if (this.preferencesForm.invalid) {
      return;
    }
    this.isSaving = true;
    this.errorSaving = false;
    this.saveSuccess = false;

    const preferencesToSave: NotificationPreferenceDTO = this.preferencesForm.value;

    this.notificationService.updateNotificationPreferences(preferencesToSave)
      .pipe(
        tap(() => {
          this.isSaving = false;
          this.saveSuccess = true;
          this.preferencesForm.markAsPristine(); // So the save button gets disabled again
          setTimeout(() => this.saveSuccess = false, 3000); // Hide success message after 3s
        }),
        catchError(err => {
          console.error('Error saving notification preferences:', err);
          this.isSaving = false;
          this.errorSaving = true;
          setTimeout(() => this.errorSaving = false, 3000);
          return of(null);
        })
      ).subscribe();
  }
} 