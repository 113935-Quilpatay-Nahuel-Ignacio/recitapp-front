export interface SectionAvailability {
  sectionId: number;
  sectionName: string;
  totalCapacity: number;
  availableTickets: number;
  soldTickets: number;
  availabilityPercentage: number;
  
  // Información de precios para este evento específico
  ticketPrices?: TicketPriceInfo[];
}

export interface TicketPriceInfo {
  ticketPriceId: number;
  ticketType: string;
  price: number;
  availableQuantity: number;
} 