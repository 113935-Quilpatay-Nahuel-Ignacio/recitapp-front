import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
      status: [''], // Optional: filter by status
      userId: [''], // Optional: filter by user ID
    });
  }

  generateReport(): void {
    if (this.reportForm.invalid) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }
    this.errorMessage = null;
    this.isLoading = true;

    const criteria = this.reportForm.value;
    // Basic date validation: endDate should not be before startDate
    if (criteria.startDate && criteria.endDate && criteria.endDate < criteria.startDate) {
      this.errorMessage = 'End date cannot be before start date.';
      this.isLoading = false;
      this.reportData$ = of([]); // Clear previous report data
      return;
    }

    this.reportData$ = this.transactionService
      .generateTransactionReport(criteria)
      .pipe(
        catchError((err) => {
          console.error('Error generating report:', err);
          this.errorMessage = 'Failed to generate report. Please try again.';
          return of([]); // Return empty array on error
        })
      );
    
    // Simulate loading finished, in a real app this would be handled by the observable completing
    this.reportData$.subscribe(() => this.isLoading = false);
  }
} 