import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
  TransactionDTO,
  PaymentMethodDTO,
  TransactionStatusUpdateDTO,
  TransactionReceiptDTO,
  RefundRequestDTO,
  TransactionReportDTO,
  TransactionStatisticsDTO,
  WalletTransactionDTO,
} from '../models/dto'; // Assuming index.ts exports all DTOs

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}`; // Removed /v1

  constructor() {}

  // Corresponds to RAPP113935-97 / [POST] /transactions
  createTransaction(transactionData: Partial<TransactionDTO>): Observable<TransactionDTO> {
    return this.http.post<TransactionDTO>(`${this.baseUrl}/transactions`, transactionData)
      .pipe(catchError(this.handleError));
  }

  // Corresponds to RAPP113935-98 / [PATCH] /transactions/{transactionId}/status
  updateTransactionStatus(
    transactionId: number,
    statusUpdateDTO: TransactionStatusUpdateDTO
  ): Observable<TransactionDTO> {
    return this.http.patch<TransactionDTO>(
      `${this.baseUrl}/transactions/${transactionId}/status`,
      statusUpdateDTO
    ).pipe(catchError(this.handleError));
  }

  // Corresponds to RAPP113935-99 / [GET] /transactions/user/{userId}
  getPaymentHistory(
    userId: number,
    startDate?: string, // LocalDateTime as ISO string
    endDate?: string   // LocalDateTime as ISO string
  ): Observable<TransactionDTO[]> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    return this.http.get<TransactionDTO[]>(
      `${this.baseUrl}/transactions/user/${userId}`,
      { params }
    ).pipe(catchError(this.handleError));
  }

  // Corresponds to RAPP113935-100 / [GET] /transactions/{transactionId}/receipt
  getPaymentReceipt(transactionId: number): Observable<TransactionReceiptDTO> {
    return this.http.get<TransactionReceiptDTO>(
      `${this.baseUrl}/transactions/${transactionId}/receipt`
    ).pipe(catchError(this.handleError));
  }

  // Corresponds to [POST] /transactions/report
  generateTransactionReport(reportDTO: TransactionReportDTO): Observable<TransactionStatisticsDTO> {
    return this.http.post<TransactionStatisticsDTO>(`${this.baseUrl}/transactions/report`, reportDTO)
      .pipe(catchError(this.handleError));
  }

  // Corresponds to RAPP113935-102 / [POST] /transactions/refund
  registerRefund(refundRequest: RefundRequestDTO): Observable<TransactionDTO> {
    return this.http.post<TransactionDTO>(`${this.baseUrl}/transactions/refund`, refundRequest)
      .pipe(catchError(this.handleError));
  }

  // Enhanced refund with MercadoPago integration and wallet fallback
  registerEnhancedRefund(refundRequest: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/transactions/refund/enhanced`, refundRequest)
      .pipe(catchError(this.handleError));
  }

  // Corresponds to RAPP113935-103 / [GET] /payment-methods
  getAvailablePaymentMethods(includeInactive: boolean = false): Observable<PaymentMethodDTO[]> {
    let params = new HttpParams();
    if (includeInactive) {
      params = params.set('includeInactive', 'true');
    }
    return this.http.get<PaymentMethodDTO[]>(`${this.baseUrl}/payment-methods`, { params })
      .pipe(catchError(this.handleError));
  }

  // Corresponds to RAPP113935-104 / [POST] /wallet/transaction
  updateVirtualWalletBalance(walletTransactionDTO: WalletTransactionDTO): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/wallet/transaction`, walletTransactionDTO)
      .pipe(catchError(this.handleError));
  }
  
  // Added based on WalletController: [GET] /wallet/balance/{userId}
  getUserWalletBalance(userId: number): Observable<number> { // Backend returns BigDecimal
    return this.http.get<number>(`${this.baseUrl}/wallet/balance/${userId}`)
      .pipe(catchError(this.handleError));
  }

  // Corresponds to [POST] /payment-methods (from PaymentMethodController)
  createPaymentMethod(paymentMethodDTO: PaymentMethodDTO): Observable<PaymentMethodDTO> {
    return this.http.post<PaymentMethodDTO>(`${this.baseUrl}/payment-methods`, paymentMethodDTO)
      .pipe(catchError(this.handleError));
  }

  // Corresponds to [PUT] /payment-methods/{paymentMethodId}
  updatePaymentMethod(paymentMethodId: number, paymentMethodDTO: PaymentMethodDTO): Observable<PaymentMethodDTO> {
    return this.http.put<PaymentMethodDTO>(`${this.baseUrl}/payment-methods/${paymentMethodId}`, paymentMethodDTO)
      .pipe(catchError(this.handleError));
  }

  // Corresponds to [DELETE] /payment-methods/{paymentMethodId}
  deletePaymentMethod(paymentMethodId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/payment-methods/${paymentMethodId}`)
      .pipe(catchError(this.handleError));
  }

  // Generic error handler
  private handleError(error: any) {
    console.error('API Error:', error);
    // Customize error handling (e.g., user-facing messages, logging service)
    return throwError(() => new Error('An API error occurred. Please try again later.'));
  }
}
