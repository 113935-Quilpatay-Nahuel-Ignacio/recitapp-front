export interface PurchaseHistory {
  ticketId: number;
  // eventId: number; // Not available in TicketPurchaseDTO, needed for goToEventDetails
  eventName: string;
  artistName: string; // Available from TicketPurchaseDTO
  venueName: string;
  sectionName: string; // Mapped from 'section' in TicketPurchaseDTO
  eventDate: Date;
  price: number;
  currency?: string; // Not in DTO, but kept for pipe
  status: string; // Mapped from 'ticketStatus' in TicketPurchaseDTO
  qrCode?: string;
  purchaseDate?: Date; // From the parent PurchaseHistoryDTO (transaction date)
}
