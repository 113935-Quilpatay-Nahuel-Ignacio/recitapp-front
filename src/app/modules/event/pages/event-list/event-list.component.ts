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
import { AuthService } from '../../../../core/services/auth.service';

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
  providers: [DatePipe]
})
export class EventListComponent implements OnInit {
  filterForm!: FormGroup;
  eventStatuses = StatusFormatter.getEventStatuses();
  events: EventDTO[] = [];
  allEvents: EventDTO[] = [];
  venues: Venue[] = [];
  artists: Artist[] = [];

  isLoading = false;
  errorMessage = '';

  // Paginación del lado del cliente
  currentPage = 1;
  itemsPerPage = 9;

  // Exponer Math para el template
  Math = Math;

  // Expose Number function to template
  Number = Number;

  // User role management
  isAdmin = false;
  isModerador = false;
  isComprador = false;
  isEventRegistrar = false;
  isVerificadorEntradas = false;
  currentUser: any = null;

  // Admin cleanup related properties
  cleanupCutoffDate: string = '';
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
    @Inject(PLATFORM_ID) private platformId: Object,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeUserRole();
    this.initFilterForm();
    
    if (isPlatformBrowser(this.platformId)) {
      this.loadFilterData();
      this.loadEvents();
    }

    this.setupFilterSubscription();
  }

  private initFilterForm(): void {
    this.filterForm = this.fb.group({
      startDate: [null],
      endDate: [null],
      venueId: [null],
      artistId: [null],
      statusName: [null]
    });
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
      complete: () => this.isLoading = false
    });
  }

  loadEvents(): void {
    this.isLoading = true;
    this.errorMessage = '';

    let verificationFilter: boolean | undefined = undefined;
    
    if (!this.isAdmin && !this.isModerador && !this.isEventRegistrar) {
      verificationFilter = true;
    }

    const filters: any = {
      ...this.filterForm.value,
      verified: verificationFilter
    };

    Object.keys(filters).forEach(key => {
      if (filters[key] === null || filters[key] === '' || filters[key] === undefined) {
        delete filters[key];
      }
    });

    this.eventService.searchEvents(filters).subscribe({
      next: (events) => {
        this.allEvents = events;
        this.events = this.getPaginatedEvents(this.allEvents);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.errorMessage = 'Error al cargar los eventos. Por favor, inténtalo de nuevo.';
        this.isLoading = false;
      }
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
    const currentDay = today.getDay();
    const firstDayOfWeek = new Date(today);
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
    this.currentPage = 1;
    this.events = this.getPaginatedEvents(this.allEvents);
  }

  formatEventDate(date: string | Date | undefined): string {
    if (!date) return 'N/A';
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

      const formattedDate = `${this.cleanupCutoffDate}T00:00:00`;

      this.eventService.cleanupCanceledEvents(formattedDate).subscribe({
        next: (response) => {
          this.isCleaningUp = false;
          this.cleanupSuccessMessage = response?.message || 'Eventos cancelados eliminados correctamente.';
          this.modalService.success(this.cleanupSuccessMessage, 'Limpieza Completada').subscribe(() => {
            this.loadEvents();
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

  private setupFilterSubscription(): void {
    // Listen to form changes and optionally auto-apply filters
    // this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }

  /**
   * Check if the current user owns a specific event
   */
  isEventOwner(event: EventDTO): boolean {
    if (!this.currentUser || !this.isEventRegistrar || !event.registrarId) {
      return false;
    }
    return Number(event.registrarId) === Number(this.currentUser.id);
  }
}
