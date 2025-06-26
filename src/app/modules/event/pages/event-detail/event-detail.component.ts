import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EventService } from '../../services/event.service';
import { EventDTO, EventStatusUpdateDTO, EventVerificationRequest } from '../../models/event';
import { EventStatisticsDTO } from '../../models/event-statistics.dto';
import { ModalService } from '../../../../shared/services/modal.service';
import { StatusFormatter } from '../../../../shared/utils/status-formatter.util';
import { SimpleDropdownDirective } from '../../../../shared/directives/simple-dropdown.directive';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, DecimalPipe, SimpleDropdownDirective],
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
  isAdmin = false; // Changed from hardcoded true to false
  isModerador = false;
  isComprador = false;
  isEventRegistrar = false;
  isVerificadorEntradas = false;
  currentUser: any = null;
  isVerifying = false; // Added for verification loading state
  verificationMessage = ''; // Added for verification feedback
  imageError = false;
  sectionsImageError = false;

  // Use the StatusFormatter for better status handling
  eventStatuses = StatusFormatter.getEventStatuses();

  constructor(
    private route: ActivatedRoute,
    private router: Router, // Para navegación programática si es necesario
    private eventService: EventService,
    private datePipe: DatePipe,
    private elementRef: ElementRef,
    private modalService: ModalService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeUserRole();
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

  private initializeUserRole(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    if (this.currentUser && this.currentUser.role) {
      const userRole = this.currentUser.role.name;
      this.isAdmin = userRole === 'ADMIN';
      this.isModerador = userRole === 'MODERADOR';
      this.isComprador = userRole === 'COMPRADOR';
      this.isEventRegistrar = userRole === 'REGISTRADOR_EVENTO';
      this.isVerificadorEntradas = userRole === 'VERIFICADOR_ENTRADAS';
    }
  }

  loadEventDetails(): void {
    if (!this.eventId) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.imageError = false; // Reset image error flag
    this.sectionsImageError = false; // Reset sections image error flag
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
    return StatusFormatter.formatStatusName(status);
  }

  getStatusClass(status: string | undefined): string {
    return StatusFormatter.getStatusClass(status);
  }

  getStatusIcon(status: string | undefined): string {
    return StatusFormatter.getStatusIcon(status);
  }

  getStatusInfo(status: string | undefined) {
    return StatusFormatter.getStatusInfo(status);
  }

  getAlertClass(status: string | undefined): string {
    switch (status) {
      case 'PROXIMO':
        return 'alert-warning';
      case 'AGOTADO':
        return 'alert-info';
      case 'CANCELADO':
        return 'alert-danger';
      case 'FINALIZADO':
        return 'alert-secondary';
      default:
        return 'alert-info';
    }
  }

  getAlertIcon(status: string | undefined): string {
    switch (status) {
      case 'PROXIMO':
        return 'bi-clock-history';
      case 'AGOTADO':
        return 'bi-exclamation-triangle';
      case 'CANCELADO':
        return 'bi-x-circle';
      case 'FINALIZADO':
        return 'bi-check-circle';
      default:
        return 'bi-info-circle';
    }
  }

  getStatusMessage(status: string | undefined): string {
    switch (status) {
      case 'PROXIMO':
        return 'Este evento está programado pero la venta de entradas aún no ha comenzado. Mantente atento para conocer cuándo estarán disponibles.';
      case 'AGOTADO':
        return 'Lo sentimos, todas las entradas para este evento han sido vendidas. Puedes seguir al artista para recibir notificaciones de futuros eventos.';
      case 'CANCELADO':
        return 'Este evento ha sido cancelado. Si ya compraste entradas, te contactaremos sobre el proceso de reembolso.';
      case 'FINALIZADO':
        return 'Este evento ya ha concluido. ¡Esperamos que hayas disfrutado del show!';
      default:
        return `La venta de entradas para este evento no está activa actualmente (Estado: ${this.formatStatusName(status)}).`;
    }
  }

  getAvailableOccupancyPercentage(): number {
    if (!this.stats || !this.stats.totalTickets || this.stats.totalTickets === 0) {
      return 0;
    }
    const availableTickets = this.stats.totalTickets - this.stats.soldTickets;
    const percentage = (availableTickets / this.stats.totalTickets) * 100;
    return Math.round(percentage * 100) / 100; // Round to 2 decimal places
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
    this.modalService.confirmDeletion(eventName, [
      'Esta acción eliminará permanentemente todos los datos del evento',
      'Se perderán todas las transacciones y tickets asociados',
      'No se puede deshacer esta operación'
    ]).subscribe(confirmed => {
      if (confirmed) {
        this.isLoading = true;
        this.errorMessage = '';
        this.eventService.deleteEvent(this.event!.id).subscribe({
          next: () => {
            this.isLoading = false;
            this.modalService.success(`Evento "${eventName}" eliminado correctamente.`).subscribe(() => {
              this.router.navigate(['/events']);
            });
          },
          error: (err) => {
            this.isLoading = false;
            this.errorMessage = `Error al eliminar el evento: ${err.error?.message || err.message}`;
            console.error('Error deleting event:', err);
          }
        });
      }
    });
  }

  promptChangeStatus(): void {
    if (!this.event || !this.event.id) return;

    const availableStatuses = this.eventStatuses.map(s => `${s.value} (${s.viewValue})`).join('\n');
    
    this.modalService.showPrompt({
      title: 'Cambiar Estado del Evento',
      message: `Evento: ${this.event.name}\nEstado actual: ${this.event.statusName}\n\nIngrese el nuevo estado:`,
      placeholder: 'Ej: EN_VENTA, CANCELADO, etc.',
      confirmText: 'Cambiar Estado',
      cancelText: 'Cancelar'
    }).subscribe(result => {
      if (result.confirmed && result.value) {
        const newStatus = result.value.toUpperCase();
        if (this.eventStatuses.some(s => s.value === newStatus)) {
          // Ask for notes
          this.modalService.showPrompt({
            title: 'Notas del Cambio',
            message: 'Notas adicionales para el cambio de estado (opcional):',
            placeholder: 'Descripción del motivo del cambio...',
            confirmText: 'Confirmar Cambio',
            cancelText: 'Cancelar',
            required: false,
            inputType: 'textarea'
          }).subscribe(notesResult => {
            if (notesResult.confirmed) {
              const statusData: EventStatusUpdateDTO = {
                statusName: newStatus,
                statusChangeNotes: notesResult.value || undefined
              };

              this.isLoading = true;
              this.eventService.updateEventStatus(this.event!.id, statusData).subscribe({
                next: (updatedEvent) => {
                  this.event = updatedEvent;
                  this.isLoading = false;
                  this.modalService.success('Estado del evento actualizado correctamente.');
                },
                error: (err) => {
                  this.isLoading = false;
                  this.errorMessage = `Error al actualizar el estado: ${err.error?.message || err.message}`;
                  console.error('Error updating event status:', err);
                }
              });
            }
          });
        } else {
          this.modalService.error('Estado ingresado no válido.', 'Error de Validación');
        }
      }
    });
  }

  confirmVerifyEvent(): void {
    if (!this.event || !this.event.id) {
      this.errorMessage = 'No se pueden cargar los datos del evento para verificarlo.';
      return;
    }
    if (this.event.verified) {
      this.modalService.info('Este evento ya ha sido verificado.', 'Evento Verificado');
      return;
    }

    const eventName = this.event.name;
    const verificationRequestData: EventVerificationRequest = {
      moderatorId: 4, // Hardcoded as requested
      verificationNotes: 'Evento verificado desde el frontend.',
      updateStatus: true,
      newStatus: 'EN_VENTA'
    };

    this.modalService.showConfirm({
      title: 'Verificar Evento',
      message: `¿Estás seguro de que deseas VERIFICAR el evento "${eventName}" y cambiar su estado a EN VENTA?`,
      type: 'warning',
      confirmText: 'Sí, verificar',
      cancelText: 'Cancelar',
      details: [
        'El evento será marcado como verificado',
        'Su estado cambiará automáticamente a EN_VENTA',
        'Esta acción registrará al moderador en el historial'
      ]
    }).subscribe(confirmed => {
      if (confirmed) {
        this.isVerifying = true;
        this.verificationMessage = '';
        this.errorMessage = '';

        this.eventService.verifyEvent(this.event!.id, verificationRequestData).subscribe({
          next: (updatedEvent) => {
            this.event = updatedEvent;
            this.isVerifying = false;
            this.verificationMessage = `Evento "${eventName}" verificado y actualizado correctamente.`;
            this.modalService.success(this.verificationMessage, 'Verificación Exitosa');
          },
          error: (err) => {
            this.isVerifying = false;
            const detailError = err.error?.message || err.message;
            this.verificationMessage = `Error al verificar el evento: ${detailError}`;
            console.error('Error verifying event:', err);
            this.modalService.error(this.verificationMessage, 'Error de Verificación');
          }
        });
      }
    });
  }

  onImageError(event: any): void {
    const imgElement = event.target as HTMLImageElement;
    console.log('🖼️ [DEBUG] Event flyer image failed to load:', {
      src: imgElement?.src,
      error: event,
      eventName: this.event?.name
    });
    console.log('🖼️ [DEBUG] Setting imageError to true, placeholder will show');
    this.imageError = true;
  }

  onSectionsImageError(event: any): void {
    this.sectionsImageError = true;
  }

  /**
   * Check if the current user owns this event
   */
  isEventOwner(): boolean {
    console.log('🔍 [DEBUG] isEventOwner check:', {
      hasEvent: !!this.event,
      hasCurrentUser: !!this.currentUser,
      isEventRegistrar: this.isEventRegistrar,
      eventRegistrarId: this.event?.registrarId,
      currentUserId: this.currentUser?.id,
      eventRegistrarIdType: typeof this.event?.registrarId,
      currentUserIdType: typeof this.currentUser?.id
    });
    
    if (!this.event || !this.currentUser || !this.isEventRegistrar) {
      console.log('🔍 [DEBUG] isEventOwner: early return false - missing basic requirements');
      return false;
    }
    
    const result = Number(this.event.registrarId) === Number(this.currentUser.id);
    console.log('🔍 [DEBUG] isEventOwner result:', result);
    return result;
  }

  /**
   * Check if admin actions should be visible
   */
  shouldShowAdminActions(): boolean {
    const isAdminOrModerador = this.isAdmin || this.isModerador;
    const isOwner = this.isEventOwner();
    const isNotComprador = !this.isComprador;
    
    const result = (isAdminOrModerador || isOwner) && isNotComprador;
    
    console.log('🔍 [DEBUG] shouldShowAdminActions check:', {
      isAdmin: this.isAdmin,
      isModerador: this.isModerador,
      isEventRegistrar: this.isEventRegistrar,
      isComprador: this.isComprador,
      isAdminOrModerador,
      isOwner,
      isNotComprador,
      result
    });
    
    return result;
  }

  // TODO: Implementar lógica de navegación para ver detalles de Venue y Artist si es necesario
  // navigateToVenue(venueId: number): void {
  //   this.router.navigate(['/venues', venueId]);
  // }
  // navigateToArtist(artistId: number): void {
  //   this.router.navigate(['/artists', artistId]);
  // }
}
