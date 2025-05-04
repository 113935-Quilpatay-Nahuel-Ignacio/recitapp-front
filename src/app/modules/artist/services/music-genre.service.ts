import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { MusicGenre } from '../models/music-genre';

@Injectable({
  providedIn: 'root',
})
export class MusicGenreService {
  private baseUrl = `${environment.apiUrl}/genres`;

  constructor(private http: HttpClient) {}

  getAllGenres(): Observable<MusicGenre[]> {
    return this.http.get<MusicGenre[]>(this.baseUrl);
  }

  getGenreById(id: number): Observable<MusicGenre> {
    return this.http.get<MusicGenre>(`${this.baseUrl}/${id}`);
  }

  createGenre(genre: MusicGenre): Observable<MusicGenre> {
    return this.http.post<MusicGenre>(this.baseUrl, genre);
  }

  updateGenre(id: number, genre: MusicGenre): Observable<MusicGenre> {
    return this.http.put<MusicGenre>(`${this.baseUrl}/${id}`, genre);
  }

  deleteGenre(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getMostPopularGenres(limit: number = 10): Observable<MusicGenre[]> {
    return this.http.get<MusicGenre[]>(
      `${this.baseUrl}/popular?limit=${limit}`
    );
  }

  searchGenresByName(name: string): Observable<MusicGenre[]> {
    return this.http.get<MusicGenre[]>(
      `${this.baseUrl}/search?name=${encodeURIComponent(name)}`
    );
  }

  getArtistsByGenre(
    genreId: number,
    activeOnly: boolean = true
  ): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/${genreId}/artists?activeOnly=${activeOnly}`
    );
  }
}
