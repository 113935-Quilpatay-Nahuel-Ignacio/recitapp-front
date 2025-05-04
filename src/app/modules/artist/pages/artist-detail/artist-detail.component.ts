// src/app/modules/artist/pages/artist-detail/artist-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ArtistService } from '../../services/artist.service';
import { UserService } from '../../../user/services/user.service';
import { ArtistDetailDTO } from '../../models/artist-detail';
import { ArtistStatisticsDTO } from '../../models/artist-statistics';
import { EventDTO } from '../../../event/models/event';
import { FollowArtistButtonComponent } from '../../../user/components/follow-artist-button/follow-artist-button.component';

@Component({
  selector: 'app-artist-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule,
    FollowArtistButtonComponent,
  ],
  templateUrl: './artist-detail.component.html',
  styleUrls: ['./artist-detail.component.scss'],
})
export class ArtistDetailComponent implements OnInit {
  artistId!: number;
  artist: ArtistDetailDTO | null = null;
  artistStats: ArtistStatisticsDTO | null = null;
  events: EventDTO[] = [];

  loading = {
    artist: false,
    stats: false,
    events: false,
  };

  error = {
    artist: '',
    stats: '',
    events: '',
  };

  isAdmin = false; // This would come from auth service in a real app
  userId = 1; // This would come from auth service in a real app
  defaultImage = 'assets/images/default-artist.jpg';

  activeTab: 'info' | 'events' | 'stats' = 'info';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private artistService: ArtistService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.artistId = +id;
        this.loadArtistDetails();
        this.loadArtistEvents();
        this.loadArtistStatistics();
      } else {
        this.router.navigate(['/artists']);
      }
    });
  }

  loadArtistDetails(): void {
    this.loading.artist = true;
    this.error.artist = '';

    this.artistService.getArtistDetail(this.artistId).subscribe({
      next: (artist) => {
        this.artist = artist;
        this.loading.artist = false;
      },
      error: (err) => {
        this.error.artist = 'Error al cargar los detalles del artista';
        console.error('Error loading artist details:', err);
        this.loading.artist = false;
      },
    });
  }

  loadArtistEvents(): void {
    this.loading.events = true;
    this.error.events = '';

    this.artistService.getArtistEvents(this.artistId, true).subscribe({
      next: (events) => {
        this.events = events;
        this.loading.events = false;
      },
      error: (err) => {
        this.error.events = 'Error al cargar los eventos del artista';
        console.error('Error loading artist events:', err);
        this.loading.events = false;
      },
    });
  }

  loadArtistStatistics(): void {
    this.loading.stats = true;
    this.error.stats = '';

    this.artistService.getArtistStatistics(this.artistId).subscribe({
      next: (stats) => {
        this.artistStats = stats;
        this.loading.stats = false;
      },
      error: (err) => {
        this.error.stats = 'Error al cargar las estadísticas del artista';
        console.error('Error loading artist statistics:', err);
        this.loading.stats = false;
      },
    });
  }

  onImageError(event: any): void {
    event.target.src = this.defaultImage;
  }

  onFollowStatusChanged(isFollowing: boolean): void {
    // Refresh statistics after follow/unfollow
    this.loadArtistStatistics();
  }

  setActiveTab(tab: 'info' | 'events' | 'stats'): void {
    this.activeTab = tab;
  }

  isFutureEvent(event: EventDTO): boolean {
    return new Date(event.startDateTime) > new Date();
  }

  // Admin actions
  editArtist(): void {
    this.router.navigate(['/artists', this.artistId, 'edit']);
  }

  deactivateArtist(): void {
    if (!this.artist) return;

    if (
      confirm(
        `¿Estás seguro de que deseas ${
          this.artist.active ? 'desactivar' : 'activar'
        } al artista ${this.artist.name}?`
      )
    ) {
      this.artistService.deactivateArtist(this.artistId).subscribe({
        next: () => {
          this.loadArtistDetails();
        },
        error: (err) => {
          alert(
            `Error al ${
              this.artist?.active ? 'desactivar' : 'activar'
            } el artista`
          );
          console.error('Error deactivating artist:', err);
        },
      });
    }
  }

  deleteArtist(): void {
    if (!this.artist) return;

    if (
      confirm(
        `¿Estás seguro de que deseas eliminar permanentemente al artista ${this.artist.name}?`
      )
    ) {
      this.artistService.deleteArtist(this.artistId).subscribe({
        next: () => {
          alert('Artista eliminado correctamente');
          this.router.navigate(['/artists']);
        },
        error: (err) => {
          alert('Error al eliminar el artista');
          console.error('Error deleting artist:', err);
        },
      });
    }
  }
}
