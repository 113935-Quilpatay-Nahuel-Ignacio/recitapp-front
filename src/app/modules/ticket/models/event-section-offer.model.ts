export interface EventSectionOffer {
  sectionId: number; // Corresponds to SectionAvailabilityDTO.sectionId
  sectionName: string; // Corresponds to SectionAvailabilityDTO.sectionName
  availableTickets: number; // Corresponds to SectionAvailabilityDTO.availableTickets
  totalCapacity?: number; // From SectionAvailabilityDTO.totalCapacity, optional for display
  currency: string; // Needs to be set (e.g., from event details or default)
  
  // Información de precios de tickets para este evento
  ticketPrices: TicketPriceInfo[];
}

export interface TicketPriceInfo {
  ticketPriceId: number;
  ticketType: string;
  price: number;
  availableQuantity: number;
} 