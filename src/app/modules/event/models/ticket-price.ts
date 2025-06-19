export interface TicketPriceDTO {
  id?: number;
  eventId?: number;
  sectionId: number;
  sectionName?: string; // Solo para mostrar información
  ticketType: string;
  price: number;
  availableQuantity: number;
  
  // Nuevos campos para entradas promocionales y de regalo
  isPromotional?: boolean;
  isGift?: boolean;
  promotionalType?: string; // "PROMOTIONAL_2X1", "GIFT", etc.
  seatsPerTicket?: number; // Para 2x1 sería 2, para regalo 1
}

export interface TicketPriceCreateDTO {
  sectionId: number;
  ticketType: string;
  price: number;
  availableQuantity: number;
  
  // Nuevos campos para entradas promocionales y de regalo
  isPromotional?: boolean;
  isGift?: boolean;
  promotionalType?: string;
  seatsPerTicket?: number;
}

// Enum para tipos promocionales
export enum PromotionalType {
  PROMOTIONAL_2X1 = 'PROMOTIONAL_2X1',
  GIFT = 'GIFT'
}

// Interface para facilitar el manejo en formularios
export interface TicketTypeOption {
  label: string;
  value: string;
  isPromotional: boolean;
  isGift: boolean;
  seatsPerTicket: number;
  description: string;
} 