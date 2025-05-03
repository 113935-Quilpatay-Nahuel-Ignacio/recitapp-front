import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { NotificationPreferences } from '../../models/notification-preferences';

@Component({
  selector: 'app-notification-preferences',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './notification-preferences.component.html',
})
export class NotificationPreferencesComponent implements OnInit {
  userId: number = 2; // Mock user ID
  preferences: NotificationPreferences = {
    userId: 2,
    receiveReminderEmails: true,
    receiveEventPush: true,
    receiveArtistPush: true,
    receiveAvailabilityPush: true,
    receiveWeeklyNewsletter: true,
  };

  loading = false;
  loadingPreferences = false;
  error = '';
  success = false;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadPreferences();
  }

  loadPreferences(): void {
    this.loadingPreferences = true;

    this.userService.getNotificationPreferences(this.userId).subscribe({
      next: (prefs) => {
        this.preferences = prefs;
        this.loadingPreferences = false;
      },
      error: (err) => {
        this.error =
          err.error?.message ||
          'Error al cargar preferencias de notificaciones';
        this.loadingPreferences = false;
      },
    });
  }

  savePreferences(): void {
    this.loading = true;
    this.error = '';
    this.success = false;

    this.userService
      .updateNotificationPreferences(this.userId, this.preferences)
      .subscribe({
        next: (updatedPrefs) => {
          this.preferences = updatedPrefs;
          this.success = true;
          this.loading = false;

          setTimeout(() => {
            this.success = false;
          }, 3000);
        },
        error: (err) => {
          this.error =
            err.error?.message ||
            'Error al actualizar preferencias de notificaciones';
          this.loading = false;
        },
      });
  }
}
