export interface PurchaseHistory {
  id: number;
  eventName: string;
  eventDate: Date;
  artistName: string;
  venueName: string;
  ticketSection: string;
  ticketPrice: number;
  purchaseDate: Date;
  ticketStatus: string;
}
