import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, startWith, switchMap, tap } from 'rxjs/operators';
import { TransactionService } from '../../services/transaction.service';
import { PaymentMethodDTO } from '../../models/dto';

@Component({
  selector: 'app-payment-method-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment-method-management.component.html',
  styleUrl: './payment-method-management.component.scss',
})
export class PaymentMethodManagementComponent implements OnInit {
  paymentMethods$!: Observable<PaymentMethodDTO[]>;
  paymentMethodForm!: FormGroup;
  editingPaymentMethod: PaymentMethodDTO | null = null;
  errorMessage: string | null = null;
  isLoading = false;
  successMessage: string | null = null;

  private fb = inject(FormBuilder);
  private transactionService = inject(TransactionService);

  ngOnInit(): void {
    this.paymentMethodForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      active: [true, Validators.required],
    });
    this.loadPaymentMethods();
  }

  loadPaymentMethods(): void {
    this.isLoading = true;
    this.paymentMethods$ = this.transactionService
      .getAvailablePaymentMethods()
      .pipe(
        tap(() => (this.isLoading = false)),
        catchError((err) => {
          this.errorMessage = 'Failed to load payment methods.';
          this.isLoading = false;
          console.error(err);
          return of([]);
        })
      );
  }

  editPaymentMethod(pm: PaymentMethodDTO): void {
    this.editingPaymentMethod = pm;
    this.successMessage = null;
    this.errorMessage = null;
    this.paymentMethodForm.setValue({
      name: pm.name,
      description: pm.description || '',
      active: pm.active,
    });
  }

  cancelEdit(): void {
    this.editingPaymentMethod = null;
    this.paymentMethodForm.reset({ active: true, name: '', description: '' });
    this.successMessage = null;
    this.errorMessage = null;
  }

  deletePaymentMethod(id: number): void {
    if (confirm('Are you sure you want to delete this payment method?')) {
      this.isLoading = true;
      this.errorMessage = null;
      this.successMessage = null;
      this.transactionService
        .deletePaymentMethod(id)
        .pipe(
          tap(() => {
            this.isLoading = false;
            this.successMessage = 'Payment method deleted successfully.';
            this.loadPaymentMethods(); // Refresh list
            this.cancelEdit();
          }),
          catchError((err) => {
            this.isLoading = false;
            this.errorMessage =
              err.error?.message || 'Failed to delete payment method.';
            console.error(err);
            return of(null);
          })
        )
        .subscribe();
    }
  }

  onSubmit(): void {
    if (this.paymentMethodForm.invalid) {
      this.errorMessage = 'Please fill all required fields.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    const formValue = this.paymentMethodForm.value;

    const dto: PaymentMethodDTO = {
      id: this.editingPaymentMethod ? this.editingPaymentMethod.id : 0, // ID is ignored by backend for create
      name: formValue.name,
      description: formValue.description,
      active: formValue.active,
    };

    let operation$: Observable<PaymentMethodDTO | void>;

    if (this.editingPaymentMethod) {
      operation$ = this.transactionService.updatePaymentMethod(dto.id, dto);
    } else {
      operation$ = this.transactionService.createPaymentMethod(dto);
    }

    operation$
      .pipe(
        tap(() => {
          this.isLoading = false;
          this.successMessage = `Payment method ${this.editingPaymentMethod ? 'updated' : 'created'} successfully.`;
          this.loadPaymentMethods();
          this.cancelEdit();
        }),
        catchError((err) => {
          this.isLoading = false;
          this.errorMessage =
            err.error?.message ||
            (this.editingPaymentMethod
              ? 'Failed to update payment method.'
              : 'Failed to create payment method.');
          console.error(err);
          return of(null);
        })
      )
      .subscribe();
  }
} 