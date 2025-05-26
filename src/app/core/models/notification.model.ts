export interface NotificationPreference {
  receiveReminderEmails: boolean;
  receiveEventPush: boolean;
  receiveArtistPush: boolean;
  receiveAvailabilityPush: boolean;
  receiveWeeklyNewsletter: boolean;
}

export interface Notification {
  id: number;
  userId: number;
  typeName: string;
  channelName: string;
  content: string;
  sentAt: string; // Assuming ISO date string
  readAt?: string; // Assuming ISO date string
  isRead: boolean;
  relatedEventId?: number;
  relatedEventName?: string;
  relatedArtistId?: number;
  relatedArtistName?: string;
  relatedVenueId?: number;
  relatedVenueName?: string;
}

export interface NotificationChannel {
  id: number;
  name: string;
  description: string;
  active: boolean;
} 