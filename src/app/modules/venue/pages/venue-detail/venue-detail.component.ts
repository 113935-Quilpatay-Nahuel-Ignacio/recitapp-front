import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { VenueService } from '../../services/venue.service';
import { Venue, VenueSection } from '../../models/venue';
import { EventDTO } from '../../../event/models/event';
import { UserService } from '../../../user/services/user.service';
import { FollowVenueButtonComponent } from '../../../user/components/follow-venue-button/follow-venue-button.component';

@Component({
  selector: 'app-venue-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FollowVenueButtonComponent],
  templateUrl: './venue-detail.component.html',
  styleUrls: ['./venue-detail.component.scss'],
})
export class VenueDetailComponent implements OnInit {
  venueId!: number;
  venue: Venue | null = null;
  sections: VenueSection[] = [];
  upcomingEvents: EventDTO[] = [];
  loading = {
    venue: false,
    sections: false,
    events: false,
  };
  error = {
    venue: '',
    sections: '',
    events: '',
  };
  userId = 2; // For demo purposes, hardcoded user ID
  isAdmin = true; // For demo purposes, hardcoded admin status
  currentTab: 'info' | 'events' | 'sections' = 'info';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private venueService: VenueService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.venueId = +id;
        this.loadVenueDetails();
        this.loadVenueSections();
        this.loadUpcomingEvents();
      }
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

  setTab(tab: 'info' | 'events' | 'sections'): void {
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

  onFollowStatusChanged(following: boolean): void {
    // Refresh venue details or update UI as needed
    console.log(
      `Usuario ${following ? 'ahora sigue' : 'dejó de seguir'} este recinto`
    );
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
}
