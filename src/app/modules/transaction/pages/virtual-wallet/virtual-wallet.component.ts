import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Observable, of, BehaviorSubject, forkJoin } from 'rxjs';
import { catchError, switchMap, tap, map } from 'rxjs/operators';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction';
import { WalletTransactionDTO } from '../../models/dto/wallet-transaction.dto';

@Component({
  selector: 'app-virtual-wallet',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './virtual-wallet.component.html',
  styleUrl: './virtual-wallet.component.scss',
})
export class VirtualWalletComponent implements OnInit {
  walletForm!: FormGroup;
  walletBalance$: BehaviorSubject<number | null> = new BehaviorSubject<number | null>(null);
  recentTransactions$!: Observable<Transaction[]>;
  errorMessage: string | null = null;
  isLoading = false;
  userId = 123; // Example User ID, ensure this is a number

  private fb = inject(FormBuilder);
  private transactionService = inject(TransactionService);

  ngOnInit(): void {
    this.walletForm = this.fb.group({
      amount: [null, [Validators.required, Validators.pattern(/^-?[0-9]+(\.[0-9]{1,2})?$/)]],
      currency: ['USD', Validators.required],
      description: ['Wallet adjustment'] // Optional description for wallet transaction
    });
    this.loadWalletData();
  }

  loadWalletData(): void {
    this.isLoading = true;
    this.errorMessage = null;
    const numericUserId = Number(this.userId);
    if (isNaN(numericUserId)) {
      this.errorMessage = 'Invalid User ID.';
      this.isLoading = false;
      return;
    }

    const balance$ = this.transactionService.getUserWalletBalance(numericUserId).pipe(
      catchError(err => {
        console.error('Error fetching wallet balance:', err);
        this.errorMessage = (this.errorMessage ? this.errorMessage + ' ' : '') + 'Failed to load wallet balance.';
        return of(0); // Default to 0 on error
      })
    );

    this.recentTransactions$ = this.transactionService.getPaymentHistory(numericUserId, undefined, undefined) // Fetch all recent for user, no date filter for now, adjust page/limit as needed.
      .pipe(
        catchError((err) => {
          console.error('Error fetching recent transactions:', err);
          this.errorMessage = (this.errorMessage ? this.errorMessage + ' ' : '') + 'Failed to load recent transactions.';
          return of([]);
        })
      );
      
    forkJoin([balance$, this.recentTransactions$]).subscribe(
      ([balance, transactions]) => {
        this.walletBalance$.next(balance);
        // transactions are already assigned to this.recentTransactions$
        this.isLoading = false;
      },
      () => {
        // Error already handled in individual streams, just stop loading
        this.isLoading = false;
      }
    );
  }

  adjustBalance(): void {
    if (this.walletForm.invalid) {
      this.errorMessage = 'Please enter a valid amount and currency.';
      this.walletForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.errorMessage = null;

    const formValue = this.walletForm.value;
    const amount = parseFloat(formValue.amount);
    const numericUserId = Number(this.userId);

    if (isNaN(numericUserId)) {
      this.errorMessage = 'Invalid User ID for balance adjustment.';
      this.isLoading = false;
      return;
    }
    if (isNaN(amount)) {
        this.errorMessage = 'Amount must be a valid number.';
        this.isLoading = false;
        return;
    }

    const walletTransaction: WalletTransactionDTO = {
      userId: numericUserId,
      operation: amount >= 0 ? 'ADD' : 'SUBTRACT',
      amount: Math.abs(amount), // Amount should be positive for the DTO
      currency: formValue.currency,
      description: formValue.description || (amount >=0 ? 'Deposit to wallet' : 'Withdrawal from wallet')
    };

    this.transactionService.updateVirtualWalletBalance(walletTransaction)
      .pipe(
        switchMap(() => {
          // Reload wallet balance and recent transactions after adjustment
          this.walletForm.reset({ currency: 'USD', description: 'Wallet adjustment' });
          return forkJoin([
            this.transactionService.getUserWalletBalance(numericUserId).pipe(catchError(() => of(this.walletBalance$.value))), // Keep old balance on error
            this.transactionService.getPaymentHistory(numericUserId, undefined, undefined).pipe(catchError(() => of([]))) // Empty transactions on error
          ]);
        }),
        catchError((err) => {
          console.error('Error updating wallet balance:', err);
          this.errorMessage = 'Failed to update wallet balance.';
          this.isLoading = false;
          return of(null); 
        })
      )
      .subscribe(response => {
        if (response) {
          const [newBalance, newTransactions] = response;
          this.walletBalance$.next(newBalance);
          this.recentTransactions$ = of(newTransactions);
        }
        this.isLoading = false;
      });
  }
} 