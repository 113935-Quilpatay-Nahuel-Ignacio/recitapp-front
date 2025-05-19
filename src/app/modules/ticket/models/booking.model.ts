// Models for ticket booking process
export interface TicketRequest {
  sectionId: number;
  attendeeFirstName: string;
  attendeeLastName: string;
  attendeeDni: string;
  price: number;
  promotionId?: number | null; // Optional, based on usage in ticket-purchase.component.ts
}

export interface TicketPurchaseRequestDTO {
  eventId: number;
  paymentMethodId: number;
  userId: number;
  tickets: TicketRequest[];
}

export interface TicketPurchaseResponseTicketDTO {
  id: number;
  sectionName: string;
  attendeeFirstName: string;
  attendeeLastName: string;
  attendeeDni: string;
  price: number;
  qrCode?: string; // Assuming it might be returned
  status?: string; // Assuming it might be returned
}

export interface TicketPurchaseResponseDTO {
  transactionId: number;
  purchaseDate: string; // Or Date
  totalAmount: number;
  paymentMethod: string; // Or an ID/object
  transactionStatus: string;
  tickets: TicketPurchaseResponseTicketDTO[]; // Based on purchaseTickets method in backend
} 