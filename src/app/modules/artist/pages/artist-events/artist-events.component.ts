import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ArtistService } from '../../services/artist.service';
import { ArtistDetailDTO } from '../../models/artist-detail';
import { EventDTO } from '../../../event/models/event';

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

  constructor(
    private route: ActivatedRoute,
    private artistService: ArtistService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.artistId = +id;
        this.loadArtistDetails();
        this.loadArtistEvents();
      }
    });
  }

  loadArtistDetails(): void {
    this.loading = true;
    this.artistService.getArtistDetail(this.artistId).subscribe({
      next: (artist) => {
        this.artist = artist;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al cargar datos del artista';
        this.loading = false;
      },
    });
  }

  loadArtistEvents(): void {
    this.loading = true;
    this.error = '';

    this.artistService
      .getArtistEvents(this.artistId, this.includePastEvents)
      .subscribe({
        next: (events) => {
          this.events = events;
          this.loading = false;
        },
        error: (err) => {
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

  getStatusClass(status: string): string {
    switch (status) {
      case 'PROXIMO':
        return 'bg-info';
      case 'EN_VENTA':
        return 'bg-success';
      case 'AGOTADO':
        return 'bg-warning';
      case 'CANCELADO':
        return 'bg-danger';
      case 'FINALIZADO':
        return 'bg-secondary';
      default:
        return 'bg-light';
    }
  }
}