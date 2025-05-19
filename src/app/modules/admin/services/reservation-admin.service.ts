import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { map } from 'rxjs/operators';

// Admin service for reservations and related reports.

export interface ClearedReservationsResponse {
  clearedCount: number;
}

export interface ReservedTicketsCountResponse {
  reservedTicketsCount: number;
}

// New Models for Sales Report
export interface SalesReportItem {
  sectionId?: number; // Optional if report aggregates all sections or provides general items
  sectionName: string;
  ticketsSold: number;
  revenue: number;
}

// Updated Models for Sales Report based on backend response
export interface BackendSectionSaleItem {
  sectionId: number;
  sectionName: string;
  totalCapacity: number;
  soldTickets: number;       // Tickets vendidos (pagados)
  promotionalTickets: number;
  availableTickets: number;
  totalRevenue: number;      // Ingresos de esta sección
  occupancyRate: number;
}

export interface BackendTicketStatusCounts {
  [status: string]: number;
}

export interface EventSalesReportDTO { // Esta interfaz ahora representa lo que el frontend usará
  reportType?: string;
  generatedDate: string; // Mapea a reportGeneratedAt en el componente
  periodStartDate?: string;
  periodEndDate?: string;
  totalEvents?: number;
  totalTicketsOverall?: number; // totalTickets del backend (podría ser capacidad o emitidos)
  soldTickets: number; // Mapea a totalTicketsSold en el componente (este es el principal para "ventas")
  promotionalTicketsCount?: number; // Mapea a promotionalTickets del backend
  canceledTickets?: number;
  totalRevenue: number; // Mapea a totalRevenue en el componente
  occupancyRateOverall?: number;
  eventId: number;
  eventName: string;
  // currency: string; // Removido, el backend no lo envía.
  // La moneda se puede asumir o gestionar de otra forma si es necesaria.
  items: FrontendSalesReportItem[]; // Esta es la estructura que el componente espera para la tabla
  // Campos adicionales que podrían ser útiles directamente del backend:
  venueId?: number | null;
  venueName?: string | null;
  artistId?: number | null;
  artistName?: string | null;
  ticketStatusCounts?: BackendTicketStatusCounts;
  timeSegmentSales?: any | null; // o definir una interfaz más específica
}

// Interfaz para los items de la tabla como los espera el componente HTML
export interface FrontendSalesReportItem {
  sectionId: number;
  sectionName: string;
  ticketsSold: number; // Mapea a soldTickets de BackendSectionSaleItem
  revenue: number;     // Mapea a totalRevenue de BackendSectionSaleItem
  // Podríamos añadir más campos si la tabla los necesita:
  promotionalTickets?: number;
  totalCapacity?: number;
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

  getEventSalesReport(eventId: number): Observable<EventSalesReportDTO> {
    return this.http.get<any>(`${environment.apiUrl}/reports/sales/event/${eventId}`).pipe(
      map(backendResponse => {
        // Mapear la respuesta del backend a la estructura EventSalesReportDTO que el frontend espera
        const reportItems: FrontendSalesReportItem[] = backendResponse.sectionSales.map((item: BackendSectionSaleItem) => ({
          sectionId: item.sectionId,
          sectionName: item.sectionName,
          ticketsSold: item.soldTickets, // Mapeo de tickets vendidos por sección
          revenue: item.totalRevenue,     // Mapeo de ingresos por sección
          promotionalTickets: item.promotionalTickets,
          totalCapacity: item.totalCapacity
        }));

        return {
          reportType: backendResponse.reportType,
          generatedDate: backendResponse.generatedDate,
          periodStartDate: backendResponse.periodStartDate,
          periodEndDate: backendResponse.periodEndDate,
          totalEvents: backendResponse.totalEvents,
          totalTicketsOverall: backendResponse.totalTickets,
          soldTickets: backendResponse.soldTickets, // Total de tickets vendidos (pagados)
          promotionalTicketsCount: backendResponse.promotionalTickets,
          canceledTickets: backendResponse.canceledTickets,
          totalRevenue: backendResponse.totalRevenue, // Ingresos totales
          occupancyRateOverall: backendResponse.occupancyRate,
          eventId: backendResponse.eventId,
          eventName: backendResponse.eventName,
          items: reportItems,
          venueId: backendResponse.venueId,
          venueName: backendResponse.venueName,
          artistId: backendResponse.artistId,
          artistName: backendResponse.artistName,
          ticketStatusCounts: backendResponse.ticketStatusCounts,
          timeSegmentSales: backendResponse.timeSegmentSales
        };
      })
    );
  }
} 