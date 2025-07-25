import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { VenueService } from '../../services/venue.service';
import { Venue } from '../../models/venue';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ListFiltersComponent } from '../../../../shared/components/list-filters/list-filters.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-venue-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    HttpClientModule,
    PageHeaderComponent,
    ListFiltersComponent,
    PaginationComponent
  ],
  templateUrl: './venue-list.component.html',
  styleUrls: ['./venue-list.component.scss'],
})
export class VenueListComponent implements OnInit {
  venues: Venue[] = [];
  filteredVenues: Venue[] = [];
  searchTerm: string = '';
  loading = false;
  error = '';
  showInactive = false;
  isAdmin = true; // En una implementación real, esto vendría de un servicio de autenticación
  isModerador = false;
  isComprador = false;
  isEventRegistrar = false;
  currentUser: any = null;
  imageErrors = new Map<number, boolean>(); // Track image errors by venue ID

  // Exponer Math para el template
  Math = Math;

  // Pagination - Actualizado para usar paginación del backend
  currentPage: number = 0; // Cambiar a 0-based para coincidir con backend
  itemsPerPage: number = 12;
  totalItems: number = 0;
  totalPages: number = 0;

  // Filter form
  filterForm: FormGroup;

  constructor(
    private venueService: VenueService,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.filterForm = this.formBuilder.group({
      search: [''],
      venueCapacityMin: [''],
      venueCapacityMax: [''],
      venueLocation: ['']
    });
  }

  ngOnInit(): void {
    this.initializeUserRole();
    this.loadVenues();
    this.setupFilterSubscription();
  }

  private initializeUserRole(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser && this.currentUser.role) {
      const userRole = this.currentUser.role.name;
      this.isAdmin = userRole === 'ADMIN';
      this.isModerador = userRole === 'MODERADOR';
      this.isComprador = userRole === 'COMPRADOR';
      this.isEventRegistrar = userRole === 'REGISTRADOR_EVENTO';
    }
  }

  private setupFilterSubscription(): void {
    // Implementation of setupFilterSubscription method
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilter();
    });
  }

  loadVenues(): void {
    this.loading = true;
    this.error = '';
    
    // Usar el nuevo método paginado
    this.venueService.getVenuesPaginated(
      this.currentPage, 
      this.itemsPerPage, 
      this.searchTerm || undefined,
      !this.showInactive // activeOnly
    ).subscribe({
      next: (response) => {
        this.venues = response.content;
        this.totalItems = response.totalElements;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading venues:', error);
        this.error = 'Error al cargar los recintos';
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    // Reset to first page when filtering
    this.currentPage = 0;
    this.loadVenues();
  }

  onPageChange(page: number): void {
    this.currentPage = page - 1; // Convertir de 1-based a 0-based
    this.loadVenues();
  }

  onPageSizeChange(size: number): void {
    this.itemsPerPage = size;
    this.currentPage = 0; // Reset to first page
    this.loadVenues();
  }

  onActiveFilterChange(): void {
    this.currentPage = 0; // Reset to first page
    this.loadVenues();
  }

  onSearchChange(): void {
    // Debounce search - could implement later
    this.applyFilter();
  }

  onImageError(venueId: number): void {
    this.imageErrors.set(venueId, true);
  }

  hasImageError(venueId: number): boolean {
    return this.imageErrors.get(venueId) || false;
  }

  // Método helper para el componente de paginación
  get displayCurrentPage(): number {
    return this.currentPage + 1; // Convertir de 0-based a 1-based para display
  }
}
