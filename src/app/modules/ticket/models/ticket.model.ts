export interface Ticket {
  id: number;
  eventName: string;
  eventDate: string; // ISO date string, will be formatted in the template
  venueName: string;
  sectionName: string;
  seatNumber?: string | null; // Can be null if not applicable
  price: number | string | null; // Can be string or null from backend
  currency: string;
  attendeeFirstName: string; // New field based on backend DTO
  attendeeLastName: string;  // New field based on backend DTO
  attendeeDni: string;       // New field based on backend DTO (was userDni)
  qrCode: string; // URL or base64 image data
  status: string;
  purchaseDate: string; // ISO date string
  eventId: number;
  // User information (purchaser)
  userId?: number;
  userName?: string;
  userEmail?: string;
  userFirstName?: string;
  userLastName?: string;
  // Promotional information
  isGift?: boolean; // If it's a gift ticket
  promotionName?: string; // Name of the promotion if any
  promotionDescription?: string; // Description of the promotion
  ticketType?: string; // PROMOTIONAL_2X1, GENERAL, GIFT
} 