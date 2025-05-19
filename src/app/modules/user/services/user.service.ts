import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, UserRegistration, UserUpdate } from '../models/user';
import { environment } from '../../../../environments/environment';
import { NotificationPreferences } from '../models/notification-preferences';
import { PurchaseHistory } from '../models/purchase-history';

// Define interfaces for the backend DTOs to ensure type safety during mapping
interface BackendTicketPurchaseDTO {
  ticketId: number;
  eventName: string;
  artistName: string;
  venueName: string;
  section: string;
  eventDate: string; // Serialized LocalDateTime
  price: number;
  ticketStatus: string;
  qrCode?: string;
  eventId?: number; // Add if backend can provide it
}

interface BackendPurchaseHistoryDTO {
  transactionId: number;
  purchaseDate: string; // Serialized LocalDateTime
  totalAmount: number;
  paymentMethod: string;
  transactionStatus: string;
  tickets: BackendTicketPurchaseDTO[];
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  registerUser(userData: UserRegistration): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/register`, userData);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  updateUser(id: number, userData: UserUpdate): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${id}`, userData);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getUserPurchaseHistory(userId: number): Observable<PurchaseHistory[]> {
    return this.http.get<BackendPurchaseHistoryDTO[]>(`${this.baseUrl}/${userId}/purchases`).pipe(
      map(backendTransactions => {
        const frontendPurchases: PurchaseHistory[] = [];
        for (const transaction of backendTransactions) {
          for (const ticket of transaction.tickets) {
            frontendPurchases.push({
              ticketId: ticket.ticketId,
              // eventId: ticket.eventId, // Uncomment if backend adds eventId to TicketPurchaseDTO
              eventName: ticket.eventName,
              artistName: ticket.artistName,
              venueName: ticket.venueName,
              sectionName: ticket.section, // Map from 'section'
              eventDate: new Date(ticket.eventDate),
              price: ticket.price,
              status: ticket.ticketStatus, // Map from 'ticketStatus'
              qrCode: ticket.qrCode,
              purchaseDate: new Date(transaction.purchaseDate), // Use transaction's purchaseDate
              // currency: undefined, // Or map if available
            });
          }
        }
        return frontendPurchases;
      })
    );
  }

  getFollowedArtists(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${userId}/artists/following`);
  }

  followArtist(userId: number, artistId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${userId}/artists/follow`, {
      artistId,
    });
  }

  unfollowArtist(userId: number, artistId: number): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/${userId}/artists/${artistId}/unfollow`
    );
  }

  isFollowingArtist(userId: number, artistId: number): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.baseUrl}/${userId}/artists/${artistId}/is-following`
    );
  }

  getFollowedVenues(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${userId}/venues/following`);
  }

  followVenue(userId: number, venueId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${userId}/venues/follow`, {
      venueId,
    });
  }

  unfollowVenue(userId: number, venueId: number): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/${userId}/venues/${venueId}/unfollow`
    );
  }

  isFollowingVenue(userId: number, venueId: number): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.baseUrl}/${userId}/venues/${venueId}/is-following`
    );
  }

  getNotificationPreferences(
    userId: number
  ): Observable<NotificationPreferences> {
    return this.http.get<NotificationPreferences>(
      `${this.baseUrl}/${userId}/notification-preferences`
    );
  }

  updateNotificationPreferences(
    userId: number,
    preferences: NotificationPreferences
  ): Observable<NotificationPreferences> {
    return this.http.put<NotificationPreferences>(
      `${this.baseUrl}/${userId}/notification-preferences`,
      preferences
    );
  }
}
