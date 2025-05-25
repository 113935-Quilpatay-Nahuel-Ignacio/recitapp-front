export type NotificationType = 
  | 'newEventAlert' 
  | 'lowTicketAvailability' 
  | 'eventCancellation' 
  | 'eventModification' 
  | 'recommendation';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string; // Detailed message
  timestamp: Date;
  isRead: boolean;
  relatedEntityId?: string; // e.g., Event ID, Artist ID
  // link?: string; // Optional link for navigation e.g. /events/{{relatedEntityId}}
}
