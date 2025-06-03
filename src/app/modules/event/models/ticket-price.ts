export interface TicketPriceDTO {
  id?: number;
  sectionId: number;
  sectionName?: string; // Solo para mostrar información
  ticketType: string;
  price: number;
  availableQuantity: number;
  eventId?: number; // Para referencia
}

export interface TicketPriceCreateDTO {
  sectionId: number;
  ticketType: string;
  price: number;
  availableQuantity: number;
} 