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

export interface EnhancedEventRecommendation {
  id: number;
  name: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  
  // Información del recinto
  venueId: number;
  venueName: string;
  venueAddress: string;
  
  // Información del artista principal
  mainArtistId?: number;
  mainArtistName?: string;
  mainArtistImage?: string;
  
  // Información adicional del evento
  statusName: string;
  flyerImage?: string;
  ticketPrice?: number;
  availableTickets?: number;
  
  // Información de la recomendación
  recommendationType: 'FOLLOWED_ARTIST' | 'FOLLOWED_VENUE' | 'SIMILAR_GENRE' | 'POPULAR';
  recommendationScore: number;
  followedArtistNames: string[];
  followedVenueNames: string[];
  matchingGenres: string[];
  recommendationReason: string;
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

  getEnhancedPersonalizedRecommendations(userId: number): Observable<EnhancedEventRecommendation[]> {
    return this.http.get<EnhancedEventRecommendation[]>(`${this.apiUrl}/${userId}/recommendations/events/enhanced`);
  }
} 