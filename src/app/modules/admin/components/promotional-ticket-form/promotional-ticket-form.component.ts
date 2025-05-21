import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, FormArray } from '@angular/forms';
import { TicketService, PromotionalTicketRequest, PromotionalTicketResponse, TicketResponseItem } from '../../../ticket/services/ticket.service';
import { EventService } from '../../../event/services/event.service';
import { EventDTO } from '../../../event/models/event';
import { SectionAvailability } from '../../../event/models/section-availability.model';
import { Observable, of } from 'rxjs';
import { catchError, map, startWith, switchMap, tap } from 'rxjs/operators';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-promotional-ticket-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CurrencyPipe,
    RouterLink
  ],
  templateUrl: './promotional-ticket-form.component.html',
  styleUrls: ['./promotional-ticket-form.component.scss']
})
export class PromotionalTicketFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private ticketService = inject(TicketService);
  private eventService = inject(EventService);

  promotionalTicketForm!: FormGroup;
  isLoading = false;
  isLoadingEvents = false;
  submissionError: string | null = null;
  submissionSuccessMessage: string | null = null;

  events: EventDTO[] = [];
  events$!: Observable<EventDTO[]>;
  sections$!: Observable<SectionAvailability[]>;

  ngOnInit(): void {
    this.promotionalTicketForm = this.fb.group({
      eventId: [null, Validators.required],
      adminUserId: [null, Validators.required],
      promotionName: [''],
      promotionDescription: [''],
      tickets: this.fb.array([this.createTicketFormGroup()])
    });

    this.loadEvents();
    this.onEventChange();
  }

  createTicketFormGroup(): FormGroup {
    return this.fb.group({
      sectionId: [{ value: null, disabled: true }, Validators.required],
      recipientUserId: [null, Validators.required],
      attendeeFirstName: ['', Validators.required],
      attendeeLastName: ['', Validators.required],
      attendeeDni: ['', Validators.required],
      isGift: [true, Validators.required]
    });
  }

  get ticketsFormArray(): FormArray {
    return this.promotionalTicketForm.get('tickets') as FormArray;
  }

  addTicket(): void {
    this.ticketsFormArray.push(this.createTicketFormGroup());
    const eventId = this.promotionalTicketForm.get('eventId')?.value;
    if (eventId) {
      const newTicketIndex = this.ticketsFormArray.length - 1;
      this.ticketsFormArray.at(newTicketIndex).get('sectionId')?.enable();
    } else {
      const newTicketIndex = this.ticketsFormArray.length - 1;
      this.ticketsFormArray.at(newTicketIndex).get('sectionId')?.disable();
    }
  }

  removeTicket(index: number): void {
    if (this.ticketsFormArray.length > 1) {
      this.ticketsFormArray.removeAt(index);
    }
  }

  private loadEvents(): void {
    this.isLoadingEvents = true;
    this.submissionError = null;
    this.events$ = this.eventService.searchEvents({}).pipe(
      tap((loadedEvents: EventDTO[]) => {
        this.events = loadedEvents;
        this.isLoadingEvents = false;
      }),
      catchError(err => {
        console.error('Error loading events:', err);
        this.submissionError = 'Error al cargar los eventos. Intente más tarde.';
        this.isLoadingEvents = false;
        this.events = [];
        return of([]);
      })
    );
  }

  private onEventChange(): void {
    const eventIdControl = this.promotionalTicketForm.get('eventId');

    if (eventIdControl) {
      this.sections$ = eventIdControl.valueChanges.pipe(
        startWith(eventIdControl.value),
        switchMap((selectedEventId: number | null) => {
          this.ticketsFormArray.controls.forEach(ticketGroup => {
            const sectionIdControl = ticketGroup.get('sectionId');
            sectionIdControl?.reset({ value: null, disabled: true });
          });

          if (selectedEventId) {
            const selectedEvent = this.events.find(event => event.id === selectedEventId);
            if (selectedEvent && selectedEvent.venueId) {
              this.ticketsFormArray.controls.forEach(ticketGroup => {
                ticketGroup.get('sectionId')?.enable();
              });
              return this.eventService.getSectionsByVenueId(selectedEvent.venueId).pipe(
                catchError(err => {
                  console.error('Error loading sections for venue:', selectedEvent.venueId, err);
                  this.submissionError = `Error al cargar secciones para el venue ${selectedEvent.venueId}.`;
                  this.ticketsFormArray.controls.forEach(ticketGroup => {
                    ticketGroup.get('sectionId')?.disable();
                  });
                  return of([]);
                })
              );
            } else {
              this.submissionError = selectedEvent?.venueId ? null : 'El evento seleccionado no tiene un venue ID asociado.';
              this.disableAllSectionControls();
              return of([]);
            }
          } else {
            this.disableAllSectionControls();
            return of([]);
          }
        })
      );
    }
  }

  private disableAllSectionControls(): void {
    this.ticketsFormArray.controls.forEach(ticketGroup => {
      ticketGroup.get('sectionId')?.disable();
      ticketGroup.get('sectionId')?.reset({ value: null, disabled: true });
    });
  }

  onSubmit(): void {
    if (this.promotionalTicketForm.invalid) {
      this.promotionalTicketForm.markAllAsTouched();
      this.ticketsFormArray.controls.forEach(control => {
        if (control instanceof FormGroup) {
          Object.values(control.controls).forEach(innerControl => {
            innerControl.markAsTouched();
          });
        }
      });
      this.submissionError = "Por favor, complete todos los campos requeridos en todos los tickets.";
      return;
    }

    this.isLoading = true;
    this.submissionError = null;
    this.submissionSuccessMessage = null;

    const formValue = this.promotionalTicketForm.value;

    const request: PromotionalTicketRequest = {
      eventId: formValue.eventId,
      adminUserId: formValue.adminUserId,
      promotionName: formValue.promotionName || undefined,
      promotionDescription: formValue.promotionDescription || undefined,
      tickets: formValue.tickets.map((ticket: any) => ({
        sectionId: ticket.sectionId,
        recipientUserId: ticket.recipientUserId,
        attendeeFirstName: ticket.attendeeFirstName,
        attendeeLastName: ticket.attendeeLastName,
        attendeeDni: ticket.attendeeDni,
        isGift: ticket.isGift
      }))
    };

    this.ticketService.createPromotionalTicket(request).pipe(
      catchError((err) => {
        this.isLoading = false;
        this.submissionError = err.error?.message || err.message || 'Error al crear las entradas promocionales.';
        console.error('Error creating promotional tickets:', err);
        return of(null);
      })
    ).subscribe((response: PromotionalTicketResponse | null) => {
      this.isLoading = false;
      if (response && response.tickets && response.ticketCount > 0) {
        this.submissionSuccessMessage = `¡Éxito! ${response.ticketCount} entrada(s) promocional(es) creada(s) para el evento ${response.eventName}.`;
        this.promotionalTicketForm.reset({
          eventId: null,
          adminUserId: null,
          promotionName: '',
          promotionDescription: ''
        });
        this.ticketsFormArray.clear();
        this.addTicket();
        
        const firstTicketSectionControl = this.ticketsFormArray.at(0)?.get('sectionId');
        firstTicketSectionControl?.reset({ value: null, disabled: true });

      } else if (!this.submissionError) {
        this.submissionError = response ? 'La respuesta del servidor no contenía la información esperada o el número de tickets era cero.' : 'Ocurrió un error desconocido al crear las entradas.';
      }
    });
  }

  get fc(): { [key: string]: AbstractControl } {
    return this.promotionalTicketForm.controls;
  }
} 