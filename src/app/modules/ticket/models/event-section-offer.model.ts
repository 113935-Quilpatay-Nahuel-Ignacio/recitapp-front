export interface EventSectionOffer {
  sectionId: number; // Corresponds to SectionAvailabilityDTO.sectionId
  sectionName: string; // Corresponds to SectionAvailabilityDTO.sectionName
  price: number; // Corresponds to SectionAvailabilityDTO.basePrice
  availableTickets: number; // Corresponds to SectionAvailabilityDTO.availableTickets
  totalCapacity?: number; // From SectionAvailabilityDTO.totalCapacity, optional for display
  currency: string; // Needs to be set (e.g., from event details or default)
  // promotionId?: number; // If we decide to handle promotions at this stage
} 