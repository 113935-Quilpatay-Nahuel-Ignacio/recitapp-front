import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { VenueService } from '../../services/venue.service';
import { Venue } from '../../models/venue';

@Component({
  selector: 'app-venue-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HttpClientModule],
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
    if (!this.searchTerm.trim()) {
      this.filteredVenues = [...this.venues];
      return;
    }

    const term = this.searchTerm.toLowerCase().trim();
    this.filteredVenues = this.venues.filter(
      (venue) =>
        venue.name.toLowerCase().includes(term) ||
        venue.address.toLowerCase().includes(term)
    );
  }

  onSearch(): void {
    this.applyFilter();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilter();
  }

  toggleShowInactive(): void {
    this.loadVenues();
  }

  formatCapacity(capacity: number | undefined): string {
    if (!capacity) return 'No especificada';
    return capacity.toLocaleString('es-AR');
  }
}
