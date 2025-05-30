// src/app/modules/user/pages/user-following/user-following.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { SessionService } from '../../../../core/services/session.service';
import { ArtistFollower } from '../../../artist/models/artist';
import { VenueFollower } from '../../../venue/models/venue';

@Component({
  selector: 'app-user-following',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule],
  templateUrl: './user-following.component.html'
})
export class UserFollowingComponent implements OnInit {
  followedArtists: ArtistFollower[] = [];
  followedVenues: VenueFollower[] = [];
  activeTab: 'artists' | 'venues' = 'artists';
  loading = {
    artists: false,
    venues: false,
  };
  error = {
    artists: '',
    venues: '',
  };
  userId: number | null = null;

  constructor(
    private userService: UserService,
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    this.userId = this.sessionService.getCurrentUserId();
    
    if (!this.userId) {
      this.error.artists = 'Usuario no autenticado';
      this.error.venues = 'Usuario no autenticado';
      return;
    }
    
    this.loadFollowedArtists();
    this.loadFollowedVenues();
  }

  loadFollowedArtists(): void {
    if (!this.userId) {
      this.error.artists = 'Usuario no autenticado';
      return;
    }

    this.loading.artists = true;
    this.error.artists = '';

    this.userService.getFollowedArtists(this.userId).subscribe({
      next: (artists) => {
        this.followedArtists = artists;
        this.loading.artists = false;
      },
      error: (err) => {
        this.error.artists = err.error?.message || 'Error al cargar artistas seguidos';
        this.loading.artists = false;
      },
    });
  }

  loadFollowedVenues(): void {
    if (!this.userId) {
      this.error.venues = 'Usuario no autenticado';
      return;
    }

    this.loading.venues = true;
    this.error.venues = '';

    this.userService.getFollowedVenues(this.userId).subscribe({
      next: (venues) => {
        this.followedVenues = venues;
        this.loading.venues = false;
      },
      error: (err) => {
        this.error.venues = err.error?.message || 'Error al cargar recintos seguidos';
        this.loading.venues = false;
      },
    });
  }

  unfollowArtist(artistId: number): void {
    if (!this.userId) {
      this.error.artists = 'Usuario no autenticado';
      return;
    }

    this.userService.unfollowArtist(this.userId, artistId).subscribe({
      next: () => {
        this.followedArtists = this.followedArtists.filter(
          (a) => a.artistId !== artistId
        );
      },
      error: (err) => {
        this.error.artists =
          err.error?.message || 'Error al dejar de seguir al artista';
      },
    });
  }

  unfollowVenue(venueId: number): void {
    if (!this.userId) {
      this.error.venues = 'Usuario no autenticado';
      return;
    }

    this.userService.unfollowVenue(this.userId, venueId).subscribe({
      next: () => {
        this.followedVenues = this.followedVenues.filter(
          (v) => v.venueId !== venueId
        );
      },
      error: (err) => {
        this.error.venues =
          err.error?.message || 'Error al dejar de seguir al recinto';
      },
    });
  }

  setActiveTab(tab: 'artists' | 'venues'): void {
    this.activeTab = tab;
  }

  navigateToArtist(artistId: number): void {
    // Implementar navegación al detalle del artista
    console.log(`Navegar al artista ${artistId}`);
    // Para futuro: this.router.navigate(['/artist', artistId]);
  }

  navigateToVenue(venueId: number): void {
    // Implementar navegación al detalle del recinto
    console.log(`Navegar al recinto ${venueId}`);
    // Para futuro: this.router.navigate(['/venue', venueId]);
  }
}
