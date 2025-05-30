import { Component, OnInit, AfterViewInit, ElementRef, HostListener } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EventService } from '../../services/event.service';
import { EventDTO, EventStatusUpdateDTO, EventVerificationRequest } from '../../models/event';
import { EventStatisticsDTO } from '../../models/event-statistics.dto';
// Podríamos necesitar importar Venue y Artist si queremos enlazar a sus detalles o mostrar más info
// import { VenueService } from '../../../venue/services/venue.service';
// import { ArtistService } from '../../../artist/services/artist.service';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, DecimalPipe],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss'],
  providers: [DatePipe, DecimalPipe]
})
export class EventDetailComponent implements OnInit, AfterViewInit {
  eventId: number | null = null;
  event: EventDTO | null = null;
  stats: EventStatisticsDTO | null = null;
  isLoading = true;
  isLoadingStats = false;
  errorMessage = '';
  isAdmin = true; // Placeholder: Implementar lógica de roles/permisos real
  isVerifying = false; // Added for verification loading state
  verificationMessage = ''; // Added for verification feedback
  dropdownOpen = false; // Control dropdown visibility manually
  eventStatuses: { value: string; viewValue: string }[] = [
    { value: 'PROXIMO', viewValue: 'Próximo' },
    { value: 'EN_VENTA', viewValue: 'En Venta' },
    { value: 'AGOTADO', viewValue: 'Agotado' },
    { value: 'CANCELADO', viewValue: 'Cancelado' },
    { value: 'FINALIZADO', viewValue: 'Finalizado' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router, // Para navegación programática si es necesario
    private eventService: EventService,
    private datePipe: DatePipe,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.eventId = Number(idParam);
        if (!isNaN(this.eventId)) {
          this.loadEventDetails();
        } else {
          this.isLoading = false;
          this.errorMessage = 'El ID del evento en la URL no es válido.';
          console.error('Invalid Event ID in URL:', idParam);
        }
      } else {
        this.isLoading = false;
        this.errorMessage = 'No se especificó un ID de evento en la URL.';
        console.error('No Event ID in URL');
      }
    });
  }

  ngAfterViewInit(): void {
    // Add any necessary after view init logic here
  }

  // Dropdown control methods
  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown(): void {
    this.dropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const dropdown = this.elementRef.nativeElement.querySelector('.dropdown');
    
    if (dropdown && !dropdown.contains(target)) {
      this.closeDropdown();
    }
  }

  loadEventDetails(): void {
    if (!this.eventId) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.eventService.getEventById(this.eventId).subscribe({
      next: (eventData) => {
        this.event = eventData;
        this.isLoading = false;
        this.loadEventStatistics();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = `Error al cargar el evento: ${err.error?.message || err.message}`;
        console.error('Error fetching event details:', err);
        if (err.status === 404) {
            this.errorMessage = 'Evento no encontrado.';
        }
      }
    });
  }

  loadEventStatistics(): void {
    if (!this.eventId) return;

    this.isLoadingStats = true;
    this.eventService.getEventStatistics(this.eventId).subscribe({
      next: (statsData) => {
        this.stats = statsData;
        this.isLoadingStats = false;
      },
      error: (err) => {
        this.isLoadingStats = false;
        console.error('Error loading event statistics:', err);
      }
    });
  }

  formatFullDate(dateInput: string | Date | undefined): string {
    if (!dateInput) return 'No disponible';
    try {
      const dateObj = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      if (isNaN(dateObj.getTime())) {
          console.error('Invalid date value after new Date():', dateInput);
          return 'Fecha (formato original inválido)';
      }
      const datePart = this.datePipe.transform(dateObj, 'fullDate', '', 'es-AR');
      const timePart = this.datePipe.transform(dateObj, 'HH:mm', '', 'es-AR');
      if (!datePart || !timePart) {
          console.error('DatePipe transform failed. Original:', dateInput, 'DateObj:', dateObj);
          return 'Fecha (pipe transform error)';
      }
      return `${datePart} a las ${timePart} hs.`;
    } catch (error) {
      console.error('Error formatting date:', dateInput, error);
      return 'Fecha inválida (excepción)';
    }
  }

  formatStatusName(status: string | undefined): string {
    if (!status) return 'N/A';
    return status.replace(/_/g, ' ');
  }

  navigateToVenue(venueId: number | undefined): void {
    if (venueId) {
      this.router.navigate(['/venues', venueId]);
    } else {
      console.warn('Venue ID is undefined. Cannot navigate.');
    }
  }

  navigateToArtist(artistId: number | undefined): void {
    if (artistId) {
      this.router.navigate(['/artists', artistId]);
    } else {
      console.warn('Artist ID is undefined. Cannot navigate.');
    }
  }

  confirmDeleteEvent(): void {
    if (!this.event || !this.event.id) {
      this.errorMessage = 'No se puede eliminar el evento porque no se han cargado sus datos correctamente.';
      return;
    }

    const eventName = this.event.name;
    if (confirm(`¿Estás ABSOLUTAMENTE SEGURO de que deseas ELIMINAR PERMANENTEMENTE el evento "${eventName}"? Esta acción no se puede deshacer.`)) {
      this.isLoading = true;
      this.errorMessage = '';
      this.eventService.deleteEvent(this.event.id).subscribe({
        next: () => {
          this.isLoading = false;
          alert(`Evento "${eventName}" eliminado correctamente.`); // Podríamos usar un servicio de notificaciones más elegante
          this.router.navigate(['/events']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = `Error al eliminar el evento: ${err.error?.message || err.message}`;
          console.error('Error deleting event:', err);
        }
      });
    }
  }

  promptChangeStatus(): void {
    if (!this.event || !this.event.id) return;

    const availableStatuses = this.eventStatuses.map(s => `${s.value} (${s.viewValue})`).join('\n');
    const newStatus = prompt(`Evento: ${this.event.name}\nEstado actual: ${this.event.statusName}\n\nIngrese el nuevo estado (ej. EN_VENTA, CANCELADO, etc.):\n${availableStatuses}`);
    
    if (newStatus && this.eventStatuses.some(s => s.value === newStatus.toUpperCase())) {
      const notes = prompt('Notas adicionales para el cambio de estado (opcional):');
      const statusData: EventStatusUpdateDTO = {
        statusName: newStatus.toUpperCase(),
        statusChangeNotes: notes || undefined
      };

      this.isLoading = true;
      this.eventService.updateEventStatus(this.event.id, statusData).subscribe({
        next: (updatedEvent) => {
          this.event = updatedEvent; // Actualizar el evento local
          this.isLoading = false;
          alert('Estado del evento actualizado correctamente.');
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = `Error al actualizar el estado: ${err.error?.message || err.message}`;
          console.error('Error updating event status:', err);
        }
      });
    } else if (newStatus !== null) { // Si el usuario ingresó algo pero no es válido
      alert('Estado ingresado no válido.');
    }
  }

  confirmVerifyEvent(): void {
    if (!this.event || !this.event.id) {
      this.errorMessage = 'No se pueden cargar los datos del evento para verificarlo.';
      return;
    }
    if (this.event.verified) {
      this.verificationMessage = 'Este evento ya ha sido verificado.';
      return;
    }

    const eventName = this.event.name;
    const verificationRequestData: EventVerificationRequest = {
      moderatorId: 4, // Hardcoded as requested, originally from curl example moderatorId: 2
      verificationNotes: 'Evento verificado desde el frontend.', // Default notes
      updateStatus: true, // As per curl example
      newStatus: 'EN_VENTA' // As per curl example, ensure this is a valid status
    };

    if (confirm(`¿Estás seguro de que deseas VERIFICAR el evento "${eventName}" y cambiar su estado a EN VENTA?`)) {
      this.isVerifying = true;
      this.verificationMessage = '';
      this.errorMessage = '';

      this.eventService.verifyEvent(this.event.id, verificationRequestData).subscribe({
        next: (updatedEvent) => {
          this.event = updatedEvent;
          this.isVerifying = false;
          this.verificationMessage = `Evento "${eventName}" verificado y actualizado correctamente.`;
          alert(this.verificationMessage);
        },
        error: (err) => {
          this.isVerifying = false;
          const detailError = err.error?.message || err.message;
          this.verificationMessage = `Error al verificar el evento: ${detailError}`;
          console.error('Error verifying event:', err);
          alert(this.verificationMessage); // For immediate feedback on error
        }
      });
    }
  }

  // TODO: Implementar lógica de navegación para ver detalles de Venue y Artist si es necesario
  // navigateToVenue(venueId: number): void {
  //   this.router.navigate(['/venues', venueId]);
  // }
  // navigateToArtist(artistId: number): void {
  //   this.router.navigate(['/artists', artistId]);
  // }
}
