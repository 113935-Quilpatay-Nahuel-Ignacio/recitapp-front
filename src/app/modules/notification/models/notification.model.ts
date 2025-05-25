export type NotificationType = 
  | 'newEventAlert' 
  | 'lowTicketAvailability' 
  | 'eventCancellation' 
  | 'eventModification' 
  | 'recommendation';

export interface Notification {
  id: string;
  userId: number;
  typeName: string;
  channelName: string;
  content: string;
  sentAt: string;
  readAt?: string | null;
  isRead: boolean;
  relatedEventId?: number | null;
  relatedEventName?: string | null;
  relatedArtistId?: number | null;
  relatedArtistName?: string | null;
  relatedVenueId?: number | null;
  relatedVenueName?: string | null;
}

export type NotificationTypeEnum =
  | 'NUEVO_EVENTO'
  | 'POCAS_ENTRADAS'
  | 'CANCELACION'
  | 'MODIFICACION'
  | 'RECOMENDACION'
  | 'SYSTEM_UPDATE'
  | 'GENERIC_INFO';

// This type can still be useful for logic within the component,
// but the model itself will store typeName as a string from the backend.
// export type NotificationType =
//   | 'newEventAlert'
//   | 'lowTicketAvailability'
//   | 'eventCancellation'
//   | 'eventModification'
//   | 'recommendation'
//   | 'systemUpdate'
//   | 'genericInfo';

// export interface Notification {
//   id: string;
//   type: NotificationType;
//   title: string;
//   message: string; // Detailed message
//   timestamp: Date;
//   isRead: boolean;
//   relatedEntityId?: string; // e.g., Event ID, Artist ID
//   // link?: string; // Optional link for navigation e.g. /events/{{relatedEntityId}}
// } 