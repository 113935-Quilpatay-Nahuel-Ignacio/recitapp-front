import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // For potential routerLink usage
import { Observable } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../models/notification.model';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notification-center.component.html',
  styleUrls: ['./notification-center.component.scss'],
})
export class NotificationCenterComponent implements OnInit {
  private notificationService = inject(NotificationService);

  notifications$!: Observable<Notification[]>;
  isLoading = true;
  errorLoading = false;

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading = true;
    this.errorLoading = false;
    this.notifications$ = this.notificationService.getNotifications();
    // A real implementation would handle loading and error states more robustly,
    // perhaps by subscribing here and setting local component properties.
    this.notifications$.subscribe({
      next: () => this.isLoading = false,
      error: () => {
        this.isLoading = false;
        this.errorLoading = true;
        console.error('Failed to load notifications');
      }
    });
  }

  markAsRead(notification: Notification): void {
    if (!notification.isRead) {
      this.notificationService.markNotificationAsRead(notification.id).subscribe({
        next: (updatedNotification) => {
          // Update the local list or re-fetch for simplicity here
          this.loadNotifications(); 
          console.log('Notification marked as read:', updatedNotification);
        },
        error: (err) => console.error('Failed to mark notification as read', err),
      });
    }
  }

  markAllAsRead(): void {
    // Get IDs of all currently displayed unread notifications
    this.notifications$.pipe(take(1)).subscribe(notifications => {
      const unreadNotificationIds = notifications
        .filter(n => !n.isRead)
        .map(n => n.id);

      if (unreadNotificationIds.length === 0) {
        console.log('No unread notifications to mark as read.');
        return;
      }

      this.notificationService.markMultipleAsRead(unreadNotificationIds).subscribe({
        next: () => {
          this.loadNotifications(); // Re-fetch to update UI
          console.log('Selected notifications marked as read.');
        },
        error: (err) => console.error('Failed to mark notifications as read', err),
      });
    });
  }

  // Helper to get a router link if applicable, assuming a convention
  getNotificationLink(notification: Notification): string | null {
    // Use typeName and specific relatedEntityId fields
    // Based on NotificationServiceImpl, typeName could be:
    // NUEVO_EVENTO, POCAS_ENTRADAS, CANCELACION, MODIFICACION, RECOMENDACION
    switch (notification.typeName) {
      case 'NUEVO_EVENTO':
      case 'POCAS_ENTRADAS':
      case 'CANCELACION':
      case 'MODIFICACION':
        if (notification.relatedEventId) {
          return `/events/${notification.relatedEventId}`;
        }
        break;
      case 'RECOMENDACION':
        // Recommendation might be for an artist or event.
        // Backend DTO has relatedEventId, relatedArtistId, relatedVenueId.
        // Adjust based on how recommendations are structured.
        // For now, let's assume if relatedArtistId is present, it's an artist recommendation.
        if (notification.relatedArtistId) {
          return `/artists/${notification.relatedArtistId}`;
        } else if (notification.relatedEventId) {
          // If recommendation is event-specific and not covered above
          return `/events/${notification.relatedEventId}`;
        }
        break;
      // Add other cases as notification types are finalized and their linking logic defined
      default:
        return null;
    }
    return null;
  }
}
