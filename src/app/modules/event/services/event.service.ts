import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { EventDTO, EventCreateDTO, EventSearchFilters, EventStatusUpdateDTO, EventVerificationRequest } from '../models/event';
import { EventStatisticsDTO } from '../models/event-statistics.dto';
import { environment } from '../../../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = `${environment.apiUrl}/events`;

  constructor(private http: HttpClient) { }

  createEvent(eventData: EventCreateDTO, registrarId: number): Observable<EventDTO> {
    return this.http.post<EventDTO>(`${this.apiUrl}?registrarId=${registrarId}`, eventData);
  }

  searchEvents(filters: EventSearchFilters): Observable<EventDTO[]> {
    let params = new HttpParams();
    if (filters.startDate) {
      params = params.append('startDate', filters.startDate);
    }
    if (filters.endDate) {
      params = params.append('endDate', filters.endDate);
    }
    if (filters.venueId) {
      params = params.append('venueId', filters.venueId.toString());
    }
    if (filters.artistId) {
      params = params.append('artistId', filters.artistId.toString());
    }
    if (filters.statusName) {
      params = params.append('statusName', filters.statusName);
    }
    if (filters.verified !== undefined) {
      params = params.append('verified', String(filters.verified));
    }
    if (filters.moderatorId) {
      params = params.append('moderatorId', filters.moderatorId.toString());
    }
    if (filters.registrarId) {
      params = params.append('registrarId', filters.registrarId.toString());
    }
    return this.http.get<EventDTO[]>(`${this.apiUrl}/search`, { params });
  }

  getEventById(id: number): Observable<EventDTO> {
    return this.http.get<EventDTO>(`${this.apiUrl}/${id}`);
  }

  updateEvent(id: number, eventData: EventCreateDTO): Observable<EventDTO> {
    return this.http.put<EventDTO>(`${this.apiUrl}/${id}`, eventData);
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  cleanupCanceledEvents(cutoffDate: string): Observable<any> {
    const params = new HttpParams().set('cutoffDate', cutoffDate);
    return this.http.post<any>(`${this.apiUrl}/cleanup-canceled`, null, { params });
  }

  updateEventStatus(id: number, statusData: EventStatusUpdateDTO): Observable<EventDTO> {
    return this.http.patch<EventDTO>(`${this.apiUrl}/${id}/status`, statusData);
  }

  verifyEvent(id: number, verificationRequest: EventVerificationRequest): Observable<EventDTO> {
    return this.http.post<EventDTO>(`${environment.apiUrl}/events/verification/${id}/verify`, verificationRequest);
  }

  getEventStatistics(id: number): Observable<EventStatisticsDTO> {
    return this.http.get<EventStatisticsDTO>(`${this.apiUrl}/${id}/statistics`);
  }
}
