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
  imageErrors = new Map<number, boolean>(); // Track image errors by venue ID

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 12;
  totalItems: number = 0;

  constructor(private venueService: VenueService) {}

  ngOnInit(): void {
    this.loadVenues();
  }

  loadVenues(): void {
    this.loading = true;
    this.error = '';

    this.venueService.getAllVenues(!this.showInactive).subscribe({
      next: (venues) => {
        this.venues = venues;
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al cargar los recintos';
        this.loading = false;
      },
    });
  }

  applyFilter(): void {
    let filtered: Venue[];
    
    if (!this.searchTerm.trim()) {
      filtered = [...this.venues];
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = this.venues.filter(
        (venue) =>
          venue.name.toLowerCase().includes(term) ||
          venue.address.toLowerCase().includes(term)
      );
    }
    
    this.totalItems = filtered.length;
    this.filteredVenues = this.getPaginatedVenues(filtered);
  }

  getPaginatedVenues(sourceVenues: Venue[]): Venue[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return sourceVenues.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.applyFilter();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilter();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.applyFilter();
  }

  toggleShowInactive(): void {
    this.loadVenues();
  }

  formatCapacity(capacity: number | undefined): string {
    if (!capacity) return 'No especificada';
    return capacity.toLocaleString('es-AR');
  }

  onImageError(venue: Venue): void {
    if (venue.id !== undefined) {
      this.imageErrors.set(venue.id, true);
    }
  }

  hasImageError(venue: Venue): boolean {
    return venue.id !== undefined ? (this.imageErrors.get(venue.id) || false) : false;
  }
}
