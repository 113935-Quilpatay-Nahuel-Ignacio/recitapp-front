import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

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
  primaryArtist: {
    id: number;
    name: string;
    description: string;
  };
  additionalArtists: Array<{
    id: number;
    name: string;
    description: string;
  }>;
  status: string;
  verified: boolean;
  imageUrl?: string;
  ticketPrices: Array<{
    sectionName: string;
    price: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class UserRecommendationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  constructor() { }

  /**
   * Obtiene recomendaciones personalizadas para un usuario
   */
  getPersonalizedRecommendations(userId: number, limit: number = 20): Observable<EventRecommendation[]> {
    return this.http.get<EventRecommendation[]>(`${this.apiUrl}/${userId}/recommendations/events`, {
      params: { limit: limit.toString() }
    });
  }

  /**
   * Obtiene eventos de artistas seguidos por el usuario
   */
  getEventsFromFollowedArtists(userId: number, limit: number = 10): Observable<EventRecommendation[]> {
    return this.http.get<EventRecommendation[]>(`${this.apiUrl}/${userId}/recommendations/events/followed-artists`, {
      params: { limit: limit.toString() }
    });
  }

  /**
   * Obtiene recomendaciones de eventos similares
   */
  getSimilarEventRecommendations(userId: number, limit: number = 10): Observable<EventRecommendation[]> {
    return this.http.get<EventRecommendation[]>(`${this.apiUrl}/${userId}/recommendations/events/similar`, {
      params: { limit: limit.toString() }
    });
  }
} 