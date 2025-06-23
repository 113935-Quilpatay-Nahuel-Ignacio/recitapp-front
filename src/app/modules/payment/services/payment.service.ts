import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface PaymentRequest {
  eventId: number;
  userId: number;
  totalAmount: number;
  tickets: TicketItem[];
  payer: PayerInfo;
}

export interface TicketItem {
  ticketPriceId: number;
  sectionId: number;
  ticketType: string;
  price: number;
  quantity: number;
  attendeeFirstName?: string;
  attendeeLastName?: string;
  attendeeDni?: string;
}

export interface PayerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  identification?: {
    type: string;
    number: string;
  };
}

export interface PaymentResponse {
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint: string;
  publicKey: string;
  totalAmount: number;
  status: string;
  qrCodeData?: string;
  paymentMethodInfo?: PaymentMethodInfo;
  bricksConfig: BricksConfiguration;
  walletDiscountApplied?: number;
  amountAfterWallet?: number;
  walletMessage?: string;
}

export interface PaymentMethodInfo {
  paymentMethodId: string;
  paymentTypeId: string;
  paymentMethodName: string;
  issuerName: string;
}

export interface BricksConfiguration {
  locale: string;
  theme: string;
  paymentMethods: PaymentMethods;
}

export interface PaymentMethods {
  creditCard: boolean;
  debitCard: boolean;
  mercadoPagoWallet: boolean;
  cash: boolean;
  bankTransfer: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  createPaymentPreference(paymentRequest: PaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.apiUrl}/create-preference`, paymentRequest);
  }

  createPaymentPreferenceWalletOnly(paymentRequest: PaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.apiUrl}/create-preference-wallet-only`, paymentRequest);
  }

  processPayment(paymentRequest: PaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.apiUrl}/process-payment`, paymentRequest);
  }

  getPaymentStatus(paymentId: string): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/status/${paymentId}`);
  }

  getPublicKey(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/public-key`);
  }

  processWalletPayment(paymentRequest: PaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.apiUrl}/wallet-purchase`, paymentRequest);
  }
} 