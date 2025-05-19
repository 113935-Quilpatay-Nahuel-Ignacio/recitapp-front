import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { TicketService, PromotionalTicketRequest, PromotionalTicketResponse, TicketResponseItem } from '../../../ticket/services/ticket.service';
import { EventService } from '../../../event/services/event.service';
import { Event } from '../../../event/models/event.model';
import { Section } from '../../../event/models/section.model';
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
  createdTicket: TicketResponseItem | null = null;

  events$!: Observable<Event[]>;
  sections$!: Observable<Section[]>;

  ngOnInit(): void {
    this.promotionalTicketForm = this.fb.group({
      eventId: [null, Validators.required],
      sectionId: [{ value: null, disabled: true }, Validators.required],
      attendeeFirstName: ['', Validators.required],
      attendeeLastName: ['', Validators.required],
      attendeeDni: ['', Validators.required],
      adminUserId: [null, Validators.required],
      recipientUserId: [null, Validators.required],
      promotionName: [''],
      promotionDescription: [''],
      notes: ['']
    });

    this.loadEvents();
    this.onEventChange();
  }

  private loadEvents(): void {
    this.isLoadingEvents = true;
    this.submissionError = null;
    this.events$ = this.eventService.searchEvents({}).pipe(
      tap(() => this.isLoadingEvents = false),
      catchError(err => {
        console.error('Error loading events:', err);
        this.submissionError = 'Error al cargar los eventos. Intente más tarde.';
        this.isLoadingEvents = false;
        return of([]);
      })
    );
  }

  private onEventChange(): void {
    const eventIdControl = this.promotionalTicketForm.get('eventId');
    const sectionIdControl = this.promotionalTicketForm.get('sectionId');

    if (eventIdControl && sectionIdControl) {
      this.sections$ = eventIdControl.valueChanges.pipe(
        startWith(eventIdControl.value),
        switchMap((eventId: number | null) => {
          sectionIdControl.reset({ value: null, disabled: true });
          if (eventId) {
            sectionIdControl.enable();
            return this.eventService.getSectionsByEventId(eventId).pipe(
              catchError(err => {
                console.error('Error loading sections for event:', eventId, err);
                this.submissionError = `Error al cargar secciones para el evento ${eventId}.`;
                sectionIdControl.disable();
                return of([]);
              })
            );
          } else {
            sectionIdControl.disable();
            return of([]);
          }
        })
      );
    }
  }

  onSubmit(): void {
    if (this.promotionalTicketForm.invalid) {
      this.promotionalTicketForm.markAllAsTouched();
      this.submissionError = "Por favor, complete todos los campos requeridos.";
      return;
    }

    this.isLoading = true;
    this.submissionError = null;
    this.submissionSuccessMessage = null;
    this.createdTicket = null;

    const formValue = this.promotionalTicketForm.value;

    const request: PromotionalTicketRequest = {
      eventId: formValue.eventId,
      adminUserId: formValue.adminUserId,
      promotionName: formValue.promotionName || undefined,
      promotionDescription: formValue.promotionDescription || undefined,
      tickets: [
        {
          sectionId: formValue.sectionId,
          recipientUserId: formValue.recipientUserId,
          attendeeFirstName: formValue.attendeeFirstName,
          attendeeLastName: formValue.attendeeLastName,
          attendeeDni: formValue.attendeeDni,
          isGift: true
        }
      ]
    };

    this.ticketService.createPromotionalTicket(request).pipe(
      catchError((err) => {
        this.isLoading = false;
        this.submissionError = err.error?.message || err.message || 'Error al crear la entrada promocional.';
        console.error('Error creating promotional ticket:', err);
        return of(null);
      })
    ).subscribe((response: PromotionalTicketResponse | null) => {
      this.isLoading = false;
      if (response && response.tickets && response.tickets.length > 0) {
        const createdTicketItem = response.tickets[0];
        this.submissionSuccessMessage = `¡Éxito! ${response.ticketCount} entrada(s) promocional(es) creada(s) para el evento ${response.eventName}. ID Ticket: ${createdTicketItem.id}`;
        this.createdTicket = createdTicketItem;
        this.promotionalTicketForm.reset();
        this.promotionalTicketForm.get('eventId')?.setValue(null);
        this.promotionalTicketForm.get('sectionId')?.setValue(null);
        this.promotionalTicketForm.get('sectionId')?.disable();
      } else if (!this.submissionError) {
        this.submissionError = response ? 'La respuesta del servidor no contenía tickets.' : 'Ocurrió un error desconocido al crear la entrada.';
      }
    });
  }

  get fc(): { [key: string]: AbstractControl } {
    return this.promotionalTicketForm.controls;
  }
} 