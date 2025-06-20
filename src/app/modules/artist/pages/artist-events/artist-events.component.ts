import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ArtistService } from '../../services/artist.service';
import { ArtistDetailDTO } from '../../models/artist-detail';
import { EventDTO } from '../../../event/models/event';
import { StatusFormatter } from '../../../../shared/utils/status-formatter.util';

@Component({
  selector: 'app-artist-events',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './artist-events.component.html',
  styleUrls: ['./artist-events.component.scss'],
})
export class ArtistEventsComponent implements OnInit {
  artistId!: number;
  artist: ArtistDetailDTO | null = null;
  events: EventDTO[] = [];
  loading = false;
  error = '';
  includePastEvents = false;
  imageErrors: Set<number> = new Set();

  constructor(
    private route: ActivatedRoute,
    private artistService: ArtistService
  ) {}

  ngOnInit(): void {
    console.log('🎵 ArtistEventsComponent: ngOnInit called');
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      console.log('🎵 Route params received:', params.keys, 'id:', id);
      if (id) {
        this.artistId = +id;
        console.log('🎵 Artist ID parsed:', this.artistId);
        this.loadArtistDetails();
        this.loadArtistEvents();
      } else {
        console.error('🎵 No artist ID found in route params');
      }
    });
  }

  loadArtistDetails(): void {
    console.log('🎵 Loading artist details for ID:', this.artistId);
    this.loading = true;
    this.artistService.getArtistDetail(this.artistId).subscribe({
      next: (artist) => {
        console.log('🎵 Artist details loaded successfully:', artist);
        this.artist = artist;
        this.loading = false;
      },
      error: (err) => {
        console.error('🎵 Error loading artist details:', err);
        this.error = err.error?.message || 'Error al cargar datos del artista';
        this.loading = false;
      },
    });
  }

  loadArtistEvents(): void {
    console.log('🎵 Starting to load events for artist ID:', this.artistId);
    console.log('🎵 Include past events:', this.includePastEvents);
    
    this.loading = true;
    this.error = '';

    this.artistService
      .getArtistEvents(this.artistId, this.includePastEvents)
      .subscribe({
        next: (events) => {
          console.log('🎵 Events API response received:', events);
          console.log('🎵 Number of events:', events ? events.length : 0);
          this.events = events || [];
          this.loading = false;
          
          if (this.events.length === 0) {
            console.warn('🎵 No events found for this artist');
          } else {
            console.log('🎵 Events loaded successfully:', this.events);
          }
        },
        error: (err) => {
          console.error('🎵 Error loading artist events:', err);
          console.error('🎵 Error details:', {
            status: err.status,
            statusText: err.statusText,
            error: err.error,
            message: err.message,
            url: err.url
          });
          this.error =
            err.error?.message || 'Error al cargar los eventos del artista';
          this.loading = false;
        },
      });
  }

  togglePastEvents(): void {
    this.loadArtistEvents();
  }

  formatDate(dateStr: string | Date): string {
    if (!dateStr) return 'N/A';
    
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatStatusName(status: string | undefined): string {
    return StatusFormatter.formatStatusName(status);
  }

  getStatusClass(status: string): string {
    return StatusFormatter.getStatusClass(status);
  }

  getStatusIcon(status: string): string {
    return StatusFormatter.getStatusIcon(status);
  }

  onImageError(eventId: number): void {
    this.imageErrors.add(eventId);
  }

  hasImageError(eventId: number): boolean {
    return this.imageErrors.has(eventId);
  }
}