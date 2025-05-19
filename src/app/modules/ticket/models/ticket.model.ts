export interface Ticket {
  id: number;
  eventName: string;
  eventDate: string; // ISO date string, will be formatted in the template
  venueName: string;
  sectionName: string;
  seatNumber?: string | null; // Can be null if not applicable
  price: number;
  currency: string;
  userName: string; // Attendee name
  userDni: string; // Attendee DNI
  qrCode: string; // URL or base64 image data
  ticketStatus: string;
  purchaseDate: string; // ISO date string
  eventId: number;
} 