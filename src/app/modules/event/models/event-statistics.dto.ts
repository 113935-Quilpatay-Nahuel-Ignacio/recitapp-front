export interface EventStatisticsDTO {
  eventId: number;
  eventName: string;
  totalTickets: number;
  soldTickets: number;
  occupancyRate: number;
  statusName: string;
  sectionStatistics: SectionStatisticsDTO[];
}

export interface SectionStatisticsDTO {
  sectionId: number;
  sectionName: string;
  totalTicketsForSale: number;
  ticketsSold: number;
  ticketsRemaining: number;
  percentageAvailable: number;
} 