import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction';
import { SessionService } from '../../../../core/services/session.service';
import { TransactionReceiptDTO } from '../../models/dto/transaction-receipt.dto';
import { RefundRequestDTO } from '../../models/dto/refund-request.dto';
import { TransactionStatusUpdateDTO } from '../../models/dto/transaction-status-update.dto';
import { TransactionReceiptModalComponent } from '../../components/transaction-receipt-modal/transaction-receipt-modal.component';
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
    private sessionService: SessionService
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
        alert('Failed to fetch receipt.');
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
          alert('Failed to cancel transaction.');
          return of([]);
        })
      )
      .subscribe(updatedTransactions => {
        this.transactions = updatedTransactions;
        alert(`Transaction ${transactionId} status update initiated.`);
      });
  }

  // Placeholder for RAPP113935-111: Register Refund
  // This would typically involve more complex UI/logic
  requestRefund(transactionId: number): void {
    const reason = prompt('Please enter reason for refund:');
    if (reason) {
      const isFullRefund = confirm('Is this a full refund?');
      let ticketIds: number[] | undefined;

      if (!isFullRefund) {
        const ticketIdsString = prompt(
          'This is a partial refund. Please enter comma-separated Ticket IDs to refund:'
        );
        if (ticketIdsString) {
          ticketIds = ticketIdsString.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
        } else {
          // User cancelled or entered no ticket IDs for partial refund
          alert('Partial refund cancelled: No ticket IDs provided.');
          return;
        }
        if (!ticketIds || ticketIds.length === 0) {
            alert('Partial refund cancelled: Invalid or no ticket IDs provided.');
            return;
        }
      }

      const refundRequest: RefundRequestDTO = {
        transactionId,
        reason,
        fullRefund: isFullRefund,
      };

      if (!isFullRefund && ticketIds && ticketIds.length > 0) {
        refundRequest.ticketIds = ticketIds;
      }

      this.transactionService.registerRefund(refundRequest).subscribe({
        next: (refundTransaction) => {
          alert(`Refund for transaction ${transactionId} processed. Refund ID: ${refundTransaction.id}`);
          this.loadTransactions();
        },
        error: (err) => {
          console.error('Error processing refund:', err);
          alert('Failed to process refund.');
        },
      });
    }
  }
}
