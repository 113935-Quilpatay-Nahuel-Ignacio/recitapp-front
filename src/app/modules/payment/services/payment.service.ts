import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface PaymentRequest {
  eventId: number;
  userId: number;
  tickets: TicketItem[];
  totalAmount: number;
  payer: PayerInfo;
}

export interface TicketItem {
  sectionId: number;
  ticketPriceId: number;
  ticketType: string;
  attendeeFirstName: string;
  attendeeLastName: string;
  attendeeDni: string;
  price: number;
  quantity: number;
}

export interface PayerInfo {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  documentType?: string;
  documentNumber?: string;
}

export interface PaymentResponse {
  // Campos para Checkout Pro (compatibilidad)
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint: string;
  
  // Campos para Checkout Bricks
  publicKey: string;
  totalAmount: number;
  status: string;
  transactionId?: number;
  qrCodeData?: string;
  
  // Configuración para Bricks
  bricksConfig: BricksConfiguration;
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

  getPaymentStatus(paymentId: string): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/status/${paymentId}`);
  }

  getPublicKey(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/public-key`);
  }
} 