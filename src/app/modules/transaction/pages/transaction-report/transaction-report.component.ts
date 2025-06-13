import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { TransactionService } from '../../services/transaction.service';
import {
  TransactionReportDTO,
  TransactionStatisticsDTO,
} from '../../models/dto';

@Component({
  selector: 'app-transaction-report',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transaction-report.component.html',
  styleUrl: './transaction-report.component.scss',
})
export class TransactionReportComponent implements OnInit {
  reportForm!: FormGroup;
  reportData$!: Observable<TransactionStatisticsDTO | null>;
  errorMessage: string | null = null;
  isLoading = false;

  // Method to use Object.keys in the template
  objectKeys = Object.keys;

  reportTypes: { value: TransactionReportDTO['reportType']; label: string }[] = [
    { value: 'ALL', label: 'Todos los Reportes' },
    { value: 'USER', label: 'Por Usuario' },
    { value: 'PAYMENT_METHOD', label: 'Por Método de Pago' },
    { value: 'STATUS', label: 'Por Estado' },
  ];

  transactionStatuses: string[] = [
    'INICIADA',
    'COMPLETADA',
    'FALLIDA',
    'REEMBOLSADA',
    'CANCELADA',
    'PENDIENTE',
  ];

  paymentMethods: { id: number; name: string }[] = [
    { id: 1, name: 'Tarjeta de Crédito' },
    { id: 2, name: 'PayPal' },
    { id: 3, name: 'Transferencia Bancaria' },
  ];

  private fb = inject(FormBuilder);
  private transactionService = inject(TransactionService);

  ngOnInit(): void {
    this.reportForm = this.fb.group({
      reportType: ['ALL' as TransactionReportDTO['reportType'], Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      userId: [null as number | null],
      paymentMethodId: [null as number | null],
      statusName: ['' as string | null],
    });

    this.reportForm.get('reportType')?.valueChanges.subscribe((type) => {
      const userIdControl = this.reportForm.get('userId');
      const paymentMethodIdControl = this.reportForm.get('paymentMethodId');
      const statusNameControl = this.reportForm.get('statusName');

      userIdControl?.clearValidators();
      paymentMethodIdControl?.clearValidators();
      statusNameControl?.clearValidators();

      if (type === 'USER') {
        userIdControl?.setValidators(Validators.required);
      } else if (type === 'PAYMENT_METHOD') {
        paymentMethodIdControl?.setValidators(Validators.required);
      } else if (type === 'STATUS') {
        statusNameControl?.setValidators(Validators.required);
      }

      userIdControl?.updateValueAndValidity();
      paymentMethodIdControl?.updateValueAndValidity();
      statusNameControl?.updateValueAndValidity();
    });
  }

  getReportTypeLabel(reportType: string): string {
    const type = this.reportTypes.find(t => t.value === reportType);
    return type ? type.label : reportType;
  }

  generateReport(): void {
    if (this.reportForm.invalid) {
      this.errorMessage = 'Por favor completa todos los campos requeridos para el tipo de reporte seleccionado.';
      this.reportForm.markAllAsTouched();
      Object.keys(this.reportForm.controls).forEach(key => {
        const controlErrors = this.reportForm.get(key)?.errors;
        if (controlErrors != null) {
          console.error('Key: ' + key + ', Error: ', controlErrors);
        }
      });
      return;
    }
    this.errorMessage = null;
    this.isLoading = true;
    this.reportData$ = of(null);

    const formValue = this.reportForm.value;

    if (formValue.startDate && formValue.endDate && formValue.endDate < formValue.startDate) {
      this.errorMessage = 'La fecha de fin no puede ser anterior a la fecha de inicio.';
      this.isLoading = false;
      return;
    }

    // Agregar tiempo a las fechas para coincidir con el formato LocalDateTime esperado por el backend
    const startDateWithTime = formValue.startDate ? `${formValue.startDate}T00:00:00` : '';
    const endDateWithTime = formValue.endDate ? `${formValue.endDate}T23:59:59` : '';

    const reportDTO: TransactionReportDTO = {
      reportType: formValue.reportType,
      startDate: startDateWithTime,
      endDate: endDateWithTime,
      userId: formValue.reportType === 'USER' && formValue.userId ? Number(formValue.userId) : undefined,
      paymentMethodId: formValue.reportType === 'PAYMENT_METHOD' && formValue.paymentMethodId ? Number(formValue.paymentMethodId) : undefined,
      statusName: formValue.reportType === 'STATUS' && formValue.statusName ? formValue.statusName : undefined,
    };

    this.reportData$ = this.transactionService
      .generateTransactionReport(reportDTO)
      .pipe(
        tap(() => (this.isLoading = false)),
        catchError((err) => {
          console.error('Error generating transaction report:', err);
          this.errorMessage =
            err.error?.message || err.message || 'Error al generar el reporte de transacciones. Por favor intenta de nuevo.';
          this.isLoading = false;
          return of(null);
        })
      );
  }
} 