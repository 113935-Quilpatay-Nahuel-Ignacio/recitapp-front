import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

// Services
import { ReservationAdminService } from '../../services/reservation-admin.service';
import { ArtistService } from '../../../artist/services/artist.service';
import { EventService } from '../../../event/services/event.service';
import { VenueService } from '../../../venue/services/venue.service';
import { TransactionService } from '../../../transaction/services/transaction.service';

// Models
import { EventSalesReportDTO } from '../../services/reservation-admin.service';
import { Artist } from '../../../artist/models/artist';
import { EventDTO } from '../../../event/models/event';
import { Venue } from '../../../venue/models/venue';

interface DashboardStats {
  totalEvents: number;
  totalArtists: number;
  totalVenues: number;
  totalActivePaymentMethods: number;
  upcomingEvents: number;
  activeArtists: number;
  activeVenues: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  dashboardStats: DashboardStats = {
    totalEvents: 0,
    totalArtists: 0,
    totalVenues: 0,
    totalActivePaymentMethods: 0,
    upcomingEvents: 0,
    activeArtists: 0,
    activeVenues: 0
  };

  recentEvents: EventDTO[] = [];
  popularArtists: Artist[] = [];
  isLoading = false;
  error = '';
  
  // Track image errors
  eventImageErrors = new Set<number>();
  artistImageErrors = new Set<number>();

  constructor(
    private reservationAdminService: ReservationAdminService,
    private artistService: ArtistService,
    private eventService: EventService,
    private venueService: VenueService,
    private transactionService: TransactionService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.error = '';
    
    // Clear previous image errors
    this.eventImageErrors.clear();
    this.artistImageErrors.clear();

    // Load all dashboard data in parallel
    forkJoin({
      events: this.eventService.getAllEvents().pipe(catchError(() => of([]))),
      artists: this.artistService.getAllArtists().pipe(catchError(() => of([]))),
      venues: this.venueService.getAllVenues().pipe(catchError(() => of([]))),
      paymentMethods: this.transactionService.getAvailablePaymentMethods().pipe(catchError(() => of([]))),
      popularArtists: this.artistService.getMostPopularArtists(5).pipe(catchError(() => of([])))
    }).subscribe({
      next: (data) => {
        // Calculate stats
        this.dashboardStats = {
          totalEvents: data.events.length,
          totalArtists: data.artists.length,
          totalVenues: data.venues.length,
          totalActivePaymentMethods: data.paymentMethods.length,
          upcomingEvents: data.events.filter(event => new Date(event.startDateTime) > new Date()).length,
          activeArtists: data.artists.filter(artist => artist.active).length,
          activeVenues: data.venues.filter(venue => venue.active).length
        };

        // Get recent events (last 10)
        this.recentEvents = data.events
          .sort((a, b) => new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime())
          .slice(0, 10);

        this.popularArtists = data.popularArtists;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.error = 'Error al cargar los datos del dashboard';
        this.isLoading = false;
      }
    });
  }

  formatDate(dateStr: string | Date): string {
    if (!dateStr) return 'N/A';
    
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'en_venta':
      case 'en venta':
        return 'badge bg-success';
      case 'proximo':
      case 'próximo':
        return 'badge bg-info';
      case 'agotado':
        return 'badge bg-warning';
      case 'cancelado':
      case 'cancelled':
        return 'badge bg-danger';
      case 'finalizado':
        return 'badge bg-secondary';
      case 'active':
      case 'activo':
      case 'confirmed':
      case 'confirmado':
        return 'badge bg-success';
      case 'pending':
      case 'pendiente':
        return 'badge bg-warning';
      default:
        return 'badge bg-secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status?.toLowerCase()) {
      case 'en_venta':
        return 'En Venta';
      case 'proximo':
        return 'Próximo';
      case 'agotado':
        return 'Agotado';
      case 'cancelado':
        return 'Cancelado';
      case 'finalizado':
        return 'Finalizado';
      default:
        return status || 'Sin Estado';
    }
  }

  onEventImageError(event: EventDTO): void {
    this.eventImageErrors.add(event.id);
  }

  onArtistImageError(artist: Artist): void {
    this.artistImageErrors.add(artist.id);
  }

  hasEventImageError(eventId: number): boolean {
    return this.eventImageErrors.has(eventId);
  }

  hasArtistImageError(artistId: number): boolean {
    return this.artistImageErrors.has(artistId);
  }
} 