import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { VenueService } from '../../services/venue.service';
import { Venue } from '../../models/venue';
import { RouterModule } from '@angular/router';
// Importar VenueCardComponent si decidimos usarlo y es standalone
// import { VenueCardComponent } from '../../components/venue-card/venue-card.component';

@Component({
  selector: 'app-venue-availability-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    // VenueCardComponent,
  ],
  templateUrl: './venue-availability-search.component.html',
  styleUrls: ['./venue-availability-search.component.scss'],
})
export class VenueAvailabilitySearchComponent implements OnInit {
  availabilityForm!: FormGroup;
  availableVenues: Venue[] = [];
  isLoading = false;
  submitted = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private venueService: VenueService
  ) {}

  ngOnInit(): void {
    this.availabilityForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
    }, { validators: this.dateRangeValidator });
  }

  dateRangeValidator(group: FormGroup): { [key: string]: boolean } | null {
    const startDate = group.get('startDate')?.value;
    const endDate = group.get('endDate')?.value;
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return { 'dateRangeInvalid': true };
    }
    return null;
  }

  get f() {
    return this.availabilityForm.controls;
  }

  onSearch(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.availableVenues = [];

    if (this.availabilityForm.invalid) {
      if (this.availabilityForm.errors?.['dateRangeInvalid']) {
        this.errorMessage = 'La fecha de inicio no puede ser posterior a la fecha de fin.';
      }
      return;
    }

    this.isLoading = true;
    const { startDate, endDate } = this.availabilityForm.value;

    this.venueService.getAvailableVenues(new Date(startDate), new Date(endDate))
      .subscribe({
        next: (venues) => {
          this.availableVenues = venues;
          this.isLoading = false;
          if (venues.length === 0) {
            this.errorMessage = 'No se encontraron recintos disponibles para las fechas seleccionadas.';
          }
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Error al buscar recintos disponibles.';
          this.isLoading = false;
        },
      });
  }
} 