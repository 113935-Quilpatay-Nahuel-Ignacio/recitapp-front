import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction';
import { TransactionReceiptDTO } from '../../models/dto/transaction-receipt.dto';
import { RefundRequestDTO } from '../../models/dto/refund-request.dto';
import { TransactionStatusUpdateDTO } from '../../models/dto/transaction-status-update.dto';

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction-history.component.html',
  styleUrl: './transaction-history.component.scss',
})
export class TransactionHistoryComponent implements OnInit {
  transactions$!: Observable<Transaction[]>;
  errorMessage: string | null = null;
  // Example User ID, in a real app this would come from auth service or input
  userId = 123;

  private transactionService = inject(TransactionService);

  ngOnInit(): void {
    this.loadTransactionHistory();
  }

  loadTransactionHistory(): void {
    this.errorMessage = null;
    this.transactions$ = this.transactionService
      .getPaymentHistory(this.userId)
      .pipe(
        catchError((err) => {
          console.error('Error fetching transaction history:', err);
          this.errorMessage = 'Failed to load transaction history.';
          return of([]);
        })
      );
  }

  viewReceipt(transactionId: number): void {
    this.transactionService.getPaymentReceipt(transactionId).subscribe({
      next: (response: TransactionReceiptDTO) => {
        console.log('Receipt data:', response);
        alert(`Receipt details for Tx ID ${transactionId} logged to console. No direct 'receiptUrl' field found in response.`);
      },
      error: (err) => {
        console.error('Error fetching receipt:', err);
        alert('Failed to fetch receipt.');
      },
    });
  }

  // Placeholder for RAPP113935-107: Modify transaction status
  // This would typically be an admin action or triggered by a payment gateway callback
  // For demonstration, let's add a mock way to change status to 'cancelled'
  cancelTransaction(transactionId: number): void {
    const statusUpdate: TransactionStatusUpdateDTO = { statusName: 'cancelled' };
    this.transactionService
      .updateTransactionStatus(transactionId, statusUpdate)
      .pipe(
        switchMap(() => {
          // Reload history to reflect the change
          return this.transactionService.getPaymentHistory(this.userId);
        }),
        catchError((err) => {
          console.error('Error cancelling transaction or reloading history:', err);
          alert('Failed to cancel transaction.');
          return of([]);
        })
      )
      .subscribe(updatedTransactions => {
        this.transactions$ = of(updatedTransactions);
        alert(`Transaction ${transactionId} status update initiated.`);
      });
  }

  // Placeholder for RAPP113935-111: Register Refund
  // This would typically involve more complex UI/logic
  requestRefund(transactionId: number): void {
    const reason = prompt('Please enter reason for refund:');
    if (reason) {
      const refundRequest: RefundRequestDTO = { transactionId, reason };
      this.transactionService.registerRefund(refundRequest).subscribe({
        next: (refundTransaction) => {
          alert(`Refund for transaction ${transactionId} processed. Refund ID: ${refundTransaction.id}`);
          this.loadTransactionHistory();
        },
        error: (err) => {
          console.error('Error processing refund:', err);
          alert('Failed to process refund.');
        },
      });
    }
  }
}
