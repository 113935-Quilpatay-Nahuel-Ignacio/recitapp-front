import { TicketPriceDTO } from './ticket-price';

export interface EventDTO {
  id: number;
  name: string;
  description?: string;
  startDateTime: string | Date;
  endDateTime?: string | Date;
  venueId: number;
  venueName: string;
  mainArtistId?: number;
  mainArtistName?: string;
  statusName: string;
  flyerImage?: string;
  verified?: boolean;
  moderatorId?: number;
  registrarId?: number;
  salesStartDate?: string | Date;
  salesEndDate?: string | Date;
  artistIds?: number[];
  registrationDate?: string | Date;
  updatedAt?: string | Date;
  ticketPrices?: TicketPriceDTO[];
}

export interface EventCreateDTO {
  name: string;
  description?: string;
  startDateTime: string; // Mantener como string para envío, el backend parseará
  endDateTime?: string;   // Mantener como string para envío
  venueId: number;
  mainArtistId?: number;
  // Considerar si se necesita categoryId o similar
  salesStartDate?: string; // Expects YYYY-MM-DDTHH:mm:ss
  salesEndDate?: string;   // Expects YYYY-MM-DDTHH:mm:ss
  artistIds?: number[];
  ticketPrices?: TicketPriceDTO[];
}

export interface EventSearchFilters {
  startDate?: string; // Formato YYYY-MM-DDTHH:mm:ss o YYYY-MM-DD
  endDate?: string;   // Formato YYYY-MM-DDTHH:mm:ss o YYYY-MM-DD
  venueId?: number;
  artistId?: number;
  statusName?: string; // EN_VENTA, PROXIMO, AGOTADO, CANCELADO, FINALIZADO
  page?: number;
  size?: number;
  // Podríamos añadir otros como: name?: string (para buscar por nombre de evento)
  verified?: boolean;
  moderatorId?: number;
  registrarId?: number;
}

export interface EventStatusUpdateDTO {
  statusName: string;
  statusChangeNotes?: string;
}

// Added based on backend EventVerificationController
export interface EventVerificationRequest {
  moderatorId: number;
  verificationNotes?: string;
  updateStatus?: boolean;
  newStatus?: string;
}
