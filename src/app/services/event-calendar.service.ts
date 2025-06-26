import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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
  mainArtist: {
    id: number;
    name: string;
    imageUrl?: string;
  };
  ticketPrice: number;
  availableTickets: number;
  imageUrl?: string;
  verified?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EventCalendarService {
  private apiUrl = `${environment.apiUrl}/events/calendar`;

  constructor(private http: HttpClient) {}

  getMonthlyEvents(year: number, month: number): Observable<{ [key: string]: CalendarEvent[] }> {
    return this.http.get<{ [key: string]: CalendarEvent[] }>(`${this.apiUrl}/monthly?year=${year}&month=${month}`);
  }

  getWeeklyEvents(year: number, week: number): Observable<CalendarEvent[]> {
    return this.http.get<CalendarEvent[]>(`${this.apiUrl}/weekly/${year}/${week}`);
  }

  getDailyEvents(date: string): Observable<CalendarEvent[]> {
    return this.http.get<CalendarEvent[]>(`${this.apiUrl}/daily/${date}`);
  }
} 