import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TicketService } from '../../../ticket/services/ticket.service';
import { Ticket } from '../../../ticket/models/ticket.model'; // To display ticket info
import { Observable, of, Subject } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-ticket-validation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ticket-validation.component.html',
  styleUrls: ['./ticket-validation.component.scss']
})
export class TicketValidationComponent {
  private fb = inject(FormBuilder);
  private ticketService = inject(TicketService);

  validationForm: FormGroup;
  isLoading = false;
  validationResult: { isValid: boolean; message: string; ticket?: Ticket } | null = null;
  validationError: string | null = null;

  constructor() {
    this.validationForm = this.fb.group({
      ticketId: [null, [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      qrCodeValue: ['', Validators.required] 
    });
  }

  onValidateTicket(): void {
    if (this.validationForm.invalid) {
      this.validationError = 'Por favor, complete todos los campos requeridos.';
      this.validationForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.validationResult = null;
    this.validationError = null;
    const { ticketId, qrCodeValue } = this.validationForm.value;

    this.ticketService.validateTicket(ticketId, qrCodeValue).pipe(
      switchMap(isValid => {
        if (isValid) {
          // If valid, also fetch ticket details to display them
          return this.ticketService.getTicketById(ticketId).pipe(
            tap(ticketDetails => {
              this.validationResult = {
                isValid: true,
                message: `Entrada VÁLIDA. Asistente: ${ticketDetails.attendeeFirstName} ${ticketDetails.attendeeLastName}`,
                ticket: ticketDetails
              };
            }),
            catchError(err => {
              // Valid, but couldn't fetch details (should be rare if ID is correct)
              this.validationResult = {
                isValid: true,
                message: 'Entrada VÁLIDA, pero no se pudieron cargar los detalles completos.'
              };
              return of(null); // Continue, validation itself was successful
            })
          );
        } else {
          this.validationResult = { isValid: false, message: 'Entrada INVÁLIDA o ya utilizada.' };
          return of(null); // Validation failed, no need to fetch details
        }
      }),
      tap(() => this.isLoading = false),
      catchError(err => {
        this.isLoading = false;
        this.validationError = err.error?.message || 'Error durante la validación de la entrada.';
        if (err.status === 404) {
          this.validationError = 'ID de entrada no encontrado.';
        }
        return of(null);
      })
    ).subscribe();
  }

  resetForm(): void {
    this.validationForm.reset();
    this.validationResult = null;
    this.validationError = null;
    this.isLoading = false;
  }
} 