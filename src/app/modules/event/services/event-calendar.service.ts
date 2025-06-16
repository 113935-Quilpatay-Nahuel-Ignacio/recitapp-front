import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface CalendarEvent {
  id: number;
  name: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  venue: {
    id: number;
    name: string;
    address: string;
  };
  primaryArtist: {
    id: number;
    name: string;
  };
  status: string;
  verified: boolean;
  imageUrl?: string;
  ticketPrices?: Array<{
    sectionName: string;
    price: number;
  }>;
}

export interface MonthlyCalendarData {
  [date: string]: CalendarEvent[];
}

@Injectable({
  providedIn: 'root'
})
export class EventCalendarService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/events/calendar`;

  constructor() { }

  /**
   * Obtiene eventos para un mes específico
   */
  getMonthlyCalendar(year: number, month: number, venueId?: number, artistId?: number): Observable<MonthlyCalendarData> {
    let params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());

    if (venueId) {
      params = params.set('venueId', venueId.toString());
    }

    if (artistId) {
      params = params.set('artistId', artistId.toString());
    }

    return this.http.get<MonthlyCalendarData>(`${this.apiUrl}/monthly`, { params });
  }

  /**
   * Obtiene eventos para una semana específica
   */
  getWeeklyCalendar(year: number, weekNumber: number, venueId?: number, artistId?: number): Observable<MonthlyCalendarData> {
    let params = new HttpParams()
      .set('year', year.toString())
      .set('weekNumber', weekNumber.toString());

    if (venueId) {
      params = params.set('venueId', venueId.toString());
    }

    if (artistId) {
      params = params.set('artistId', artistId.toString());
    }

    return this.http.get<MonthlyCalendarData>(`${this.apiUrl}/weekly`, { params });
  }

  /**
   * Obtiene eventos para un día específico
   */
  getDailyCalendar(date: string, venueId?: number, artistId?: number): Observable<CalendarEvent[]> {
    let params = new HttpParams().set('date', date);

    if (venueId) {
      params = params.set('venueId', venueId.toString());
    }

    if (artistId) {
      params = params.set('artistId', artistId.toString());
    }

    return this.http.get<CalendarEvent[]>(`${this.apiUrl}/daily`, { params });
  }
} 