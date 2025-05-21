import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable, map } from 'rxjs';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment-form.component.html',
  styleUrl: './payment-form.component.scss',
})
export class PaymentFormComponent implements OnInit {
  paymentForm!: FormGroup;
  availablePaymentMethods$!: Observable<string[]>;
  submissionMessage: string | null = null;

  private fb = inject(FormBuilder);
  private transactionService = inject(TransactionService);

  ngOnInit(): void {
    this.paymentForm = this.fb.group({
      userId: ['user123', Validators.required], // Example User ID
      amount: [null, [Validators.required, Validators.min(0.01)]],
      currency: ['USD', Validators.required],
      paymentMethod: ['', Validators.required],
      description: [''],
      eventId: [''], // Optional
    });

    this.availablePaymentMethods$ =
      this.transactionService.getAvailablePaymentMethods().pipe(
        map(methods => methods.map(method => method.name))
      );
  }

  onSubmit(): void {
    this.submissionMessage = null;
    if (this.paymentForm.invalid) {
      this.submissionMessage = 'Please fill all required fields correctly.';
      return;
    }

    const transactionData: Partial<Transaction> = this.paymentForm.value;

    this.transactionService.createTransaction(transactionData).subscribe({
      next: (createdTransaction) => {
        this.submissionMessage = `Transaction created successfully! ID: ${createdTransaction.id}`;
        console.log('Transaction created:', createdTransaction);
        this.paymentForm.reset({
          userId: 'user123',
          currency: 'USD',
          paymentMethod: '',
          description: '',
          eventId: ''
        });
      },
      error: (err) => {
        this.submissionMessage = 'Transaction failed. Please try again.';
        console.error('Error creating transaction:', err);
      },
    });
  }
}
