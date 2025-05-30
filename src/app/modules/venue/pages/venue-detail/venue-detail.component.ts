import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { VenueService } from '../../services/venue.service';
import { Venue, VenueSection, VenueStatistics } from '../../models/venue';
import { EventDTO } from '../../../event/models/event';
import { UserService } from '../../../user/services/user.service';
import { FollowVenueButtonComponent } from '../../../user/components/follow-venue-button/follow-venue-button.component';
import { SessionService } from '../../../../core/services/session.service';
import { DropdownDirective } from '../../../../shared/directives/dropdown.directive';

@Component({
  selector: 'app-venue-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FollowVenueButtonComponent, DropdownDirective],
  templateUrl: './venue-detail.component.html',
  styleUrls: ['./venue-detail.component.scss'],
})
export class VenueDetailComponent implements OnInit {
  venueId!: number;
  venue: Venue | null = null;
  sections: VenueSection[] = [];
  upcomingEvents: EventDTO[] = [];
  venueStats: VenueStatistics | null = null;
  loading = {
    venue: false,
    sections: false,
    events: false,
    stats: false,
  };
  error = {
    venue: '',
    sections: '',
    events: '',
    stats: '',
  };
  userId: number | null = null;
  isAdmin = false;
  currentTab: 'info' | 'events' | 'sections' | 'stats' = 'info';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private venueService: VenueService,
    private userService: UserService,
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    this.userId = this.sessionService.getCurrentUserId();
    const currentUser = this.sessionService.getCurrentUser();
    this.isAdmin = currentUser?.role?.name === 'ADMIN';
    
    this.route.params.subscribe((params) => {
      this.venueId = +params['id'];
      this.loadVenueDetails();
    });
  }

  loadVenueDetails(): void {
    this.loading.venue = true;
    this.error.venue = '';

    this.venueService.getVenueById(this.venueId).subscribe({
      next: (venue) => {
        this.venue = venue;
        this.loading.venue = false;
      },
      error: (err) => {
        this.error.venue =
          err.error?.message || 'Error al cargar los datos del recinto';
        this.loading.venue = false;
      },
    });
  }

  loadVenueSections(): void {
    this.loading.sections = true;
    this.error.sections = '';

    this.venueService.getVenueSections(this.venueId).subscribe({
      next: (sections) => {
        this.sections = sections;
        this.loading.sections = false;
      },
      error: (err) => {
        this.error.sections =
          err.error?.message || 'Error al cargar las secciones del recinto';
        this.loading.sections = false;
      },
    });
  }

  loadUpcomingEvents(): void {
    this.loading.events = true;
    this.error.events = '';

    this.venueService.getVenueEvents(this.venueId, false).subscribe({
      next: (events) => {
        this.upcomingEvents = events;
        this.loading.events = false;
      },
      error: (err) => {
        this.error.events =
          err.error?.message || 'Error al cargar eventos del recinto';
        this.loading.events = false;
      },
    });
  }

  loadVenueStatistics(): void {
    this.loading.stats = true;
    this.error.stats = '';

    this.venueService.getVenueStatistics(this.venueId).subscribe({
      next: (stats) => {
        this.venueStats = stats;
        this.loading.stats = false;
      },
      error: (err) => {
        this.error.stats =
          err.error?.message || 'Error al cargar las estadísticas del recinto';
        this.loading.stats = false;
      },
    });
  }

  setTab(tab: 'info' | 'events' | 'sections' | 'stats'): void {
    this.currentTab = tab;
  }

  // Fix for the date formatting error by safely handling undefined values
  formatDate(dateStr: string | Date | undefined): string {
    if (!dateStr) return 'No disponible';

    try {
      const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
      return date.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  }

  formatCapacity(capacity: number | undefined): string {
    if (!capacity) return 'No especificada';
    return capacity.toLocaleString('es-AR');
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

  confirmDeactivate(): void {
    if (
      confirm(
        `¿Estás seguro de que deseas desactivar el recinto ${this.venue?.name}?`
      )
    ) {
      this.deactivateVenue();
    }
  }

  deactivateVenue(): void {
    if (!this.venue) return;

    this.loading.venue = true;
    this.error.venue = '';

    this.venueService.deactivateVenue(this.venueId).subscribe({
      next: (updatedVenue) => {
        this.venue = updatedVenue;
        this.loading.venue = false;
      },
      error: (err) => {
        this.error.venue =
          err.error?.message || 'Error al desactivar el recinto';
        this.loading.venue = false;
      },
    });
  }

  confirmActivate(): void {
    if (
      confirm(
        `¿Estás seguro de que deseas activar el recinto ${this.venue?.name}?`
      )
    ) {
      this.activateVenue();
    }
  }

  activateVenue(): void {
    if (!this.venue) return;

    this.loading.venue = true;
    this.error.venue = '';

    this.venueService.activateVenue(this.venueId).subscribe({
      next: (updatedVenue) => {
        this.venue = updatedVenue;
        this.loading.venue = false;
      },
      error: (err) => {
        this.error.venue =
          err.error?.message || 'Error al activar el recinto';
        this.loading.venue = false;
      },
    });
  }

  // Method to handle navigation to Google Maps
  navigateToGoogleMaps(): void {
    if (this.venue?.googleMapsUrl) {
      window.open(this.venue.googleMapsUrl, '_blank');
    } else if (this.venue?.latitude && this.venue?.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${this.venue.latitude},${this.venue.longitude}`;
      window.open(url, '_blank');
    }
  }

  confirmDelete(): void {
    if (
      confirm(
        `¿Estás ABSOLUTAMENTE SEGURO de que deseas ELIMINAR PERMANENTEMENTE el recinto ${this.venue?.name}? Esta acción no se puede deshacer y solo funcionará si el recinto no tiene eventos asociados.`
      )
    ) {
      this.deleteCurrentVenue();
    }
  }

  deleteCurrentVenue(): void {
    if (!this.venue) return;

    this.loading.venue = true;
    this.error.venue = '';

    this.venueService.deleteVenue(this.venueId).subscribe({
      next: () => {
        this.loading.venue = false;
        alert(`Recinto "${this.venue?.name}" eliminado correctamente.`);
        this.router.navigate(['/venues']);
      },
      error: (err) => {
        this.error.venue =
          err.error?.message || 'Error al eliminar el recinto. Es posible que tenga eventos asociados.';
        this.loading.venue = false;
      },
    });
  }
}
