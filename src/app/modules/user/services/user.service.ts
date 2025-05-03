import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UserRegistration, UserUpdate } from '../models/user';
import { environment } from '../../../../environments/environment';
import { NotificationPreferences } from '../models/notification-preferences';

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

  getUserPurchaseHistory(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${userId}/purchases`);
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
