import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Para ngModel en input de eventId
import { ReservationAdminService, ClearedReservationsResponse } from '../../services/reservation-admin.service';
import { ModalService } from '../../../../shared/services/modal.service';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Component({
  selector: 'app-reservation-manager',
  standalone: true,
  imports: [CommonModule, FormsModule], // Importar FormsModule
  templateUrl: './reservation-manager.component.html',
  styleUrls: ['./reservation-manager.component.scss']
})
export class ReservationManagerComponent implements OnInit {
  private reservationAdminService = inject(ReservationAdminService);
  private modalService = inject(ModalService);

  expiredReservationIds$: Observable<number[] | null> = of(null);
  isLoadingExpiredIds = false;
  loadExpiredIdsError: string | null = null;

  isClearingReservations = false;
  clearReservationsSuccess: string | null = null;
  clearReservationsError: string | null = null;

  eventIdForCount: number | null = null;
  reservedTicketsCount: number | null = null;
  isLoadingCount = false;
  loadCountError: string | null = null;

  constructor() { }

  ngOnInit(): void {
    // Podríamos cargar las IDs expiradas al iniciar, o bajo demanda
  }

  fetchExpiredReservationIds(): void {
    this.isLoadingExpiredIds = true;
    this.loadExpiredIdsError = null;
    this.expiredReservationIds$ = this.reservationAdminService.getExpiredReservationIds().pipe(
      tap(() => this.isLoadingExpiredIds = false),
      catchError(err => {
        console.error('Error fetching expired reservation IDs:', err);
        this.loadExpiredIdsError = err.error?.message || err.message || 'Error al cargar IDs de reservas expiradas.';
        this.isLoadingExpiredIds = false;
        return of(null);
      })
    );
  }

  confirmAndClearExpiredReservations(): void {
    this.modalService.showConfirm({
      title: 'Liberar Reservas Expiradas',
      message: '¿Está seguro de que desea liberar todas las reservas expiradas? Estos tickets volverán a estar disponibles.',
      type: 'warning',
      confirmText: 'Sí, liberar reservas',
      cancelText: 'Cancelar',
      details: [
        'Las reservas expiradas serán liberadas automáticamente',
        'Los tickets volverán a estar disponibles para compra',
        'Esta acción no se puede deshacer'
      ]
    }).subscribe(confirmed => {
      if (!confirmed) {
        return;
      }
      this.isClearingReservations = true;
      this.clearReservationsSuccess = null;
      this.clearReservationsError = null;

      this.reservationAdminService.clearExpiredReservations().pipe(
        tap((response: ClearedReservationsResponse) => {
          this.isClearingReservations = false;
          this.modalService.success(`Se liberaron ${response.clearedCount} reserva(s) expirada(s).`, 'Reservas Liberadas').subscribe(() => {
            // Opcional: Volver a cargar las IDs expiradas para actualizar la lista/contador
            this.fetchExpiredReservationIds();
          });
        }),
        catchError(err => {
          console.error('Error clearing expired reservations:', err);
          this.clearReservationsError = err.error?.message || err.message || 'Error al limpiar reservas expiradas.';
          this.isClearingReservations = false;
          this.modalService.error(this.clearReservationsError || 'Error al limpiar reservas expiradas.', 'Error de Liberación');
          return of(null);
        })
      ).subscribe();
    });
  }

  fetchReservedTicketsCount(): void {
    if (this.eventIdForCount === null || this.eventIdForCount <= 0) {
      this.loadCountError = 'Por favor, ingrese un ID de evento válido.';
      return;
    }
    this.isLoadingCount = true;
    this.reservedTicketsCount = null;
    this.loadCountError = null;

    this.reservationAdminService.countReservedTicketsByEvent(this.eventIdForCount).pipe(
      tap(response => {
        this.isLoadingCount = false;
        this.reservedTicketsCount = response.reservedTicketsCount;
      }),
      catchError(err => {
        console.error('Error fetching reserved tickets count:', err);
        this.loadCountError = err.error?.message || err.message || 'Error al contar las reservas.';
        this.isLoadingCount = false;
        return of(null);
      })
    ).subscribe();
  }
} 