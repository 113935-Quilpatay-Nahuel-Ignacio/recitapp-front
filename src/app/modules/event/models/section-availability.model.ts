export interface SectionAvailability {
  sectionId: number;
  sectionName: string;
  totalCapacity: number;
  availableTickets: number;
  soldTickets: number;
  basePrice: number; // BigDecimal from Java is typically represented as number in TypeScript.
  availabilityPercentage: number;
} 