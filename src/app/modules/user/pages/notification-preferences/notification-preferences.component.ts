import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { NotificationPreferences } from '../../models/notification-preferences';
import { SessionService } from '../../../../core/services/session.service';

@Component({
  selector: 'app-notification-preferences',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './notification-preferences.component.html',
})
export class NotificationPreferencesComponent implements OnInit {
  userId: number | null = null;
  preferences: NotificationPreferences = {
    userId: 0, // Will be updated dynamically
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

  constructor(
    private userService: UserService,
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    this.userId = this.sessionService.getCurrentUserId();
    if (this.userId) {
      this.preferences.userId = this.userId;
      this.loadPreferences();
    } else {
      this.error = 'Usuario no autenticado';
    }
  }

  loadPreferences(): void {
    if (!this.userId) {
      this.error = 'Usuario no autenticado';
      return;
    }

    this.loadingPreferences = true;
    this.error = '';

    this.userService.getNotificationPreferences(this.userId).subscribe({
      next: (preferences) => {
        this.preferences = preferences;
        this.loadingPreferences = false;
      },
      error: (err) => {
        this.error =
          err.error?.message || 'Error al cargar preferencias de notificación';
        this.loadingPreferences = false;
      },
    });
  }

  updatePreferences(): void {
    if (!this.userId) {
      this.error = 'Usuario no autenticado';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = false;

    this.userService
      .updateNotificationPreferences(this.userId, this.preferences)
      .subscribe({
        next: (updatedPreferences) => {
          this.preferences = updatedPreferences;
          this.success = true;
          this.loading = false;
        },
        error: (err) => {
          this.error =
            err.error?.message ||
            'Error al actualizar preferencias de notificación';
          this.loading = false;
        },
      });
  }
}
