import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { VenueService } from '../../services/venue.service';
import { Venue, VenueSection, VenueStatistics } from '../../models/venue';
import { EventDTO } from '../../../event/models/event';
import { UserService } from '../../../user/services/user.service';
import { FollowVenueButtonComponent } from '../../../user/components/follow-venue-button/follow-venue-button.component';
import { SessionService } from '../../../../core/services/session.service';
import { SimpleDropdownDirective } from '../../../../shared/directives/simple-dropdown.directive';
import { ModalService } from '../../../../shared/services/modal.service';
import { StatusFormatter } from '../../../../shared/utils/status-formatter.util';

@Component({
  selector: 'app-venue-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FollowVenueButtonComponent, SimpleDropdownDirective],
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
    private sessionService: SessionService,
    private modalService: ModalService
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
    
    // Load data automatically when switching tabs
    switch (tab) {
      case 'sections':
        if (this.sections.length === 0 && !this.loading.sections) {
          this.loadVenueSections();
        }
        break;
      case 'events':
        if (this.upcomingEvents.length === 0 && !this.loading.events) {
          this.loadUpcomingEvents();
        }
        break;
      case 'stats':
        if (!this.venueStats && !this.loading.stats) {
          this.loadVenueStatistics();
        }
        break;
    }
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

  formatStatusName(status: string | undefined): string {
    return StatusFormatter.formatStatusName(status);
  }

  getStatusClass(status: string): string {
    return StatusFormatter.getStatusClass(status);
  }

  getStatusIcon(status: string): string {
    return StatusFormatter.getStatusIcon(status);
  }

  confirmDeactivate(): void {
    this.modalService.showConfirm({
      title: 'Confirmar Desactivación',
      message: `¿Estás seguro de que deseas desactivar el recinto ${this.venue?.name}?`,
      type: 'warning',
      confirmText: 'Sí, desactivar',
      cancelText: 'Cancelar',
      details: [
        'El recinto no aparecerá en búsquedas públicas',
        'No se podrán crear nuevos eventos en este recinto',
        'Los eventos existentes no se verán afectados'
      ]
    }).subscribe(confirmed => {
      if (confirmed) {
        this.deactivateVenue();
      }
    });
  }

  deactivateVenue(): void {
    if (!this.venue) return;

    this.loading.venue = true;
    this.error.venue = '';

    this.venueService.deactivateVenue(this.venueId).subscribe({
      next: (updatedVenue) => {
        this.venue = updatedVenue;
        this.loading.venue = false;
        this.modalService.success(`Recinto "${this.venue.name}" desactivado correctamente.`);
      },
      error: (err) => {
        this.error.venue =
          err.error?.message || 'Error al desactivar el recinto';
        this.loading.venue = false;
        this.modalService.error(this.error.venue, 'Error de Desactivación');
      },
    });
  }

  confirmActivate(): void {
    this.modalService.showConfirm({
      title: 'Confirmar Activación',
      message: `¿Estás seguro de que deseas activar el recinto ${this.venue?.name}?`,
      type: 'info',
      confirmText: 'Sí, activar',
      cancelText: 'Cancelar',
      details: [
        'El recinto volverá a aparecer en búsquedas públicas',
        'Se podrán crear nuevos eventos en este recinto'
      ]
    }).subscribe(confirmed => {
      if (confirmed) {
        this.activateVenue();
      }
    });
  }

  activateVenue(): void {
    if (!this.venue) return;

    this.loading.venue = true;
    this.error.venue = '';

    this.venueService.activateVenue(this.venueId).subscribe({
      next: (updatedVenue) => {
        this.venue = updatedVenue;
        this.loading.venue = false;
        this.modalService.success(`Recinto "${this.venue.name}" activado correctamente.`);
      },
      error: (err) => {
        this.error.venue =
          err.error?.message || 'Error al activar el recinto';
        this.loading.venue = false;
        this.modalService.error(this.error.venue, 'Error de Activación');
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
    this.modalService.confirmDeletion(this.venue?.name || 'este recinto', [
      'Esta acción eliminará permanentemente el recinto',
      'Solo funcionará si el recinto no tiene eventos asociados',
      'No se puede deshacer esta operación'
    ]).subscribe(confirmed => {
      if (confirmed) {
        this.deleteCurrentVenue();
      }
    });
  }

  deleteCurrentVenue(): void {
    if (!this.venue) return;

    this.loading.venue = true;
    this.error.venue = '';

    this.venueService.deleteVenue(this.venueId).subscribe({
      next: () => {
        this.loading.venue = false;
        this.modalService.success(`Recinto "${this.venue?.name}" eliminado correctamente.`).subscribe(() => {
          this.router.navigate(['/venues']);
        });
      },
      error: (err) => {
        this.error.venue =
          err.error?.message || 'Error al eliminar el recinto. Es posible que tenga eventos asociados.';
        this.loading.venue = false;
        this.modalService.error(this.error.venue, 'Error de Eliminación');
      },
    });
  }
}
