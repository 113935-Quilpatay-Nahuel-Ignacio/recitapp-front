import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { EventService } from '../../services/event.service';
import { EventCreateDTO, EventDTO } from '../../models/event';
import { Venue } from '../../../venue/models/venue'; // Asegúrate que la ruta sea correcta
import { VenueService } from '../../../venue/services/venue.service'; // Asegúrate que la ruta sea correcta
import { Artist } from '../../../artist/models/artist'; // Asegúrate que la ruta sea correcta
import { ArtistService } from '../../../artist/services/artist.service'; // Asegúrate que la ruta sea correcta

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.scss'],
})
export class EventFormComponent implements OnInit {
  eventForm!: FormGroup;
  venues: Venue[] = [];
  artists: Artist[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  isEditMode = false; // Para futura funcionalidad de edición
  eventId: number | null = null; // Para futura funcionalidad de edición

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
      description: [''],
      startDateTime: ['', Validators.required],
      endDateTime: [''],
      venueId: [null, Validators.required],
      mainArtistId: [null],
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

  loadEventForEdit(id: number): void {
    this.isLoading = true;
    this.eventService.getEventById(id).subscribe({
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
          startDateTime: formatForInput(event.startDateTime),
          endDateTime: formatForInput(event.endDateTime),
          venueId: event.venueId,
          mainArtistId: event.mainArtistId,
        });
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
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
}
