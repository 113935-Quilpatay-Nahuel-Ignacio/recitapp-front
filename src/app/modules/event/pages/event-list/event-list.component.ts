import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EventService } from '../../services/event.service';
import { EventDTO, EventSearchFilters } from '../../models/event';
import { Venue } from '../../../venue/models/venue';
import { VenueService } from '../../../venue/services/venue.service';
import { Artist } from '../../../artist/models/artist';
import { ArtistService } from '../../../artist/services/artist.service';
import { ModalService } from '../../../../shared/services/modal.service';
import { StatusFormatter } from '../../../../shared/utils/status-formatter.util';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ListFiltersComponent } from '../../../../shared/components/list-filters/list-filters.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule, 
    FormsModule,
    PageHeaderComponent,
    ListFiltersComponent,
    PaginationComponent
  ],
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss'],
  providers: [DatePipe] // Proveer DatePipe para formatear fechas en el template si es necesario
})
export class EventListComponent implements OnInit {
  filterForm!: FormGroup;
  eventStatuses = StatusFormatter.getEventStatuses();
  events: EventDTO[] = [];
  allEvents: EventDTO[] = []; // Para paginación del lado del cliente
  venues: Venue[] = [];
  artists: Artist[] = [];

  isLoading = false;
  errorMessage = '';

  // Paginación del lado del cliente
  currentPage = 1;
  itemsPerPage = 9; // Layout 3x3

  // Exponer Math para el template
  Math = Math;

  // Admin and Cleanup related properties
  isAdmin = true; // Placeholder for real role management
  cleanupCutoffDate: string = ''; // For ngModel binding
  isCleaningUp = false;
  cleanupSuccessMessage = '';
  cleanupErrorMessage = '';

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private venueService: VenueService,
    private artistService: ArtistService,
    private datePipe: DatePipe,
    private modalService: ModalService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.initFilterForm();
    
