import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  AbstractControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { VenueService } from '../../services/venue.service';
import { Venue, VenueSection } from '../../models/venue';

@Component({
  selector: 'app-venue-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './venue-form.component.html',
  styleUrls: ['./venue-form.component.scss'],
})
export class VenueFormComponent implements OnInit {
  venueForm!: FormGroup;
  isEditMode = false;
  venueId: number | null = null;
  loading = false;
  submitted = false;
  success = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private venueService: VenueService
  ) {}

  ngOnInit(): void {
    this.initForm();

    // Check if we're in edit mode by looking for an ID parameter
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.venueId = +id;
        this.isEditMode = true;
        this.loadVenue(this.venueId);
      }
    });
  }

  initForm(): void {
    this.venueForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      address: ['', [Validators.required]],
      googleMapsUrl: [''],
      latitude: [null],
      longitude: [null],
      totalCapacity: [null, [Validators.min(1)]],
      description: [''],
      instagramUrl: [''],
      webUrl: [''],
      image: [''],
      active: [true],
      sections: this.fb.array([]),
    });

    // Add at least one section by default
    this.addSection();
  }

  loadVenue(id: number): void {
    this.loading = true;
    this.venueService.getVenueById(id).subscribe({
      next: (venue) => {
        // Clear existing sections
        while (this.sections.length) {
          this.sections.removeAt(0);
        }

        // Update form values
        this.venueForm.patchValue({
          name: venue.name,
          address: venue.address,
          googleMapsUrl: venue.googleMapsUrl,
          latitude: venue.latitude,
          longitude: venue.longitude,
          totalCapacity: venue.totalCapacity,
          description: venue.description,
          instagramUrl: venue.instagramUrl,
          webUrl: venue.webUrl,
          image: venue.image,
          active: venue.active,
        });

        // Add sections if available
        if (venue.sections && venue.sections.length > 0) {
          venue.sections.forEach((section) => {
            this.addSection(section);
          });
        } else {
          this.addSection();
        }

        this.loading = false;
      },
      error: (err) => {
        this.error =
          err.error?.message || 'Error al cargar los datos del recinto';
        this.loading = false;
      },
    });
  }

  // Convenience getter for form fields
  get f(): { [key: string]: AbstractControl } {
    return this.venueForm.controls;
  }

  // Convenience getter for sections as FormArray
  get sections(): FormArray {
    return this.venueForm.get('sections') as FormArray;
  }

  addSection(section?: VenueSection): void {
    const sectionForm = this.fb.group({
      id: [section?.id || null],
      name: [section?.name || '', [Validators.required]],
      capacity: [
        section?.capacity || null,
        [Validators.required, Validators.min(1)],
      ],
      description: [section?.description || ''],
      basePrice: [section?.basePrice || null, [Validators.min(0)]],
      active: [section?.active !== undefined ? section.active : true],
      // Only add venueId if we're in edit mode and the section already has a venueId
      ...(section?.venueId ? { venueId: [section.venueId] } : {}),
    });

    this.sections.push(sectionForm);
  }

  removeSection(index: number): void {
    this.sections.removeAt(index);
  }

  // Helper method to get a specific control from a section form group
  getSectionControl(
    section: AbstractControl,
    controlName: string
  ): AbstractControl | null {
    return (section as FormGroup).get(controlName);
  }

  // Helper method to check if a control has a specific error
  hasError(control: AbstractControl | null, errorName: string): boolean {
    if (!control) return false;
    return control.errors !== null && control.errors[errorName] !== undefined;
  }

  validateCoordinates(): void {
    const lat = this.venueForm.get('latitude')?.value;
    const lng = this.venueForm.get('longitude')?.value;

    if (!lat || !lng) {
      this.error = 'Ingrese valores de latitud y longitud para validar';
      return;
    }

    // Here you can add more sophisticated validation
    // For now, just check if they are within reasonable ranges
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      this.error =
        'Coordenadas inválidas. Latitud debe estar entre -90 y 90, y longitud entre -180 y 180.';
    } else {
      // In a real app, you might call a service to validate these coordinates
      this.error = '';
      // Could show a success message here
    }
  }

  resetForm(): void {
    this.submitted = false;
    this.error = '';

    if (this.isEditMode && this.venueId) {
      // In edit mode, reload the original venue data
      this.loadVenue(this.venueId);
    } else {
      // In create mode, initialize a fresh form
      this.initForm();
    }
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = '';

    // Stop if form is invalid
    if (this.venueForm.invalid) {
      // Identify which tab has errors to help the user
      this.findErrorTab();
      return;
    }

    this.loading = true;

    // Clone the form value to avoid mutating the original
    const formValue = { ...this.venueForm.value };

    // Process sections to ensure proper handling of IDs
    const processedSections = formValue.sections.map((section: any) => {
      // For new sections, remove venueId completely
      if (!section.id) {
        const { venueId, ...rest } = section;
        return rest;
      }
      // For existing sections, make sure venueId is a number or null
      if (section.venueId === undefined || section.venueId === 'NaN') {
        section.venueId = this.venueId; // Use the component's venueId
      }
      return section;
    });

    const venueData: Venue = {
      ...formValue,
      sections: processedSections,
    };

    if (this.isEditMode && this.venueId) {
      // Update existing venue
      this.venueService.updateVenue(this.venueId, venueData).subscribe({
        next: () => this.handleSuccess(),
        error: (err) => this.handleError(err),
      });
    } else {
      // Create new venue
      this.venueService.createVenue(venueData).subscribe({
        next: () => this.handleSuccess(),
        error: (err) => this.handleError(err),
      });
    }
  }

  private handleSuccess(): void {
    this.success = true;
    this.loading = false;

    // Navigate away after a delay
    setTimeout(() => {
      if (this.isEditMode && this.venueId) {
        this.router.navigate(['/venues', this.venueId]);
      } else {
        this.router.navigate(['/venues']);
      }
    }, 2000);
  }

  private handleError(err: any): void {
    this.error = err.error?.message || 'Error al guardar el recinto';
    this.loading = false;
  }

  private findErrorTab(): void {
    // Find which tab has errors and switch to it
    // Basic tab
    if (
      this.hasError(this.f['name'], 'required') ||
      this.hasError(this.f['name'], 'maxlength') ||
      this.hasError(this.f['address'], 'required') ||
      this.hasError(this.f['totalCapacity'], 'min')
    ) {
      // Programmatically click the basic tab
      document.getElementById('basic-tab')?.click();
      return;
    }

    // Check if there are errors in the sections
    const sectionsWithErrors = this.sections.controls.some(
      (section: AbstractControl) => (section as FormGroup).invalid
    );

    if (sectionsWithErrors) {
      // Programmatically click the sections tab
      document.getElementById('sections-tab')?.click();
    }
  }
}
