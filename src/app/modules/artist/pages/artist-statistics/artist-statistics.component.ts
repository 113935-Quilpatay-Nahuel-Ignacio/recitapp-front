import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ArtistService } from '../../services/artist.service';
import { ArtistDetailDTO } from '../../models/artist-detail';
import { ArtistStatisticsDTO } from '../../models/artist-statistics';

@Component({
  selector: 'app-artist-statistics',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './artist-statistics.component.html',
  styleUrls: ['./artist-statistics.component.scss'],
})
export class ArtistStatisticsComponent implements OnInit {
  artistId!: number;
  artist: ArtistDetailDTO | null = null;
  statistics: ArtistStatisticsDTO | null = null;
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private artistService: ArtistService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.artistId = +id;
        this.loadArtistDetails();
        this.loadArtistStatistics();
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

  loadArtistStatistics(): void {
    this.loading = true;
    this.error = '';

    this.artistService.getArtistStatistics(this.artistId).subscribe({
      next: (stats) => {
        this.statistics = stats;
        this.loading = false;
      },
      error: (err) => {
        this.error =
          err.error?.message || 'Error al cargar las estadísticas del artista';
        this.loading = false;
      },
    });
  }

  formatDate(dateStr: string | Date | undefined): string {
    if (!dateStr) return 'N/A';

    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;

    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getGrowthRateClass(rate: number | undefined): string {
    if (rate === undefined || rate === null || rate === 0)
      return 'text-secondary';
    if (rate > 0) return 'text-success';
    return 'text-danger';
  }

  getGrowthRateDescription(rate: number | undefined): string {
    if (rate === undefined || rate === null) return 'Sin datos';
    if (rate === 0) return 'Estable';
    if (rate > 0) {
      if (rate < 1) return 'Crecimiento lento';
      if (rate < 3) return 'Crecimiento moderado';
      if (rate < 10) return 'Crecimiento rápido';
      return 'Crecimiento explosivo';
    } else {
      const absRate = Math.abs(rate);
      if (absRate < 1) return 'Disminución leve';
      if (absRate < 3) return 'Disminución moderada';
      if (absRate < 10) return 'Disminución significativa';
      return 'Disminución drástica';
    }
  }
}
