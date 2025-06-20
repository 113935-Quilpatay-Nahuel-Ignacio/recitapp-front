import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
} from '@angular/forms';
import { FormsModule } from '@angular/forms'; // Para ngModel
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { EventService } from '../../services/event.service';
import { EventCreateDTO, EventDTO } from '../../models/event';
import { TicketPriceDTO, TicketTypeOption, PromotionalType } from '../../models/ticket-price';
import { Venue, VenueSection } from '../../../venue/models/venue'; // Asegúrate que la ruta sea correcta
import { VenueService } from '../../../venue/services/venue.service'; // Asegúrate que la ruta sea correcta
import { Artist } from '../../../artist/models/artist'; // Asegúrate que la ruta sea correcta
import { ArtistService } from '../../../artist/services/artist.service'; // Asegúrate que la ruta sea correcta
import { FileUploadComponent } from '../../../../shared/components/file-upload/file-upload.component';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, FileUploadComponent],
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.scss'],
})
export class EventFormComponent implements OnInit {
  eventForm!: FormGroup;
  venues: Venue[] = [];
  artists: Artist[] = [];
  selectedVenueSections: VenueSection[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  isEditMode = false; // Para futura funcionalidad de edición
  eventId: number | null = null; // Para futura funcionalidad de edición
  private isLoadingForEdit = false; // Flag to prevent clearing during edit loading
  
  // Opciones para tipos de entradas
  ticketTypeOptions: TicketTypeOption[] = [
    {
      label: 'General',
      value: 'GENERAL',
      isPromotional: false,
      isGift: false,
      seatsPerTicket: 1,
      description: 'Entrada normal con precio completo'
    },
    {
      label: 'VIP',
      value: 'VIP',
      isPromotional: false,
      isGift: false,
      seatsPerTicket: 1,
      description: 'Entrada premium con beneficios adicionales'
    },
    {
      label: 'Promocional 2x1',
      value: 'PROMOTIONAL_2X1',
      isPromotional: true,
      isGift: false,
      seatsPerTicket: 2,
      description: 'Entrada promocional: paga 1, obtén 2 asientos'
    },
    {
      label: 'Entrada de Regalo',
      value: 'GIFT',
      isPromotional: false,
      isGift: true,
      seatsPerTicket: 1,
      description: 'Entrada gratuita sin costo'
    }
  ];
  
  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private venueService: VenueService,
    private artistService: ArtistService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadVenues();
    this.loadArtists();

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.eventId = Number(id);
        this.loadEventForEdit(this.eventId);
      } else {
        // Si no hay ID, chequear si hay un venueId en los queryParams para creación
        this.route.queryParams.subscribe(queryParams => {
          const venueId = queryParams['venueId'];
          if (venueId) {
            this.eventForm.patchValue({ venueId: Number(venueId) });
          }
        });
      }
    });
  }

  private initForm(): void {
    this.eventForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      flyerImage: [''],
      sectionsImage: [''],
      startDateTime: ['', Validators.required],
      endDateTime: [''],
      venueId: [null, Validators.required],
      mainArtistId: [null],
      ticketPrices: this.fb.array([])
    });

    // Escuchar cambios en el venue seleccionado para cargar sus secciones
    this.eventForm.get('venueId')?.valueChanges.subscribe(venueId => {
      if (venueId && !this.isLoadingForEdit) {
        this.loadVenueSections(venueId);
      } else if (!venueId && !this.isLoadingForEdit) {
        this.selectedVenueSections = [];
        this.clearTicketPrices();
      }
    });
  }

  loadVenues(): void {
    // Asumiendo que VenueService tiene un método getVenues()
    // y que devuelve solo los activos o todos y se filtran aquí
    this.venueService.getAllVenues(true).subscribe({ // Ajustar parámetros según API
      next: (response: Venue[]) => { // Asumiendo que la API devuelve un objeto con una propiedad 'content' o similar
        this.venues = response; // Ajustar según la estructura de la respuesta
      },
      error: (err: any) => {
        console.error('Error loading venues:', err);
        this.errorMessage = 'No se pudieron cargar los recintos.';
      }
    });
  }

  loadArtists(): void {
    // Asumiendo que ArtistService tiene un método getArtists()
    this.artistService.getAllArtists(true).subscribe({ // Ajustar parámetros según API
      next: (response: Artist[]) => { // Asumiendo que la API devuelve un objeto con una propiedad 'content' o similar
        this.artists = response; // Ajustar según la estructura de la respuesta
      },
      error: (err: any) => {
        console.error('Error loading artists:', err);
        this.errorMessage = 'No se pudieron cargar los artistas.';
      }
    });
  }

  loadVenueSections(venueId: number): void {
    this.venueService.getVenueSections(venueId).subscribe({
      next: (sections: VenueSection[]) => {
        this.selectedVenueSections = sections.filter(section => section.active);
        this.clearTicketPrices();
      },
      error: (err: any) => {
        console.error('Error loading venue sections:', err);
        this.errorMessage = 'No se pudieron cargar las secciones del recinto.';
        this.selectedVenueSections = [];
      }
    });
  }

  loadEventForEdit(id: number): void {
    this.isLoading = true;
    this.isLoadingForEdit = true;
    this.eventService.getEventForEdit(id).subscribe({
      next: (event) => {
        // Formatear fechas para datetime-local input
        // El backend devuelve ISO string (e.g., "2025-06-15T18:00:00Z" o similar)
        // datetime-local espera "yyyy-MM-ddTHH:mm"
        const formatForInput = (dateString: string | Date | undefined): string | null => {
          if (!dateString) return null;
          const date = new Date(dateString);
          // Ajustar por zona horaria local si es necesario, o asegurarse que el backend envíe en UTC
          // y el input lo interprete como local. El pipe transform con 'yyyy-MM-ddTHH:mm' lo hace.
          // Pero DatePipe no está disponible aquí fácilmente sin inyectarlo como servicio en el constructor de DatePipe
          // Manera manual más simple y directa para formato de input type='datetime-local'
          const year = date.getFullYear();
          const month = ('0' + (date.getMonth() + 1)).slice(-2);
          const day = ('0' + date.getDate()).slice(-2);
          const hours = ('0' + date.getHours()).slice(-2);
          const minutes = ('0' + date.getMinutes()).slice(-2);
          return `${year}-${month}-${day}T${hours}:${minutes}`;
        };

        this.eventForm.patchValue({
          name: event.name,
          description: event.description,
          flyerImage: event.flyerImage,
          sectionsImage: event.sectionsImage,
          startDateTime: formatForInput(event.startDateTime),
          endDateTime: formatForInput(event.endDateTime),
          venueId: event.venueId,
          mainArtistId: event.mainArtistId,
        });
        
        // Cargar las secciones del venue y los precios de tickets
        this.venueService.getVenueSections(event.venueId).subscribe({
          next: (sections: VenueSection[]) => {
            this.selectedVenueSections = sections.filter(section => section.active);
            
            // Cargar precios de tickets si existen, después de que las secciones estén cargadas
            if (event.ticketPrices && event.ticketPrices.length > 0) {
              event.ticketPrices.forEach(ticketPrice => {
                const ticketPriceGroup = this.fb.group({
                  sectionId: [ticketPrice.sectionId, Validators.required],
                  ticketType: [ticketPrice.ticketType, Validators.required],
                  price: [{ value: ticketPrice.price, disabled: ticketPrice.isGift }, [Validators.required, Validators.min(0)]],
                  availableQuantity: [ticketPrice.availableQuantity, [Validators.required, Validators.min(1)]],
                  isPromotional: [ticketPrice.isPromotional || false],
                  isGift: [ticketPrice.isGift || false],
                  promotionalType: [ticketPrice.promotionalType || ''],
                  seatsPerTicket: [ticketPrice.seatsPerTicket || 1, [Validators.required, Validators.min(1)]]
                });
                this.ticketPrices.push(ticketPriceGroup);
              });
            }
          },
          error: (err: any) => {
            console.error('Error loading venue sections for editing:', err);
            this.errorMessage = 'No se pudieron cargar las secciones del recinto.';
          }
        });
        
        // Establecer vista previa de imagen si existe
        if (event.flyerImage) {
          // No action needed for URL preview
        }
        
        this.isLoading = false;
        this.isLoadingForEdit = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.isLoadingForEdit = false;
        this.errorMessage = `Error al cargar datos del evento: ${err.error?.message || err.message}`;
        // Considerar redirigir si el evento no se encuentra
        // this.router.navigate(['/events']);
      }
    });
  }

  onSubmit(): void {
    if (this.eventForm.invalid) {
      this.errorMessage = 'Por favor, completa todos los campos requeridos.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const eventData: EventCreateDTO = {
      ...this.eventForm.value,
      startDateTime: new Date(this.eventForm.value.startDateTime).toISOString(),
      endDateTime: this.eventForm.value.endDateTime
        ? new Date(this.eventForm.value.endDateTime).toISOString()
        : undefined,
      ticketPrices: this.ticketPrices.value.map((tp: any) => ({
        sectionId: tp.sectionId,
        ticketType: tp.ticketType,
        price: tp.isGift ? null : tp.price, // null para entradas de regalo
        availableQuantity: tp.availableQuantity,
        isPromotional: tp.isPromotional || false,
        isGift: tp.isGift || false,
        promotionalType: tp.promotionalType || '',
        seatsPerTicket: tp.seatsPerTicket || 1
      }))
    };

    // Remover mainArtistId si es null o undefined para no enviarlo
    if (eventData.mainArtistId === null || eventData.mainArtistId === undefined) {
      delete eventData.mainArtistId;
    }
    if (eventData.endDateTime === undefined) {
        delete eventData.endDateTime;
    }

    // const registrarId = 4; // Hardcoded registrarId for admin user - NO NECESARIO PARA UPDATE

    if (this.isEditMode && this.eventId) {
      this.eventService.updateEvent(this.eventId, eventData).subscribe({
        next: (updatedEvent: EventDTO) => {
          this.isLoading = false;
          this.successMessage = `Evento "${updatedEvent.name}" actualizado exitosamente.`;
          this.router.navigate(['/events', updatedEvent.id]);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage =
            err.error?.message ||
            'Ocurrió un error al actualizar el evento. Inténtalo de nuevo.';
          console.error('Error updating event:', err);
        },
      });
    } else {
      // Modo Creación
      const registrarId = 4; // Hardcoded registrarId for admin user
      this.eventService.createEvent(eventData, registrarId).subscribe({
        next: (createdEvent: EventDTO) => {
          this.isLoading = false;
          this.successMessage = `Evento "${createdEvent.name}" creado exitosamente.`;
          this.router.navigate(['/events', createdEvent.id]);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage =
            err.error?.message ||
            'Ocurrió un error al crear el evento. Inténtalo de nuevo.';
          console.error('Error creating event:', err);
        },
      });
    }
  }

  // Helper para acceder a los controles del formulario en el template
  get f() {
    return this.eventForm.controls;
  }

  // Métodos para manejar la subida de archivos
  onFlyerImageUploaded(fileUrl: string): void {
    this.eventForm.patchValue({ flyerImage: fileUrl });
    console.log('Flyer image uploaded:', fileUrl);
  }

  onFlyerImageRemoved(): void {
    this.eventForm.patchValue({ flyerImage: null });
    console.log('Flyer image removed');
  }

  onSectionsImageUploaded(fileUrl: string): void {
    this.eventForm.patchValue({ sectionsImage: fileUrl });
    console.log('Sections image uploaded:', fileUrl);
  }

  onSectionsImageRemoved(): void {
    this.eventForm.patchValue({ sectionsImage: null });
    console.log('Sections image removed');
  }

  // Métodos para manejar errores y carga de imágenes URL (legacy - mantenido para compatibilidad)
  onImageError(event: any): void {
    // Si hay error cargando la imagen URL, ocultar la vista previa
    event.target.style.display = 'none';
  }

  onImageLoad(event: any): void {
    // Si la imagen URL se carga correctamente, mostrarla
    event.target.style.display = 'block';
  }

  get ticketPrices(): FormArray {
    return this.eventForm.get('ticketPrices') as FormArray;
  }

  addTicketPrice(): void {
    const ticketPriceGroup = this.fb.group({
      sectionId: [null, Validators.required],
      ticketType: ['GENERAL', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      availableQuantity: [0, [Validators.required, Validators.min(1)]],
      isPromotional: [false],
      isGift: [false],
      promotionalType: [''],
      seatsPerTicket: [1, [Validators.required, Validators.min(1)]]
    });

    this.ticketPrices.push(ticketPriceGroup);
  }

  removeTicketPrice(index: number): void {
    this.ticketPrices.removeAt(index);
  }

  clearTicketPrices(): void {
    while (this.ticketPrices.length !== 0) {
      this.ticketPrices.removeAt(0);
    }
  }

  getSectionName(sectionId: number): string {
    const section = this.selectedVenueSections.find(s => s.id === sectionId);
    return section ? section.name : 'Sección no encontrada';
  }

  getSectionCapacity(sectionId: number): number {
    const section = this.selectedVenueSections.find(s => s.id === sectionId);
    return section ? section.capacity : 0;
  }

  validateTicketQuantity(index: number): void {
    const ticketPriceGroup = this.ticketPrices.at(index);
    const sectionId = ticketPriceGroup.get('sectionId')?.value;
    const availableQuantity = ticketPriceGroup.get('availableQuantity')?.value;
    const seatsPerTicket = ticketPriceGroup.get('seatsPerTicket')?.value || 1;
    
    if (sectionId && availableQuantity !== null && availableQuantity !== undefined) {
      const sectionCapacity = this.getSectionCapacity(sectionId);
      const currentSeatsNeeded = availableQuantity * seatsPerTicket;
      
      // Calcular asientos ya ocupados por otros tipos de entradas en la misma sección
      let occupiedSeats = 0;
      this.ticketPrices.controls.forEach((control, i) => {
        if (i !== index && control.get('sectionId')?.value === sectionId) {
          const qty = control.get('availableQuantity')?.value || 0;
          const seats = control.get('seatsPerTicket')?.value || 1;
          occupiedSeats += qty * seats;
        }
      });
      
      const availableSeats = sectionCapacity - occupiedSeats;
      const maxAllowedQuantity = Math.floor(availableSeats / seatsPerTicket);
      
      // Limpiar errores previos
      const currentErrors = ticketPriceGroup.get('availableQuantity')?.errors;
      if (currentErrors) {
        delete currentErrors['exceedsCapacity'];
        delete currentErrors['exceedsSectionCapacity'];
        if (Object.keys(currentErrors).length === 0) {
          ticketPriceGroup.get('availableQuantity')?.setErrors(null);
        } else {
          ticketPriceGroup.get('availableQuantity')?.setErrors(currentErrors);
        }
      }
      
      // Validar si excede la capacidad individual
      if (currentSeatsNeeded > sectionCapacity) {
        ticketPriceGroup.get('availableQuantity')?.setErrors({ 
          exceedsCapacity: { 
            max: Math.floor(sectionCapacity / seatsPerTicket), 
            actual: availableQuantity,
            seatsPerTicket: seatsPerTicket,
            totalSeatsNeeded: currentSeatsNeeded,
            sectionCapacity: sectionCapacity
          } 
        });
      }
      // Validar si excede la capacidad disponible considerando otras entradas
      else if (availableQuantity > maxAllowedQuantity) {
        ticketPriceGroup.get('availableQuantity')?.setErrors({ 
          exceedsSectionCapacity: { 
            max: maxAllowedQuantity, 
            actual: availableQuantity,
            seatsPerTicket: seatsPerTicket,
            occupiedSeats: occupiedSeats,
            availableSeats: availableSeats,
            sectionCapacity: sectionCapacity
          } 
        });
      }
    }
    
    // Revalidar otros controles de la misma sección
    this.revalidateOtherSectionTickets(index);
  }

  private revalidateOtherSectionTickets(excludeIndex: number): void {
    const currentSectionId = this.ticketPrices.at(excludeIndex).get('sectionId')?.value;
    if (currentSectionId) {
      this.ticketPrices.controls.forEach((control, i) => {
        if (i !== excludeIndex && control.get('sectionId')?.value === currentSectionId) {
          this.validateTicketQuantity(i);
        }
      });
    }
  }

  onTicketTypeChange(index: number): void {
    const ticketPriceGroup = this.ticketPrices.at(index);
    const ticketType = ticketPriceGroup.get('ticketType')?.value;
    const ticketOption = this.ticketTypeOptions.find(opt => opt.value === ticketType);
    
    if (ticketOption) {
      // Actualizar campos automáticamente según el tipo
      ticketPriceGroup.patchValue({
        isPromotional: ticketOption.isPromotional,
        isGift: ticketOption.isGift,
        promotionalType: ticketOption.isPromotional || ticketOption.isGift ? ticketOption.value : '',
        seatsPerTicket: ticketOption.seatsPerTicket,
        price: ticketOption.isGift ? 0 : ticketPriceGroup.get('price')?.value
      });

      // Si es de regalo, hacer el precio 0 y readonly
      if (ticketOption.isGift) {
        ticketPriceGroup.get('price')?.setValue(0);
        ticketPriceGroup.get('price')?.disable();
      } else {
        ticketPriceGroup.get('price')?.enable();
      }

      // Revalidar cantidad
      this.validateTicketQuantity(index);
    }
  }

  getMaxQuantityForSection(index: number): number {
    const ticketPriceGroup = this.ticketPrices.at(index);
    const sectionId = ticketPriceGroup.get('sectionId')?.value;
    const seatsPerTicket = ticketPriceGroup.get('seatsPerTicket')?.value || 1;
    
    if (sectionId) {
      const sectionCapacity = this.getSectionCapacity(sectionId);
      return Math.floor(sectionCapacity / seatsPerTicket);
    }
    return 0;
  }

  getTicketTypeDescription(ticketType: string): string {
    const option = this.ticketTypeOptions.find(opt => opt.value === ticketType);
    return option ? option.description : '';
  }
}
