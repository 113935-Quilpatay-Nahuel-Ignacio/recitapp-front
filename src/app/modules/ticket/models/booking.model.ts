import { EventSectionOffer } from './event-section-offer.model';
import { Event } from '../../event/models/event.model';
import { User } from '../../user/models/user.model';

export interface BookingDetailPayload {
  ticketTypeId: number; // Changed from tipoEntradaId
  quantity: number; // Changed from cantidad
}

export interface BookingPayload {
  eventId: number; // Changed from eventoId
  details: BookingDetailPayload[]; // Changed from detalles
}

export interface BookingDetail {
  id: number; // Backend will assign an ID upon booking creation
  ticketType: EventSectionOffer; // Changed from tipoEntrada
  quantity: number; // Changed from cantidad
  unitPrice: number; // Changed from precioUnitario (Price at the time of booking)
}

export enum BookingStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT', // Changed from PENDIENTE_PAGO
  PAID = 'PAID', // Changed from PAGADA
  CANCELLED = 'CANCELLED', // Changed from CANCELADA
  EXPIRED = 'EXPIRED', // Changed from EXPIRADA
}

export interface Booking {
  id: number;
  event: Event; // Changed from evento
  user: User; // User who makes the booking, changed from usuario
  bookingDetails: BookingDetail[]; // Changed from detallesReserva
  bookingDate: string; // Changed from fechaReserva, ISO date string
  bookingStatus: BookingStatus; // Changed from estadoReserva
  totalAmount: number; // Changed from totalReserva
}

// --- Start: Definitions from TicketPurchaseComponent, moved here for centralization ---
export interface TicketRequest {
  sectionId: number;
  attendeeFirstName: string;
  attendeeLastName: string;
  attendeeDni: string;
  price: number;
  promotionId?: number;
}

export interface TicketPurchaseRequestDTO { // This is what the backend expects
  eventId: number;
  paymentMethodId: number;
  userId: number;
  tickets: TicketRequest[];
}

// Based on backend's TicketDTO and TicketPurchaseResponseDTO
export interface TicketResponseItemDTO { // Corresponds to backend TicketDTO
  id: number;
  eventId: number;
  eventName: string;
  eventDate: string; // Assuming LocalDateTime is serialized as string
  sectionId: number;
  sectionName: string;
  venueName: string;
  price: number;
  status: string;
  attendeeFirstName?: string;
  attendeeLastName?: string;
  attendeeDni?: string;
  qrCode?: string;
  purchaseDate?: string; // Assuming LocalDateTime is serialized as string
}

export interface TicketPurchaseResponseDTO { // This is what backend responds with for a purchase
  transactionId: number;
  purchaseDate: string; // Assuming LocalDateTime is serialized as string
  totalAmount: number;
  paymentMethod: string;
  transactionStatus: string;
  tickets: TicketResponseItemDTO[];
}
// --- End: Definitions from TicketPurchaseComponent ---

// ----- Old Booking models - consider refactoring/removing if no longer used -----
export interface OldBookingDetailPayload {
  ticketTypeId: number; 
  quantity: number; 
}

export interface OldBookingPayload { // This was the previous payload for createBooking
  eventId: number;
  details: OldBookingDetailPayload[]; 
}

export interface OldBookingDetail {
  id: number; 
  ticketType: EventSectionOffer; // Corrected type here as well
  quantity: number; 
  unitPrice: number; 
}

export enum OldBookingStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export interface OldBooking {
  id: number;
  event: Event;
  user: User; 
  bookingDetails: OldBookingDetail[]; 
  bookingDate: string; 
  bookingStatus: OldBookingStatus;
  totalAmount: number; 
} 