import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Observable, of, BehaviorSubject, forkJoin } from 'rxjs';
import { catchError, switchMap, tap, map } from 'rxjs/operators';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction';
import { WalletTransactionDTO } from '../../models/dto/wallet-transaction.dto';
import { SessionService } from '../../../../core/services/session.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-virtual-wallet',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './virtual-wallet.component.html',
  styleUrl: './virtual-wallet.component.scss',
})
export class VirtualWalletComponent implements OnInit {
  walletForm!: FormGroup;
  walletBalance$: BehaviorSubject<number | null> = new BehaviorSubject<number | null>(null);
  recentTransactions$!: Observable<Transaction[]>;
  errorMessage: string | null = null;
  isLoading = false;
  userId: number | null = null;

  // User roles
  isAdmin = false;
  isModerador = false;
  isEventRegistrar = false;
  isComprador = false;
  isVerificadorEntradas = false;
  currentUser: any = null;

  private fb = inject(FormBuilder);
  private transactionService = inject(TransactionService);
  private sessionService = inject(SessionService);
  private authService = inject(AuthService);

  walletBalance: any = null;
  loading = false;
  error = '';
  success = '';

  // Recharge form
  rechargeAmount: number = 0;
  rechargeLoading = false;
  rechargeError = '';

  ngOnInit(): void {
    this.initializeUserRole();
    this.userId = this.sessionService.getCurrentUserId();
    
    if (!this.userId) {
      this.error = 'Usuario no autenticado';
      return;
    }
    
    this.walletForm = this.fb.group({
      amount: [null, [Validators.required, Validators.pattern(/^-?[0-9]+(\.[0-9]{1,2})?$/)]],
      currency: ['ARS', Validators.required],
      description: ['Ajuste de billetera'] // Descripción opcional para transacción de billetera
    });
    this.loadWalletData();
  }

  private initializeUserRole(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser && this.currentUser.role) {
      const userRole = this.currentUser.role.name;
      this.isAdmin = userRole === 'ADMIN';
      this.isModerador = userRole === 'MODERADOR';
      this.isEventRegistrar = userRole === 'REGISTRADOR_EVENTO';
      this.isComprador = userRole === 'COMPRADOR';
      this.isVerificadorEntradas = userRole === 'VERIFICADOR_ENTRADAS';
    }
  }

  loadWalletData(): void {
    this.isLoading = true;
    this.errorMessage = null;
    const numericUserId = Number(this.userId);
    if (isNaN(numericUserId)) {
      this.errorMessage = 'ID de Usuario inválido.';
      this.isLoading = false;
      return;
    }

    const balance$ = this.transactionService.getUserWalletBalance(numericUserId).pipe(
      catchError(err => {
        console.error('Error fetching wallet balance:', err);
        this.errorMessage = (this.errorMessage ? this.errorMessage + ' ' : '') + 'Error al cargar el saldo de la billetera.';
        return of(0); // Por defecto 0 en caso de error
      })
    );

    this.recentTransactions$ = this.transactionService.getPaymentHistory(numericUserId, undefined, undefined) // Obtener todas las recientes para el usuario, sin filtro de fecha por ahora, ajustar página/límite según sea necesario.
      .pipe(
        catchError((err) => {
          console.error('Error fetching recent transactions:', err);
          this.errorMessage = (this.errorMessage ? this.errorMessage + ' ' : '') + 'Error al cargar las transacciones recientes.';
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
      this.errorMessage = 'Por favor ingresa un monto y moneda válidos.';
      this.walletForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.errorMessage = null;

    const formValue = this.walletForm.value;
    const amount = parseFloat(formValue.amount);
    const numericUserId = Number(this.userId);

    if (isNaN(numericUserId)) {
      this.errorMessage = 'ID de Usuario inválido para el ajuste de saldo.';
      this.isLoading = false;
      return;
    }
    if (isNaN(amount)) {
        this.errorMessage = 'El monto debe ser un número válido.';
        this.isLoading = false;
        return;
    }

    const walletTransaction: WalletTransactionDTO = {
      userId: numericUserId,
      operation: amount >= 0 ? 'ADD' : 'SUBTRACT',
      amount: Math.abs(amount), // El monto debe ser positivo para el DTO
      currency: formValue.currency,
      description: formValue.description || (amount >=0 ? 'Depósito a billetera' : 'Retiro de billetera')
    };

    this.transactionService.updateVirtualWalletBalance(walletTransaction)
      .pipe(
        switchMap(() => {
          // Recargar saldo de billetera y transacciones recientes después del ajuste
          this.walletForm.reset({ currency: 'ARS', description: 'Ajuste de billetera' });
          return forkJoin([
            this.transactionService.getUserWalletBalance(numericUserId).pipe(catchError(() => of(this.walletBalance$.value))), // Mantener saldo anterior en caso de error
            this.transactionService.getPaymentHistory(numericUserId, undefined, undefined).pipe(catchError(() => of([]))) // Transacciones vacías en caso de error
          ]);
        }),
        catchError((err) => {
          console.error('Error updating wallet balance:', err);
          this.errorMessage = 'Error al actualizar el saldo de la billetera.';
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

  // Note: rechargeWallet method removed as it doesn't exist in TransactionService
  // The wallet adjustment functionality is available through the adjustBalance method above
} 