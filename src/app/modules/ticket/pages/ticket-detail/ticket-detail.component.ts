import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TicketService, AttendeeUpdateRequest, TicketTransferRequest } from '../../services/ticket.service';
import { Ticket } from '../../models/ticket.model';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HttpClientModule,
    DatePipe,
    CurrencyPipe,
    ReactiveFormsModule,
  ],
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.scss'],
})
export class TicketDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private ticketService = inject(TicketService);
  private fb = inject(FormBuilder);

  private ticketSubject = new BehaviorSubject<Ticket | null>(null);
  ticket$: Observable<Ticket | null> = this.ticketSubject.asObservable();
  
  error: string | null = null;
  isEditModalOpen = false;
  attendeeForm: FormGroup;
  
  isTransferModalOpen = false;
  transferForm: FormGroup;
  transferError: string | null = null;
  transferSuccess: string | null = null;

  editingTicketId: number | null = null;
  isLoading = false;

  constructor() {
    this.attendeeForm = this.fb.group({
      attendeeFirstName: ['', Validators.required],
      attendeeLastName: ['', Validators.required],
      attendeeDni: ['', Validators.required],
    });

    this.transferForm = this.fb.group({
      recipientUserId: [null, [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      recipientEmail: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap((params) => {
        const id = params.get('id');
        if (id) {
          this.editingTicketId = +id;
          this.isLoading = true;
          return this.ticketService.getTicketById(+id).pipe(
            tap(ticket => {
              this.ticketSubject.next(ticket);
              this.isLoading = false;
            }),
            catchError((err) => {
              this.error = err.error?.message || 'Error fetching ticket details.';
              this.ticketSubject.next(null);
              this.isLoading = false;
              return of(null);
            })
          );
        } else {
          this.error = 'Ticket ID not found in route.';
          this.ticketSubject.next(null);
          return of(null);
        }
      })
    ).subscribe();
  }

  canEditTicket(ticket: Ticket | null): boolean {
    if (!ticket || !ticket.status || !ticket.eventDate) return false;
    
    const isActiveEvent = new Date(ticket.eventDate) > new Date();
    const isStatusVendida = ticket.status.toUpperCase() === 'VENDIDA';

    return isStatusVendida && isActiveEvent;
  }

  canTransferTicket(ticket: Ticket | null): boolean {
    return this.canEditTicket(ticket);
  }

  openEditModal(ticket: Ticket): void {
    if (!this.canEditTicket(ticket)) {
      console.warn('Editing not allowed for this ticket:', ticket);
      this.error = 'No se permite la modificación para esta entrada (estado o fecha no válidos).';
      return;
    }
    this.editingTicketId = ticket.id;
    this.attendeeForm.patchValue({
      attendeeFirstName: ticket.attendeeFirstName,
      attendeeLastName: ticket.attendeeLastName,
      attendeeDni: ticket.attendeeDni,
    });
    this.isEditModalOpen = true;
    this.error = null;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.attendeeForm.reset();
    this.editingTicketId = null;
  }

  onSaveAttendeeDetails(): void {
    if (this.attendeeForm.invalid || !this.editingTicketId) {
      this.error = 'Por favor, complete todos los campos requeridos.';
      this.attendeeForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.error = null;

    const formValues = this.attendeeForm.value;
    const updateRequest: AttendeeUpdateRequest = {
      attendeeFirstName: formValues.attendeeFirstName,
      attendeeLastName: formValues.attendeeLastName,
      attendeeDni: formValues.attendeeDni,
    };

    this.ticketService.updateTicketAttendee(this.editingTicketId, updateRequest).pipe(
      tap(updatedTicket => {
        this.ticketSubject.next(updatedTicket);
        this.isLoading = false;
        this.closeEditModal();
      }),
      catchError(err => {
        this.error = err.error?.message || 'Error al actualizar los detalles del asistente.';
        this.isLoading = false;
        return of(null);
      })
    ).subscribe();
  }

  openTransferModal(ticket: Ticket): void {
    if (!this.canTransferTicket(ticket) || !ticket.id) {
      this.transferError = 'Esta entrada no se puede transferir en este momento.';
      return;
    }
    this.editingTicketId = ticket.id;
    this.isTransferModalOpen = true;
    this.transferError = null;
    this.transferSuccess = null;
    this.transferForm.reset();
  }

  closeTransferModal(): void {
    this.isTransferModalOpen = false;
    this.transferForm.reset();
    this.editingTicketId = null;
    this.transferError = null;
    this.transferSuccess = null;
  }

  onConfirmTransfer(): void {
    if (this.transferForm.invalid || !this.editingTicketId) {
      this.transferError = 'Por favor, complete todos los campos requeridos correctamente.';
      this.transferForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.transferError = null;
    this.transferSuccess = null;

    const transferRequest: TicketTransferRequest = {
      recipientUserId: +this.transferForm.value.recipientUserId,
      recipientEmail: this.transferForm.value.recipientEmail,
    };

    this.ticketService.transferTicket(this.editingTicketId, transferRequest).pipe(
      tap(updatedTicket => {
        this.ticketSubject.next(updatedTicket);
        this.isLoading = false;
        this.transferSuccess = `Entrada transferida exitosamente a ${updatedTicket.attendeeFirstName} ${updatedTicket.attendeeLastName}. El nuevo dueño ha sido notificado.`;
        this.closeTransferModal();
      }),
      catchError(err => {
        this.transferError = err.error?.message || 'Error al transferir la entrada.';
        if (err.status === 404 && err.error?.message?.includes('Recipient user not found')) {
          this.transferError = 'Usuario destinatario no encontrado. Verifique el ID y el Email.';
        }
        this.isLoading = false;
        return of(null);
      })
    ).subscribe();
  }
} 