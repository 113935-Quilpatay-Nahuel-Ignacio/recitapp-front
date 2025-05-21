import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction';

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
  userId = 'user123'; // Example User ID, replace with actual user management

  private fb = inject(FormBuilder);
  private transactionService = inject(TransactionService);

  ngOnInit(): void {
    this.walletForm = this.fb.group({
      amount: [null, [Validators.required, Validators.pattern(/^-?[0-9]+(\.[0-9]{1,2})?$/)]],
      currency: ['USD', Validators.required], // Default or selectable
    });
    this.loadWalletData();
  }

  loadWalletData(): void {
    this.isLoading = true;
    this.errorMessage = null;
    // Mock fetching initial balance by looking at the last wallet transaction
    // In a real app, you'd have a dedicated endpoint for current balance.
    this.transactionService.getPaymentHistory(this.userId, 1, 5, 'VirtualWallet').pipe(
      tap(transactions => {
        const lastWalletTx = transactions.find(tx => tx.paymentMethod === 'VirtualWallet' && tx.walletBalance !== undefined);
        if (lastWalletTx && lastWalletTx.walletBalance !== undefined) {
          this.walletBalance$.next(lastWalletTx.walletBalance);
        } else {
          this.walletBalance$.next(0); // Default to 0 if no history or balance info
        }
        this.isLoading = false;
      }),
      catchError(err => {
        console.error('Error fetching wallet history for balance:', err);
        this.errorMessage = 'Failed to load wallet balance.';
        this.walletBalance$.next(0);
        this.isLoading = false;
        return of([]);
      })
    ).subscribe();

    this.recentTransactions$ = this.transactionService.getPaymentHistory(this.userId, 1, 5, 'VirtualWallet')
      .pipe(
        catchError((err) => {
          console.error('Error fetching recent wallet transactions:', err);
          this.errorMessage = (this.errorMessage ? this.errorMessage + ' ' : '') + 'Failed to load recent transactions.';
          return of([]);
        })
      );
  }

  adjustBalance(): void {
    if (this.walletForm.invalid) {
      this.errorMessage = 'Please enter a valid amount and currency.';
      return;
    }
    this.isLoading = true;
    this.errorMessage = null;

    const { amount, currency } = this.walletForm.value;

    this.transactionService.updateVirtualWalletBalance(this.userId, amount, currency)
      .pipe(
        tap(transaction => {
          // Update balance based on the mock service logic
          if (transaction.walletBalance !== undefined) {
            this.walletBalance$.next(transaction.walletBalance);
          }
          this.walletForm.reset({ currency: 'USD' });
        }),
        // Reload recent transactions
        switchMap(() => this.transactionService.getPaymentHistory(this.userId, 1, 5, 'VirtualWallet')),
        catchError((err) => {
          console.error('Error updating wallet balance:', err);
          this.errorMessage = 'Failed to update wallet balance.';
          this.isLoading = false;
          return of(null); // Prevent breaking the chain
        })
      )
      .subscribe(transactions => {
        if (transactions) {
          this.recentTransactions$ = of(transactions);
        }
        this.isLoading = false;
      });
  }
} 