    // Only load data if running in browser (not during server-side rendering)
    if (isPlatformBrowser(this.platformId)) {
      this.loadFilterData();
      this.loadEvents(); // Carga inicial de todos los eventos (o según filtros por defecto)
    }
  }

  private initFilterForm(): void {
    this.filterForm = this.fb.group({
      startDate: [null], // Campo para fecha de inicio del rango
      endDate: [null],   // Campo para fecha de fin del rango
      venueId: [null],
      artistId: [null],
      statusName: [null], // Nuevo campo para el estado del evento
      // name: [null] // Opcional: para búsqueda por nombre de evento
    });

    // Recargar eventos cuando cambien los filtros (opcional, si no se usa botón "Aplicar")
    // this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }

  loadFilterData(): void {
    this.isLoading = true;
    this.venueService.getAllVenues(true).subscribe({
      next: (venues) => (this.venues = venues),
      error: (err) => {
        console.error('Error loading venues:', err);
        this.errorMessage = 'Error al cargar recintos para filtros.';
      },
    });

    this.artistService.getAllArtists(true).subscribe({
      next: (artists) => (this.artists = artists),
      error: (err) => {
        console.error('Error loading artists:', err);
        this.errorMessage = 'Error al cargar artistas para filtros.';
      },
      complete: () => this.isLoading = false // Solo al final de ambas cargas si fueran secuenciales
    });
  }

  loadEvents(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.currentPage = 1; // Resetear a la primera página con cada nueva carga/filtro

    const formValues = this.filterForm.value;
    const filters: EventSearchFilters = {
      startDate: formValues.startDate ? this.datePipe.transform(formValues.startDate, 'yyyy-MM-ddT00:00:00') || undefined : undefined,
      endDate: formValues.endDate ? this.datePipe.transform(formValues.endDate, 'yyyy-MM-ddT23:59:59') || undefined : undefined,
      venueId: formValues.venueId || undefined,
      artistId: formValues.artistId || undefined,
      statusName: formValues.statusName || undefined,
    };

    // Remover propiedades undefined para no enviarlas en los params
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof EventSearchFilters] === undefined || filters[key as keyof EventSearchFilters] === null) {
        delete filters[key as keyof EventSearchFilters];
      }
    });

    this.eventService.searchEvents(filters).subscribe({
      next: (events) => {
        this.allEvents = events;
        this.events = this.getPaginatedEvents(this.allEvents);
        this.isLoading = false;
        if (events.length === 0) {
          this.errorMessage = 'No se encontraron eventos con los filtros aplicados.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Error al cargar eventos. ' + (err.error?.message || '');
        console.error('Error loading events:', err);
        this.allEvents = [];
        this.events = [];
      },
    });
  }

  applyFilters(): void {
    this.loadEvents();
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.loadEvents();
  }

  filterToday(): void {
    const today = new Date();
    this.filterForm.patchValue({
      startDate: this.datePipe.transform(today, 'yyyy-MM-dd'),
      endDate: this.datePipe.transform(today, 'yyyy-MM-dd'),
    });
    this.applyFilters();
  }

  filterThisWeek(): void {
    const today = new Date();
    const currentDay = today.getDay(); // 0 (Domingo) - 6 (Sábado)
    const firstDayOfWeek = new Date(today); // Clonar para no modificar 'today'
    // Ajustar al Lunes de esta semana (si Domingo es 0, Lunes es 1)
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    firstDayOfWeek.setDate(today.getDate() + diffToMonday);

    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);

    this.filterForm.patchValue({
      startDate: this.datePipe.transform(firstDayOfWeek, 'yyyy-MM-dd'),
      endDate: this.datePipe.transform(lastDayOfWeek, 'yyyy-MM-dd'),
    });
    this.applyFilters();
  }

  filterThisMonth(): void {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.filterForm.patchValue({
      startDate: this.datePipe.transform(firstDayOfMonth, 'yyyy-MM-dd'),
      endDate: this.datePipe.transform(lastDayOfMonth, 'yyyy-MM-dd'),
    });
    this.applyFilters();
  }

  // --- Paginación --- 
  getPaginatedEvents(sourceEvents: EventDTO[]): EventDTO[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return sourceEvents.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.allEvents.length / this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.events = this.getPaginatedEvents(this.allEvents);
    }
  }

  onPageSizeChange(size: number): void {
    this.itemsPerPage = size;
    this.currentPage = 1; // Reset to first page
    this.events = this.getPaginatedEvents(this.allEvents);
  }

  // Helper para formatear fechas en el template (si no se usa DatePipe directamente en HTML)
  formatEventDate(date: string | Date | undefined): string {
    if (!date) return 'N/A';
    // Using toISOString().split('T')[0] for yyyy-MM-dd format, robust for Date or string
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
        return 'Fecha Inválida';
    }
    return this.datePipe.transform(dateObj, 'dd/MM/yyyy') || 'N/A';
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

  confirmCleanupCanceledEvents(): void {
    if (!this.cleanupCutoffDate) {
      this.cleanupErrorMessage = 'Por favor, selecciona una fecha de corte.';
      this.cleanupSuccessMessage = '';
      return;
    }

    this.modalService.showConfirm({
      title: 'Confirmar Limpieza de Eventos',
      message: `¿Estás seguro de que deseas eliminar PERMANENTEMENTE todos los eventos CANCELADOS antes del ${this.cleanupCutoffDate}? Esta acción no se puede deshacer.`,
      type: 'danger',
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      details: [
        'Se eliminarán permanentemente todos los eventos cancelados',
        'Esta acción no se puede deshacer',
        'Los datos se perderán para siempre'
      ]
    }).subscribe(confirmed => {
      if (!confirmed) {
        return;
      }

      this.isCleaningUp = true;
      this.cleanupErrorMessage = '';
      this.cleanupSuccessMessage = '';

      // The input type="date" should provide it in this format.
      const formattedDate = `${this.cleanupCutoffDate}T00:00:00`; // Append time for LocalDateTime

      this.eventService.cleanupCanceledEvents(formattedDate).subscribe({
        next: (response) => {
          this.isCleaningUp = false;
          // Assuming response might contain details like how many events were deleted.
          // For now, a generic success message.
          this.cleanupSuccessMessage = response?.message || 'Eventos cancelados eliminados correctamente.';
          this.modalService.success(this.cleanupSuccessMessage, 'Limpieza Completada').subscribe(() => {
            this.loadEvents(); // Refresh the list of events
          });
        },
        error: (err) => {
          this.isCleaningUp = false;
          this.cleanupErrorMessage = `Error al eliminar eventos cancelados: ${err.error?.message || err.message}`;
          console.error('Error cleaning up canceled events:', err);
          this.modalService.error(this.cleanupErrorMessage, 'Error de Limpieza');
        }
      });
    });
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.style.display = 'none';
      const placeholder = img.nextElementSibling as HTMLElement;
      if (placeholder && placeholder.classList.contains('event-image-placeholder')) {
        placeholder.style.display = 'flex';
      }
    }
  }
}
