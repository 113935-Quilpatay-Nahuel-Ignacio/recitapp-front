import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Venue,
  VenueAvailability,
  VenueSection,
  VenueStatistics,
} from '../models/venue';

@Injectable({
  providedIn: 'root',
})
export class VenueService {
  private baseUrl = `${environment.apiUrl}/venues`;

  constructor(private http: HttpClient) {}

  getAllVenues(activeOnly: boolean = true): Observable<Venue[]> {
    return this.http.get<Venue[]>(`${this.baseUrl}?activeOnly=${activeOnly}`);
  }

  searchVenuesByName(name: string): Observable<Venue[]> {
    return this.http.get<Venue[]>(
      `${this.baseUrl}?name=${encodeURIComponent(name)}`
    );
  }

  getVenueById(id: number): Observable<Venue> {
    return this.http.get<Venue>(`${this.baseUrl}/${id}`);
  }

  createVenue(venue: Venue): Observable<Venue> {
    return this.http.post<Venue>(`${this.baseUrl}`, venue);
  }

  updateVenue(id: number, venue: Venue): Observable<Venue> {
    return this.http.put<Venue>(`${this.baseUrl}/${id}`, venue);
  }

  deactivateVenue(id: number): Observable<Venue> {
    return this.http.patch<Venue>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  deleteVenue(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  checkVenueAvailability(
    id: number,
    startDateTime: Date,
    endDateTime: Date
  ): Observable<VenueAvailability> {
    return this.http.get<VenueAvailability>(
      `${
        this.baseUrl
      }/${id}/availability?startDateTime=${startDateTime.toISOString()}&endDateTime=${endDateTime.toISOString()}`
    );
  }

  getAvailableVenues(
    startDateTime: Date,
    endDateTime: Date
  ): Observable<Venue[]> {
    return this.http.get<Venue[]>(
      `${
        this.baseUrl
      }/available?startDateTime=${startDateTime.toISOString()}&endDateTime=${endDateTime.toISOString()}`
    );
  }

  getVenueStatistics(id: number): Observable<VenueStatistics> {
    return this.http.get<VenueStatistics>(`${this.baseUrl}/${id}/statistics`);
  }

  getVenueEvents(
    id: number,
    includePastEvents: boolean = false
  ): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/${id}/events?includePastEvents=${includePastEvents}`
    );
  }

  updateVenueLocation(
    id: number,
    latitude: number,
    longitude: number
  ): Observable<Venue> {
    return this.http.patch<Venue>(
      `${this.baseUrl}/${id}/location?latitude=${latitude}&longitude=${longitude}`,
      {}
    );
  }

  findVenuesNearby(
    latitude: number,
    longitude: number,
    radiusInKm: number = 5
  ): Observable<Venue[]> {
    return this.http.get<Venue[]>(
      `${this.baseUrl}/nearby?latitude=${latitude}&longitude=${longitude}&radiusInKm=${radiusInKm}`
    );
  }

  getVenueSections(venueId: number): Observable<VenueSection[]> {
    return this.http.get<VenueSection[]>(`${this.baseUrl}/${venueId}/sections`);
  }

  createVenueSection(
    venueId: number,
    section: VenueSection
  ): Observable<VenueSection> {
    return this.http.post<VenueSection>(
      `${this.baseUrl}/${venueId}/sections`,
      section
    );
  }

  updateVenueSection(
    venueId: number,
    sectionId: number,
    section: VenueSection
  ): Observable<VenueSection> {
    return this.http.put<VenueSection>(
      `${this.baseUrl}/${venueId}/sections/${sectionId}`,
      section
    );
  }

  deleteVenueSection(venueId: number, sectionId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/${venueId}/sections/${sectionId}`
    );
  }
}
