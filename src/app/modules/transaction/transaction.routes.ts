import { Routes } from '@angular/router';
import { PaymentFormComponent } from './pages/payment-form/payment-form.component';
import { TransactionHistoryComponent } from './pages/transaction-history/transaction-history.component';
import { TransactionReportComponent } from './pages/transaction-report/transaction-report.component';
import { VirtualWalletComponent } from './pages/virtual-wallet/virtual-wallet.component';

export const TRANSACTION_ROUTES: Routes = [
  {
    path: 'payment', // e.g., /transactions/payment
    component: PaymentFormComponent,
    title: 'Make Payment',
  },
  {
    path: 'history', // e.g., /transactions/history
    component: TransactionHistoryComponent,
    title: 'Transaction History',
  },
  {
    path: 'report', // e.g., /transactions/report
    component: TransactionReportComponent,
    title: 'Transaction Report',
  },
  {
    path: 'wallet', // e.g., /transactions/wallet
    component: VirtualWalletComponent,
    title: 'Virtual Wallet',
  },
  {
    path: '',
    redirectTo: 'history', // Default route for /transactions
    pathMatch: 'full',
  },
]; 