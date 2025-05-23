export interface Ticket {
  id: number;
  eventName: string;
  eventDate: string; // ISO date string, will be formatted in the template
  venueName: string;
  sectionName: string;
  seatNumber?: string | null; // Can be null if not applicable
  price: number;
  currency: string;
  attendeeFirstName: string; // New field based on backend DTO
  attendeeLastName: string;  // New field based on backend DTO
  attendeeDni: string;       // New field based on backend DTO (was userDni)
  qrCode: string; // URL or base64 image data
  status: string;
  purchaseDate: string; // ISO date string
  eventId: number;
} 