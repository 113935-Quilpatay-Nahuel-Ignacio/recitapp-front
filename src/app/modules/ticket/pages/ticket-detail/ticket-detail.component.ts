import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { TicketService, AttendeeUpdateRequest, TicketTransferBySearchRequest } from '../../services/ticket.service';
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
  private router = inject(Router);
  private ticketService = inject(TicketService);
  private fb = inject(FormBuilder);

  private ticketSubject = new BehaviorSubject<Ticket | null>(null);
  ticket$: Observable<Ticket | null> = this.ticketSubject.asObservable();
  
  error: string | null = null;
  isEditModalOpen = false;
  attendeeForm: FormGroup;
  
  isTransferModalOpen = false;
  transferTicketForm: FormGroup;
  transferError: string | null = null;
  transferLoading = false;

  editingTicketId: number | null = null;
  isLoading = true;
  currentTicketId: number | null = null;
  currentUserId: number | null = 4; // Placeholder User ID

  constructor() {
    this.attendeeForm = this.fb.group({
      attendeeFirstName: ['', Validators.required],
      attendeeLastName: ['', Validators.required],
      attendeeDni: ['', Validators.required],
    });

    this.transferTicketForm = this.fb.group({
      recipientFirstName: ['', Validators.required],
      recipientLastName: ['', Validators.required],
      recipientDni: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.ticket$ = this.route.paramMap.pipe(
      switchMap((params) => {
        const id = params.get('id');
        if (id) {
          this.currentTicketId = +id;
          this.isLoading = true;
          return this.ticketService.getTicketById(+id).pipe(
            tap(ticket => {
              this.ticketSubject.next(ticket);
              this.isLoading = false;
            }),
            catchError((err) => {
              this.error = (err.error as any)?.message || 'Error fetching ticket details.';
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
    );
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
      this.error = 'No se permite la modificación para esta entrada.';
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
        this.error = (err.error as any)?.message || 'Error al actualizar los detalles del asistente.';
        this.isLoading = false;
        return of(null);
      })
    ).subscribe();
  }

  openTransferModal(): void {
    if (!this.canTransferTicket(this.ticketSubject.value) || !this.currentTicketId) {
      this.transferError = 'Esta entrada no se puede transferir en este momento.';
      return;
    }
    this.isTransferModalOpen = true;
    this.transferError = null;
    this.transferTicketForm.reset();
  }

  closeTransferModal(): void {
    this.isTransferModalOpen = false;
    this.transferTicketForm.reset();
    this.transferError = null;
  }

  onConfirmTransfer(): void {
    if (this.transferTicketForm.invalid || !this.currentTicketId || !this.currentUserId) {
      if (!this.currentUserId) {
        this.transferError = 'Error: No se pudo identificar al usuario actual para la transferencia (ID de usuario no disponible).';
      } else {
        this.transferError = 'Por favor complete todos los campos requeridos del destinatario.';
      }
      this.transferTicketForm.markAllAsTouched();
      return;
    }
    this.transferLoading = true;
    this.transferError = null;

    const searchData: TicketTransferBySearchRequest = this.transferTicketForm.value;

    this.ticketService.transferTicketBySearch(this.currentUserId, this.currentTicketId, searchData).pipe(
      tap(updatedTicket => {
        this.ticketSubject.next(updatedTicket);
        this.transferLoading = false;
        this.transferError = null;
        this.closeTransferModal();
        alert('¡Entrada transferida con éxito! El nuevo dueño y asistente es el usuario encontrado.');
      }),
      catchError(err => {
        this.transferError = (err.error as any)?.message || 'Error al transferir la entrada por búsqueda.';
        this.transferLoading = false;
        console.error('Transfer error:', err);
        return of(null);
      })
    ).subscribe();
  }
} 