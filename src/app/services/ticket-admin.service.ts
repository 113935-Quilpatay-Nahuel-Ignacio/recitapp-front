import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ExpiredTicketsSummary {
  VENDIDA: number;
  VENCIDA: number;
  CANCELADA: number;
  RESERVADA: number;
}

export interface ExpiredTicketPreview {
  id: number;
  eventName: string;
  eventDate: string;
  userName: string;
  userEmail: string;
  ticketPrice: number;
  sectionName: string;
  purchaseDate: string;
  status: string;
}

export interface ExpiredTicketsStatistics {
  VENDIDA: number;
  VENCIDA: number;
  CANCELADA: number;
  RESERVADA: number;
}

export interface MarkExpiredResult {
  success: boolean;
  totalFound?: number;
  totalRequested?: number;
  processed: number;
  errors: number;
  errorDetails: string[];
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class TicketAdminService {
  private apiUrl = `${environment.apiUrl}/admin/tickets`;

  constructor(private http: HttpClient) {}

  getExpiredTicketsSummary(): Observable<ExpiredTicketsSummary> {
    return this.http.get<ExpiredTicketsSummary>(`${this.apiUrl}/statistics`);
  }

  getExpiredTicketsPreview(): Observable<ExpiredTicketPreview[]> {
    return this.http.get<ExpiredTicketPreview[]>(`${this.apiUrl}/preview-expired`);
  }

  getExpiredTicketsStatistics(): Observable<ExpiredTicketsStatistics> {
    return this.http.get<ExpiredTicketsStatistics>(`${this.apiUrl}/statistics`);
  }

  markTicketsAsExpired(): Observable<MarkExpiredResult> {
    return this.http.post<MarkExpiredResult>(`${this.apiUrl}/mark-expired`, {});
  }
} 