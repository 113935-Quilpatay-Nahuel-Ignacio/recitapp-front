import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ClearedReservationsResponse {
  clearedCount: number;
}

export interface ReservedTicketsCountResponse {
  reservedTicketsCount: number;
}

@Injectable({
  providedIn: 'root' // O proporcionar en un módulo admin específico si se prefiere
})
export class ReservationAdminService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin/reservations`;

  getExpiredReservationIds(): Observable<number[]> { // Cambiado Long[] a number[] para TS
    return this.http.get<number[]>(`${this.apiUrl}/expired`);
  }

  clearExpiredReservations(): Observable<ClearedReservationsResponse> {
    return this.http.delete<ClearedReservationsResponse>(`${this.apiUrl}/expired`);
  }

  countReservedTicketsByEvent(eventId: number): Observable<ReservedTicketsCountResponse> {
    return this.http.get<ReservedTicketsCountResponse>(`${this.apiUrl}/count/event/${eventId}`);
  }
} 