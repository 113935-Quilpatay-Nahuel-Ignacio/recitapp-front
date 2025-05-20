import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ticket } from '../models/ticket.model';
import { environment } from '../../../../environments/environment';
import { HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';

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

  createPromotionalTicket(request: PromotionalTicketRequest): Observable<PromotionalTicketResponse> {
    return this.http.post<PromotionalTicketResponse>(`${this.adminApiUrl}/promotional`, request);
  }
}
