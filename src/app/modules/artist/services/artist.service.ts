// src/app/modules/artist/services/artist.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Artist } from '../models/artist';
import { MusicGenre } from '../models/music-genre';
import { ArtistDetailDTO } from '../models/artist-detail';
import { ArtistStatisticsDTO } from '../models/artist-statistics';
import { EventDTO } from '../../event/models/event';

@Injectable({
  providedIn: 'root',
})
export class ArtistService {
  private baseUrl = `${environment.apiUrl}/artists`;

  constructor(private http: HttpClient) {}

  createArtist(artist: Artist): Observable<Artist> {
    return this.http.post<Artist>(this.baseUrl, artist);
  }

  updateArtist(id: number, artist: Artist): Observable<Artist> {
    return this.http.put<Artist>(`${this.baseUrl}/${id}`, artist);
  }

  deleteArtist(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  deactivateArtist(id: number): Observable<Artist> {
    return this.http.patch<Artist>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  getArtistDetail(id: number): Observable<ArtistDetailDTO> {
    return this.http.get<ArtistDetailDTO>(`${this.baseUrl}/${id}`);
  }

  getAllArtists(activeOnly: boolean = true): Observable<Artist[]> {
    return this.http.get<Artist[]>(`${this.baseUrl}?activeOnly=${activeOnly}`);
  }

  searchArtistsByName(
    name: string,
    activeOnly: boolean = true
  ): Observable<Artist[]> {
    return this.http.get<Artist[]>(
      `${this.baseUrl}?name=${encodeURIComponent(
        name
      )}&activeOnly=${activeOnly}`
    );
  }

  getArtistsByGenre(
    genreId: number,
    activeOnly: boolean = true
  ): Observable<Artist[]> {
    return this.http.get<Artist[]>(
      `${this.baseUrl}?genreId=${genreId}&activeOnly=${activeOnly}`
    );
  }

  getArtistEvents(
    artistId: number,
    includePastEvents: boolean = false
  ): Observable<EventDTO[]> {
    return this.http.get<EventDTO[]>(
      `${this.baseUrl}/${artistId}/events?includePastEvents=${includePastEvents}`
    );
  }

  getArtistStatistics(artistId: number): Observable<ArtistStatisticsDTO> {
    return this.http.get<ArtistStatisticsDTO>(
      `${this.baseUrl}/${artistId}/statistics`
    );
  }

  getMostPopularArtists(limit: number = 10): Observable<Artist[]> {
    return this.http.get<Artist[]>(`${this.baseUrl}/popular?limit=${limit}`);
  }

  updateArtistPlatforms(
    id: number,
    platforms: {
      spotifyUrl?: string;
      youtubeUrl?: string;
      soundcloudUrl?: string;
      instagramUrl?: string;
      bandcampUrl?: string;
    }
  ): Observable<Artist> {
    return this.http.put<Artist>(`${this.baseUrl}/${id}/platforms`, platforms);
  }

  addGenreToArtist(artistId: number, genreId: number): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/${artistId}/genres/${genreId}`,
      {}
    );
  }

  removeGenreFromArtist(artistId: number, genreId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/${artistId}/genres/${genreId}`
    );
  }

  getArtistGenres(artistId: number): Observable<MusicGenre[]> {
    return this.http.get<MusicGenre[]>(`${this.baseUrl}/${artistId}/genres`);
  }

  getAllGenres(): Observable<MusicGenre[]> {
    return this.http.get<MusicGenre[]>(`${environment.apiUrl}/genres`);
  }

  getArtistById(id: number): Observable<Artist> {
    return this.http.get<Artist>(`${this.baseUrl}/${id}`);
  }
}
