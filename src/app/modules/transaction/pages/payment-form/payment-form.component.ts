import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable, map } from 'rxjs';
import { TransactionService } from '../../services/transaction.service';
import { TransactionDTO, PaymentMethodDTO, TransactionDetailDTO } from '../../models/dto';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment-form.component.html',
  styleUrl: './payment-form.component.scss',
})
export class PaymentFormComponent implements OnInit {
  paymentForm!: FormGroup;
  availablePaymentMethods$!: Observable<PaymentMethodDTO[]>;
  submissionMessage: string | null = null;

  private fb = inject(FormBuilder);
  private transactionService = inject(TransactionService);

  ngOnInit(): void {
    this.paymentForm = this.fb.group({
      userId: ['4', Validators.required],
      paymentMethodId: [null, Validators.required],
      totalAmount: [null, [Validators.required, Validators.min(0.01)]],
      externalReference: [''],
      description: [''],
      currency: ['ARS', Validators.required],
      details: this.fb.array([]),
    });

    this.availablePaymentMethods$ = this.transactionService.getAvailablePaymentMethods();
  }

  get details(): FormArray {
    return this.paymentForm.get('details') as FormArray;
  }

  newDetail(): FormGroup {
    return this.fb.group({
      ticketId: [null, Validators.required],
      unitPrice: [null, [Validators.required, Validators.min(0.01)]],
    });
  }

  addDetail(): void {
    this.details.push(this.newDetail());
  }

  removeDetail(index: number): void {
    this.details.removeAt(index);
  }

  onSubmit(): void {
    this.submissionMessage = null;
    if (this.paymentForm.invalid) {
      this.submissionMessage = 'Please fill all required fields correctly, including all ticket details.';
      this.paymentForm.markAllAsTouched();
      this.details.controls.forEach(control => (control as FormGroup).markAllAsTouched());
      return;
    }

    const formValue = this.paymentForm.value;

    const transactionData: Partial<TransactionDTO> = {
      userId: Number(formValue.userId),
      paymentMethodId: Number(formValue.paymentMethodId),
      totalAmount: Number(formValue.totalAmount),
      externalReference: formValue.externalReference,
      description: formValue.description,
      details: formValue.details.map((detail: any) => ({
        ticketId: Number(detail.ticketId),
        unitPrice: Number(detail.unitPrice),
      })),
    };

    this.transactionService.createTransaction(transactionData).subscribe({
      next: (createdTransaction) => {
        this.submissionMessage = `Transaction created successfully! ID: ${createdTransaction.id}`;
        console.log('Transaction created:', createdTransaction);
        this.paymentForm.reset({
          userId: '4',
          paymentMethodId: null,
          totalAmount: null,
          externalReference: '',
          description: '',
          currency: 'ARS',
        });
        this.details.clear();
      },
      error: (err) => {
        this.submissionMessage = 'Transaction failed. Please try again.';
        console.error('Error creating transaction:', err);
        if (err.error && typeof err.error.message === 'string') {
          this.submissionMessage += ` (Server: ${err.error.message})`;
        } else if (err.error && typeof err.error === 'object' && err.error.message) {
          this.submissionMessage += ` (Server: ${err.error.message})`;
        } else if (typeof err.error === 'string') {
          this.submissionMessage += ` (Server: ${err.error})`;
        }
      },
    });
  }
}
