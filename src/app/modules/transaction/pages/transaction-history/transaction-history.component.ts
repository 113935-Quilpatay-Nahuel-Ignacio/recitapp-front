import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction';

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
  userId = 'user123';

  private transactionService = inject(TransactionService);

  ngOnInit(): void {
    this.loadTransactionHistory();
  }

  loadTransactionHistory(): void {
    this.errorMessage = null;
    this.transactions$ = this.transactionService
      .getPaymentHistory(this.userId, 1, 10) // Example pagination
      .pipe(
        catchError((err) => {
          console.error('Error fetching transaction history:', err);
          this.errorMessage = 'Failed to load transaction history.';
          return of([]); // Return empty array on error
        })
      );
  }

  viewReceipt(transactionId: string): void {
    this.transactionService.getPaymentReceipt(transactionId).subscribe({
      next: (response) => {
        if (response.receiptUrl) {
          window.open(response.receiptUrl, '_blank');
        } else {
          alert('Receipt URL not found.');
        }
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
  cancelTransaction(transactionId: string): void {
    this.transactionService
      .updateTransactionStatus(transactionId, 'cancelled')
      .pipe(
        switchMap(() => {
          // Reload history to reflect the change
          return this.transactionService.getPaymentHistory(this.userId, 1, 10);
        }),
        catchError((err) => {
          console.error('Error cancelling transaction or reloading history:', err);
          alert('Failed to cancel transaction.');
          return of([]); // Return empty array on error or keep existing data
        })
      )
      .subscribe(updatedTransactions => {
        this.transactions$ = of(updatedTransactions);
        alert(`Transaction ${transactionId} status update initiated.`);
      });
  }

  // Placeholder for RAPP113935-111: Register Refund
  // This would typically involve more complex UI/logic
  requestRefund(transactionId: string): void {
    const reason = prompt('Please enter reason for refund:');
    if (reason) {
      this.transactionService.registerRefund(transactionId, reason).subscribe({
        next: (refundTransaction) => {
          alert(`Refund for transaction ${transactionId} processed. Refund ID: ${refundTransaction.id}`);
          this.loadTransactionHistory(); // Refresh list
        },
        error: (err) => {
          console.error('Error processing refund:', err);
          alert('Failed to process refund.');
        },
      });
    }
  }
}
