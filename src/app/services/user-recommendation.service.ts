import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface EventRecommendation {
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
  recommendationReason: string;
  recommendationScore: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserRecommendationService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getRecommendationsByFollowedArtists(userId: number): Observable<EventRecommendation[]> {
    return this.http.get<EventRecommendation[]>(`${this.apiUrl}/${userId}/by-followed-artists`);
  }

  getRecommendationsBySimilarEvents(userId: number): Observable<EventRecommendation[]> {
    return this.http.get<EventRecommendation[]>(`${this.apiUrl}/${userId}/by-similar-events`);
  }

  getPersonalizedRecommendations(userId: number): Observable<EventRecommendation[]> {
    return this.http.get<EventRecommendation[]>(`${this.apiUrl}/${userId}/recommendations/events`);
  }
} 