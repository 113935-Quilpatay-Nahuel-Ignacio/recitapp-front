import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface TicketDTO {
  id: number;
  eventId: number;
  eventName: string;
  status: string;
  sectionName: string;
  qrCode: string;
  purchaseDate: string;
}

export interface TicketProcessResult {
  success: boolean;
  totalFound?: number;
  totalRequested?: number;
  processed: number;
  errors: number;
  errorDetails: string[];
  message: string;
}

export interface TicketStatistics {
  [status: string]: number;
}

@Injectable({
  providedIn: 'root'
})
export class TicketAdminService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin/tickets`;

  constructor() { }

  /**
   * Marca todos los tickets vencidos como VENCIDA
   */
  markExpiredTickets(): Observable<TicketProcessResult> {
    return this.http.post<TicketProcessResult>(`${this.apiUrl}/mark-expired`, {});
  }

  /**
   * Obtiene preview de tickets que serían marcados como vencidos
   */
  previewExpiredTickets(): Observable<TicketDTO[]> {
    return this.http.get<TicketDTO[]>(`${this.apiUrl}/preview-expired`);
  }

  /**
   * Obtiene estadísticas de tickets por estado
   */
  getTicketStatistics(): Observable<TicketStatistics> {
    return this.http.get<TicketStatistics>(`${this.apiUrl}/statistics`);
  }

  /**
   * Marca tickets específicos como vencidos
   */
  markSpecificTicketsExpired(ticketIds: number[]): Observable<TicketProcessResult> {
    return this.http.post<TicketProcessResult>(`${this.apiUrl}/mark-specific-expired`, ticketIds);
  }
} 