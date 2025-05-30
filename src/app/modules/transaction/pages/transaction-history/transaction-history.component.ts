import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction';
import { SessionService } from '../../../../core/services/session.service';
import { TransactionReceiptDTO } from '../../models/dto/transaction-receipt.dto';
import { RefundRequestDTO } from '../../models/dto/refund-request.dto';
import { TransactionStatusUpdateDTO } from '../../models/dto/transaction-status-update.dto';
import { TransactionReceiptModalComponent } from '../../components/transaction-receipt-modal/transaction-receipt-modal.component';
import { ModalService } from '../../../../shared/services/modal.service';
import { catchError, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [CommonModule, TransactionReceiptModalComponent],
  templateUrl: './transaction-history.component.html',
  styleUrl: './transaction-history.component.scss',
})
export class TransactionHistoryComponent implements OnInit {
  transactions: Transaction[] = [];
  loading = false;
  error = '';

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  userId: number | null = null;

  selectedReceipt: TransactionReceiptDTO | null = null;

  constructor(
    private transactionService: TransactionService,
    private sessionService: SessionService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.userId = this.sessionService.getCurrentUserId();
    
    if (!this.userId) {
      this.error = 'Usuario no autenticado';
      return;
    }
    
    this.loadTransactions();
  }

  loadTransactions(): void {
    if (!this.userId) {
      this.error = 'Usuario no autenticado';
      return;
    }

    this.loading = true;
    this.error = '';

    this.transactionService
      .getPaymentHistory(this.userId)
      .subscribe({
        next: (transactions: any) => {
          this.transactions = transactions;
          this.loading = false;
        },
        error: (err: any) => {
          this.error = err.error?.message || 'Error al cargar las transacciones';
          this.loading = false;
        },
      });
  }

  viewReceipt(transactionId: number): void {
    this.transactionService.getPaymentReceipt(transactionId).subscribe({
      next: (response: TransactionReceiptDTO) => {
        console.log('Receipt data:', response);
        this.selectedReceipt = response;
      },
      error: (err) => {
        console.error('Error fetching receipt:', err);
        this.modalService.error('Error al obtener el recibo de la transacción.', 'Error de Recibo');
        this.selectedReceipt = null; // Ensure modal doesn't show on error
      },
    });
  }

  closeReceiptModal(): void {
    this.selectedReceipt = null;
  }

  // Placeholder for RAPP113935-107: Modify transaction status
  // This would typically be an admin action or triggered by a payment gateway callback
  // For demonstration, let's add a mock way to change status to 'cancelled'
  cancelTransaction(transactionId: number): void {
    this.modalService.showConfirm({
      title: 'Cancelar Transacción',
      message: `¿Estás seguro de que deseas cancelar la transacción ${transactionId}?`,
      type: 'warning',
      confirmText: 'Sí, cancelar',
      cancelText: 'No cancelar',
      details: [
        'Esta acción marcará la transacción como fallida',
        'Se actualizará el historial de transacciones'
      ]
    }).subscribe(confirmed => {
      if (confirmed) {
        const statusUpdate: TransactionStatusUpdateDTO = { statusName: 'FALLIDA' };
        this.transactionService
          .updateTransactionStatus(transactionId, statusUpdate)
          .pipe(
            switchMap(() => {
              // Reload history to reflect the change
              return this.transactionService.getPaymentHistory(this.userId!);
            }),
            catchError((err) => {
              console.error('Error cancelling transaction or reloading history:', err);
              this.modalService.error('Error al cancelar la transacción.', 'Error de Cancelación');
              return of([]);
            })
          )
          .subscribe(updatedTransactions => {
            this.transactions = updatedTransactions;
            this.modalService.success(`Actualización de estado de transacción ${transactionId} iniciada.`);
          });
      }
    });
  }

  // Placeholder for RAPP113935-111: Register Refund
  // This would typically involve more complex UI/logic
  requestRefund(transactionId: number): void {
    this.modalService.showPrompt({
      title: 'Solicitar Reembolso',
      message: 'Por favor, ingrese el motivo del reembolso:',
      placeholder: 'Motivo del reembolso...',
      confirmText: 'Continuar',
      cancelText: 'Cancelar',
      inputType: 'textarea'
    }).subscribe(reasonResult => {
      if (reasonResult.confirmed && reasonResult.value) {
        const reason = reasonResult.value;
        
        this.modalService.showConfirm({
          title: 'Tipo de Reembolso',
          message: '¿Es este un reembolso completo?',
          type: 'info',
          confirmText: 'Reembolso Completo',
          cancelText: 'Reembolso Parcial'
        }).subscribe(isFullRefund => {
          if (isFullRefund) {
            // Full refund
            this.processRefund(transactionId, reason, true);
          } else {
            // Partial refund - ask for ticket IDs
            this.modalService.showPrompt({
              title: 'Reembolso Parcial',
              message: 'Ingrese los IDs de tickets a reembolsar (separados por comas):',
              placeholder: 'Ej: 1, 2, 3',
              confirmText: 'Procesar Reembolso',
              cancelText: 'Cancelar'
            }).subscribe(ticketIdsResult => {
              if (ticketIdsResult.confirmed && ticketIdsResult.value) {
                const ticketIds = ticketIdsResult.value.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
                
                if (ticketIds.length === 0) {
                  this.modalService.error('IDs de tickets inválidos o no proporcionados.', 'Error de Validación');
                  return;
                }
                
                this.processRefund(transactionId, reason, false, ticketIds);
              } else {
                this.modalService.info('Reembolso parcial cancelado: No se proporcionaron IDs de tickets.');
              }
            });
          }
        });
      }
    });
  }

  private processRefund(transactionId: number, reason: string, fullRefund: boolean, ticketIds?: number[]): void {
    const refundRequest: RefundRequestDTO = {
      transactionId,
      reason,
      fullRefund,
    };

    if (!fullRefund && ticketIds && ticketIds.length > 0) {
      refundRequest.ticketIds = ticketIds;
    }

    this.transactionService.registerRefund(refundRequest).subscribe({
      next: (refundTransaction) => {
        this.modalService.success(`Reembolso para transacción ${transactionId} procesado. ID de reembolso: ${refundTransaction.id}`).subscribe(() => {
          this.loadTransactions();
        });
      },
      error: (err) => {
        console.error('Error processing refund:', err);
        this.modalService.error('Error al procesar el reembolso.', 'Error de Reembolso');
      },
    });
  }
}
