import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction';

@Component({
  selector: 'app-transaction-report',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transaction-report.component.html',
  styleUrl: './transaction-report.component.scss',
})
export class TransactionReportComponent implements OnInit {
  reportForm!: FormGroup;
  reportData$!: Observable<Transaction[]>;
  errorMessage: string | null = null;
  isLoading = false;

  transactionStatuses: string[] = [
    'pending',
    'completed',
    'failed',
    'refunded',
    'cancelled',
  ];

  private fb = inject(FormBuilder);
  private transactionService = inject(TransactionService);

  ngOnInit(): void {
    this.reportForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      status: [''],
      userId: ['', Validators.required],
    });
  }

  generateReport(): void {
    if (this.reportForm.invalid) {
      this.errorMessage = 'Please fill in User ID, Start Date, and End Date.';
      this.reportForm.markAllAsTouched();
      return;
    }
    this.errorMessage = null;
    this.isLoading = true;

    const criteria = this.reportForm.value;
    if (criteria.startDate && criteria.endDate && criteria.endDate < criteria.startDate) {
      this.errorMessage = 'End date cannot be before start date.';
      this.isLoading = false;
      this.reportData$ = of([]);
      return;
    }

    const userId = Number(criteria.userId);
    if (isNaN(userId)) {
        this.errorMessage = 'User ID must be a valid number.';
        this.isLoading = false;
        this.reportData$ = of([]);
        return;
    }

    this.reportData$ = this.transactionService
      .getPaymentHistory(userId, criteria.startDate, criteria.endDate)
      .pipe(
        map((transactions: Transaction[]) => {
          if (criteria.status) {
            return transactions.filter(tx => tx.statusName.toLowerCase() === criteria.status.toLowerCase());
          }
          return transactions;
        }),
        catchError((err) => {
          console.error('Error fetching transaction history for report:', err);
          this.errorMessage = 'Failed to fetch transaction data. Please try again.';
          return of([]);
        }),
        tap(() => this.isLoading = false)
      );
  }
} 