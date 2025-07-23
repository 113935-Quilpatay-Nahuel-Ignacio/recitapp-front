import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, PercentPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError, finalize } from 'rxjs/operators';

import { ArtistService } from '../../../artist/services/artist.service';
import { ArtistStatisticsDTO } from '../../../artist/models/artist-statistics';
import { Artist } from '../../../artist/models/artist';
import { MusicGenre } from '../../../artist/models/music-genre';
import { ExportService } from '../../../../shared/services/export.service';

@Component({
  selector: 'app-artist-reports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, DatePipe, PercentPipe],
  templateUrl: './artist-reports.component.html',
  styleUrls: ['./artist-reports.component.scss']
})
export class ArtistReportsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private artistService = inject(ArtistService);
  private exportService = inject(ExportService);

  reportForm: FormGroup;
  reportData: ArtistStatisticsDTO[] | null = null;
  genres$: Observable<MusicGenre[]> = of([]);
  isLoading = false;
  errorMessage: string | null = null;
  reportGeneratedDate: Date | null = null;

  // Propiedades para el resumen
  totalArtists = 0;
  totalFollowers = 0;
  totalEvents = 0;
  totalUpcomingEvents = 0;

  // Control de errores de imágenes
  private artistImageErrors = new Set<number>();
  private allArtists: Artist[] = [];

  constructor() {
    this.reportForm = this.fb.group({
      activeFilter: ['all'],
      genreFilter: [null],
      sortBy: ['followers'],
      limit: ['25']
    });
  }

  ngOnInit(): void {
    this.loadGenres();
    this.loadAllArtists();
  }

  private loadGenres(): void {
    this.genres$ = this.artistService.getAllGenres().pipe(
      catchError(err => {
        console.error('Error loading genres:', err);
        return of([]);
      })
    );
  }

  private loadAllArtists(): void {
    this.artistService.getAllArtists(false).pipe(
      catchError(err => {
        console.error('Error loading all artists:', err);
        return of([]);
      })
    ).subscribe(artists => {
      this.allArtists = artists;
    });
  }

  generateReport(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.reportData = null;

    const formValues = this.reportForm.value;
    
    // Determinar qué artistas obtener basado en el filtro de estado
    let artistsToProcess: Observable<Artist[]>;
    
    switch (formValues.activeFilter) {
      case 'active':
        artistsToProcess = this.artistService.getAllArtists(true);
        break;
      case 'inactive':
        artistsToProcess = this.artistService.getAllArtists(false).pipe(
          map(artists => artists.filter(artist => !artist.active))
        );
        break;
      default: // 'all'
        artistsToProcess = this.artistService.getAllArtists(false);
        break;
    }

    artistsToProcess.pipe(
      map(artists => {
        // Filtrar por género si se seleccionó uno
        if (formValues.genreFilter) {
          return artists.filter(artist => 
            artist.genreIds && artist.genreIds.includes(parseInt(formValues.genreFilter))
          );
        }
        return artists;
      }),
      // Obtener estadísticas para cada artista
      map(artists => {
        const statisticsRequests = artists.map(artist =>
          this.artistService.getArtistStatistics(artist.id).pipe(
            catchError(err => {
              console.warn(`Error loading statistics for artist ${artist.id}:`, err);
              // Retornar estadísticas básicas si hay error
              return of({
                artistId: artist.id,
                artistName: artist.name,
                profileImage: artist.profileImage,
                totalFollowers: 0,
                totalEvents: 0,
                upcomingEvents: 0,
                pastEvents: 0,
                lastUpdateDate: undefined,
                followerGrowthRate: undefined
              } as ArtistStatisticsDTO);
            })
          )
        );
        
        return forkJoin(statisticsRequests);
      }),
      map(statisticsObservable => statisticsObservable),
      catchError(err => {
        console.error('Error generating report:', err);
        this.errorMessage = 'Error al generar el reporte. Por favor, inténtalo de nuevo.';
        return of(of([]));
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe(statisticsObservable => {
      statisticsObservable.subscribe(statistics => {
        this.processReportData(statistics, formValues);
      });
    });
  }

  private processReportData(statistics: ArtistStatisticsDTO[], formValues: any): void {
    // Ordenar según el criterio seleccionado
    let sortedData = [...statistics];
    
    switch (formValues.sortBy) {
      case 'followers':
        sortedData.sort((a, b) => b.totalFollowers - a.totalFollowers);
        break;
      case 'events':
        sortedData.sort((a, b) => b.totalEvents - a.totalEvents);
        break;
      case 'upcomingEvents':
        sortedData.sort((a, b) => b.upcomingEvents - a.upcomingEvents);
        break;
      case 'name':
        sortedData.sort((a, b) => a.artistName.localeCompare(b.artistName));
        break;
    }

    // Aplicar límite si no es 'all'
    if (formValues.limit !== 'all') {
      const limit = parseInt(formValues.limit);
      sortedData = sortedData.slice(0, limit);
    }

    this.reportData = sortedData;
    this.calculateSummary(sortedData);
    this.reportGeneratedDate = new Date();
  }

  private calculateSummary(data: ArtistStatisticsDTO[]): void {
    this.totalArtists = data.length;
    this.totalFollowers = data.reduce((sum, artist) => sum + artist.totalFollowers, 0);
    this.totalEvents = data.reduce((sum, artist) => sum + artist.totalEvents, 0);
    this.totalUpcomingEvents = data.reduce((sum, artist) => sum + artist.upcomingEvents, 0);
  }

  // Métodos para manejo de imágenes
  hasArtistImageError(artistId: number): boolean {
    return this.artistImageErrors.has(artistId);
  }

  onArtistImageError(artistId: number): void {
    this.artistImageErrors.add(artistId);
  }

  // Métodos para obtener estado del artista
  getArtistStatus(artistId: number): string {
    const artist = this.allArtists.find(a => a.id === artistId);
    return artist?.active ? 'Activo' : 'Inactivo';
  }

  getStatusBadgeClass(artistId: number): string {
    const artist = this.allArtists.find(a => a.id === artistId);
    return artist?.active ? 'bg-success' : 'bg-secondary';
  }

  // Métodos para crecimiento de seguidores
  getGrowthBadgeClass(growthRate: number): string {
    if (growthRate > 0) return 'bg-success';
    if (growthRate < 0) return 'bg-danger';
    return 'bg-secondary';
  }

  getGrowthIcon(growthRate: number): string {
    if (growthRate > 0) return 'bi-arrow-up';
    if (growthRate < 0) return 'bi-arrow-down';
    return 'bi-dash';
  }

  async exportToPDF(): Promise<void> {
    if (!this.reportData || this.reportData.length === 0) {
      console.warn('No hay datos de reporte disponibles para exportar');
      return;
    }

    try {
      const exportData = {
        title: 'Reporte de Estadísticas de Artistas',
        subtitle: `Filtros aplicados: ${this.getAppliedFiltersDescription()}`,
        metadata: {
          'Fecha de Generación': this.reportGeneratedDate?.toLocaleDateString('es-AR') || new Date().toLocaleDateString('es-AR'),
          'Total de Artistas': this.totalArtists,
          'Total Seguidores': this.totalFollowers,
          'Total Eventos': this.totalEvents
        },
        columns: [
          { header: 'Artista', key: 'artistName', width: 25 },
          { header: 'Estado', key: 'status', width: 15 },
          { header: 'Seguidores', key: 'totalFollowers', width: 15, type: 'number' as const },
          { header: 'Eventos Totales', key: 'totalEvents', width: 15, type: 'number' as const },
          { header: 'Eventos Futuros', key: 'upcomingEvents', width: 15, type: 'number' as const },
          { header: 'Eventos Pasados', key: 'pastEvents', width: 15, type: 'number' as const },
          { header: 'Crecimiento', key: 'followerGrowthRate', width: 15, type: 'percentage' as const }
        ],
        data: this.reportData.map(artist => ({
          ...artist,
          status: this.getArtistStatus(artist.artistId),
          followerGrowthRate: artist.followerGrowthRate || 0
        })),
        summary: {
          'Total de Artistas': this.totalArtists,
          'Total Seguidores': this.totalFollowers.toLocaleString('es-AR'),
          'Total Eventos': this.totalEvents.toLocaleString('es-AR'),
          'Eventos Próximos': this.totalUpcomingEvents.toLocaleString('es-AR')
        }
      };

      await this.exportService.exportToPDF(exportData);
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      alert('Error al generar el archivo PDF. Por favor, inténtelo de nuevo.');
    }
  }

  async exportToExcel(): Promise<void> {
    if (!this.reportData || this.reportData.length === 0) {
      console.warn('No hay datos de reporte disponibles para exportar');
      return;
    }

    try {
      const exportData = {
        title: 'Reporte de Estadísticas de Artistas',
        subtitle: `Filtros aplicados: ${this.getAppliedFiltersDescription()}`,
        metadata: {
          'Fecha de Generación': this.reportGeneratedDate?.toLocaleDateString('es-AR') || new Date().toLocaleDateString('es-AR'),
          'Total de Artistas': this.totalArtists,
          'Total Seguidores': this.totalFollowers,
          'Total Eventos': this.totalEvents,
          'Eventos Próximos': this.totalUpcomingEvents
        },
        columns: [
          { header: 'ID Artista', key: 'artistId', width: 15, type: 'number' as const },
          { header: 'Artista', key: 'artistName', width: 25 },
          { header: 'Estado', key: 'status', width: 15 },
          { header: 'Seguidores', key: 'totalFollowers', width: 15, type: 'number' as const },
          { header: 'Eventos Totales', key: 'totalEvents', width: 15, type: 'number' as const },
          { header: 'Eventos Futuros', key: 'upcomingEvents', width: 15, type: 'number' as const },
          { header: 'Eventos Pasados', key: 'pastEvents', width: 15, type: 'number' as const },
          { header: 'Crecimiento Seguidores', key: 'followerGrowthRate', width: 20, type: 'number' as const },
          { header: 'Última Actualización', key: 'lastUpdateDate', width: 20, type: 'date' as const }
        ],
        data: this.reportData.map(artist => ({
          ...artist,
          status: this.getArtistStatus(artist.artistId),
          followerGrowthRate: artist.followerGrowthRate || 0
        }))
      };

      await this.exportService.exportToExcel(exportData);
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      alert('Error al generar el archivo Excel. Por favor, inténtelo de nuevo.');
    }
  }

  private getAppliedFiltersDescription(): string {
    const filters = [];
    const formValues = this.reportForm.value;
    
    if (formValues.activeFilter !== 'all') {
      filters.push(`Estado: ${formValues.activeFilter === 'active' ? 'Activos' : 'Inactivos'}`);
    }
    
    if (formValues.genreFilter) {
      filters.push('Género específico');
    }
    
    filters.push(`Ordenado por: ${formValues.sortBy === 'followers' ? 'Seguidores' : 'Eventos'}`);
    filters.push(`Límite: ${formValues.limit} registros`);
    
    return filters.length > 0 ? filters.join(', ') : 'Ninguno';
  }
} 