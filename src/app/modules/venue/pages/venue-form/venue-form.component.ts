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
  sectionsLoading = false;
  submitted = false;
  success = false;
  error = '';
  imageLoadError = false;

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
      const idParam = params.get('id');
      if (idParam) {
        const numericId = Number(idParam);
        if (!isNaN(numericId)) {
          this.venueId = numericId;
          this.isEditMode = true;
          this.loadVenue(this.venueId);
        } else {
          // Invalid ID parameter in route (e.g., if it was a non-numeric string)
          // This case should ideally not happen for /venues/new if routing is correct
          console.error('Invalid ID parameter in route for VenueForm:, idParam');
          this.error = 'El ID del recinto en la URL no es válido. Mostrando formulario de creación.';
          this.isEditMode = false;
          this.venueId = null;
          // Consider navigating to a safe route or showing a more prominent error
          // For now, it will default to a new form state due to isEditMode = false
        }
      } else {
        // No 'id' param, definitely in create mode
        this.isEditMode = false;
        this.venueId = null;
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
        // Update form values (excluding sections)
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

        // Load sections from the specific endpoint
        this.loadVenueSections(id);
      },
      error: (err) => {
        this.error =
          err.error?.message || 'Error al cargar los datos del recinto';
        this.loading = false;
      },
    });
  }

  loadVenueSections(venueId: number): void {
    this.sectionsLoading = true;
    this.venueService.getVenueSections(venueId).subscribe({
      next: (sections) => {
        // Clear existing sections
        while (this.sections.length) {
          this.sections.removeAt(0);
        }

        // Add loaded sections
        if (sections && sections.length > 0) {
          sections.forEach((section) => {
            this.addSection(section);
          });
        } else {
          // Add one empty section if no sections exist
          this.addSection();
        }

        this.sectionsLoading = false;
        // Ensure main loading is also false after sections are loaded
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading venue sections:', err);
        // Clear existing sections and add one empty section
        while (this.sections.length) {
          this.sections.removeAt(0);
        }
        this.addSection();
        this.sectionsLoading = false;
        // Ensure main loading is also false even if sections fail to load
        this.loading = false;
        
        // Don't show error to user for sections, just log it
        // They can still use the form to add sections manually
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

  reloadSections(): void {
    if (this.isEditMode && this.venueId) {
      this.loadVenueSections(this.venueId);
    }
  }

  onImageLoad(): void {
    this.imageLoadError = false;
  }

  onImageError(): void {
    this.imageLoadError = true;
  }

  onImageUrlChange(): void {
    this.imageLoadError = false;
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

  // Calculate total capacity from sections
  calculateSectionsCapacity(): number {
    return this.sections.controls.reduce((total, section) => {
      const capacity = (section as FormGroup).get('capacity')?.value;
      return total + (capacity ? parseInt(capacity, 10) : 0);
    }, 0);
  }

  // Check if total capacity matches sections capacity
  isCapacityConsistent(): boolean {
    const totalCapacity = this.venueForm.get('totalCapacity')?.value;
    const sectionsCapacity = this.calculateSectionsCapacity();
    
    if (!totalCapacity) return true; // If no total capacity specified, it's always consistent
    return totalCapacity === sectionsCapacity;
  }

  // Get capacity validation message
  getCapacityValidationMessage(): string {
    const totalCapacity = this.venueForm.get('totalCapacity')?.value;
    const sectionsCapacity = this.calculateSectionsCapacity();
    
    if (!totalCapacity && sectionsCapacity > 0) {
      return `La capacidad total se calculará automáticamente como ${sectionsCapacity} lugares.`;
    }
    
    if (totalCapacity && sectionsCapacity === 0) {
      return `Debe agregar secciones que sumen ${totalCapacity} lugares en total.`;
    }
    
    if (totalCapacity && sectionsCapacity > 0) {
      if (totalCapacity === sectionsCapacity) {
        return `✓ La capacidad total (${totalCapacity}) coincide con la suma de secciones.`;
      } else {
        return `⚠ La capacidad total (${totalCapacity}) no coincide con la suma de secciones (${sectionsCapacity}).`;
      }
    }
    
    return '';
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

    // Validate capacity consistency
    const totalCapacity = this.venueForm.get('totalCapacity')?.value;
    const sectionsCapacity = this.calculateSectionsCapacity();
    
    if (totalCapacity && sectionsCapacity > 0 && totalCapacity !== sectionsCapacity) {
      this.error = `La capacidad total especificada (${totalCapacity}) no coincide con la suma de las capacidades de las secciones (${sectionsCapacity}). Las capacidades deben ser iguales.`;
      // Switch to sections tab to show the error
      document.getElementById('sections-tab')?.click();
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
