import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ticket } from '../models/ticket.model';
import { environment } from '../../../../environments/environment';
import { map } from 'rxjs/operators';

// Define backend DTO interface to match Java TicketDTO
interface BackendTicketDTO {
  id: number;
  eventId: number;
  eventName: string;
  eventDate: string; // LocalDateTime serialized as string
  sectionId: number;
  sectionName: string;
  venueName: string;
  price: number;
  status: string;
  attendeeFirstName: string;
  attendeeLastName: string;
  attendeeDni: string;
  qrCode: string;
  purchaseDate: string; // LocalDateTime serialized as string
  // User information (purchaser)
  userId: number;
  userName: string;
  userEmail: string;
  userFirstName: string;
  userLastName: string;
  // Promotional information
  isGift: boolean;
  promotionName: string;
  promotionDescription: string;
  ticketType: string; // "PROMOTIONAL_2X1", "GENERAL", "GIFT"
}

export interface AttendeeUpdateRequest {
  attendeeFirstName?: string;
  attendeeLastName?: string;
  attendeeDni?: string;
}

export interface TicketTransferRequest {
  recipientUserId: number;
  attendeeFirstName: string;
  attendeeLastName: string;
  attendeeDni: string;
}

export interface TicketTransferBySearchRequest {
  recipientFirstName: string;
  recipientLastName: string;
  recipientDni: string;
}

export interface PromotionalTicketItem {
  sectionId: number;
  recipientUserId: number;
  attendeeFirstName: string;
  attendeeLastName: string;
  attendeeDni: string;
  isGift?: boolean;
}

export interface PromotionalTicketRequest {
  eventId: number;
  adminUserId: number;
  tickets: PromotionalTicketItem[];
  promotionName?: string;
  promotionDescription?: string;
}

export interface TicketResponseItem {
  id: number;
  eventId: number;
  eventName: string;
  eventDate: string;
  sectionId: number;
  sectionName: string;
  venueName: string;
  price: number;
  status: string;
  attendeeFirstName: string | null;
  attendeeLastName: string | null;
  attendeeDni: string | null;
  qrCode: string | null;
  purchaseDate: string;
}

export interface PromotionalTicketResponse {
  eventId: number;
  eventName: string;
  promotionName: string | null;
  promotionDescription: string | null;
  creationDate: string;
  adminUserId: number;
  adminUserName: string;
  ticketCount: number;
  tickets: TicketResponseItem[];
}

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private apiUrl = `${environment.apiUrl}/tickets`;
  private usersApiUrl = `${environment.apiUrl}/users`;
  private adminApiUrl = `${environment.apiUrl}/admin/tickets`;
  private http = inject(HttpClient);

  getTicketById(ticketId: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/${ticketId}`);
  }

  updateTicketAttendee(ticketId: number, attendeeData: AttendeeUpdateRequest): Observable<Ticket> {
    return this.http.patch<Ticket>(`${this.apiUrl}/${ticketId}/assignment`, attendeeData);
  }

  transferTicket(currentOwnerUserId: number, ticketId: number, data: TicketTransferRequest): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.usersApiUrl}/${currentOwnerUserId}/tickets/${ticketId}/transfer`, data);
  }

  transferTicketBySearch(currentOwnerUserId: number, ticketId: number, data: TicketTransferBySearchRequest): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.usersApiUrl}/${currentOwnerUserId}/tickets/${ticketId}/transfer-search`, data);
  }

  validateTicket(ticketId: number, qrCodeValue: string): Observable<boolean> {
    const params = new HttpParams().set('qrCode', qrCodeValue);
    return this.http.post<boolean>(`${this.apiUrl}/${ticketId}/validate`, null, { params });
  }

  validateTicketByCode(identificationCode: string): Observable<boolean> {
    const params = new HttpParams().set('identificationCode', identificationCode);
    return this.http.post<boolean>(`${this.apiUrl}/validate-by-code`, null, { params });
  }

  createPromotionalTicket(request: PromotionalTicketRequest): Observable<PromotionalTicketResponse> {
    return this.http.post<PromotionalTicketResponse>(`${this.adminApiUrl}/promotional`, request);
  }

  /**
   * Get tickets for a specific user
   */
  getUserTickets(userId: number): Observable<Ticket[]> {
    return this.http.get<BackendTicketDTO[]>(`${this.apiUrl}/user/${userId}`)
      .pipe(
        map(backendTickets => backendTickets.map(this.mapBackendTicketToFrontend))
      );
  }

  /**
   * Map backend TicketDTO to frontend Ticket model
   */
  private mapBackendTicketToFrontend(backendTicket: BackendTicketDTO): Ticket {
    return {
      id: backendTicket.id,
      eventName: backendTicket.eventName,
      eventDate: backendTicket.eventDate,
      venueName: backendTicket.venueName,
      sectionName: backendTicket.sectionName,
      seatNumber: null, // Not provided by backend DTO
      price: backendTicket.price,
      currency: 'ARS', // Default currency
      attendeeFirstName: backendTicket.attendeeFirstName,
      attendeeLastName: backendTicket.attendeeLastName,
      attendeeDni: backendTicket.attendeeDni,
      qrCode: backendTicket.qrCode,
      status: backendTicket.status,
      purchaseDate: backendTicket.purchaseDate,
      eventId: backendTicket.eventId,
      userId: backendTicket.userId,
      userName: backendTicket.userName,
      userEmail: backendTicket.userEmail,
      userFirstName: backendTicket.userFirstName,
      userLastName: backendTicket.userLastName,
      isGift: backendTicket.isGift,
      promotionName: backendTicket.promotionName,
      promotionDescription: backendTicket.promotionDescription,
      ticketType: backendTicket.ticketType
    };
  }
}
