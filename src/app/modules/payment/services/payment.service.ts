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

export interface PaymentRequestWithCardInfo extends PaymentRequest {
  // Información adicional de la tarjeta para detección de códigos de prueba
  cardholderName?: string; // Nombre del titular de la tarjeta
}

export interface CardPaymentRequest {
  eventId: number;
  userId: number;
  totalAmount: number;
  description: string;
  cardToken: string;
  paymentMethodId: string;
  paymentTypeId: string;
  installments: number;
  payer: {
    email: string;
    firstName: string;
    lastName: string;
    identificationType?: string;
    identificationNumber?: string;
    phone?: string;
  };
  cardInfo: {
    cardholderName: string;
    issuerId: string;
  };
}

export interface PaymentResponse {
  preferenceId: string;
  paymentId?: string;
  initPoint: string;
  sandboxInitPoint: string;
  publicKey: string;
  totalAmount: number;
  status: string;
  statusCode?: string;
  displayName?: string;
  userMessage?: string;
  shouldDeliverTickets?: boolean;
  canRetry?: boolean;
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
    // ✅ MÉTODO UNIFICADO: Ahora incluye automáticamente todas las opciones de pago
    // incluyendo tarjetas de crédito/débito Y saldo de MercadoPago
    return this.http.post<PaymentResponse>(`${this.apiUrl}/create-preference`, paymentRequest);
  }

  // MÉTODO ELIMINADO: createPaymentPreferenceWalletOnly
  // Ya no es necesario porque createPaymentPreference incluye todas las opciones

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

  /**
   * Procesar pago con información adicional de la tarjeta (incluyendo cardholder name)
   * Este método envía al mismo endpoint /process-payment pero con datos adicionales
   * para permitir la detección de códigos de prueba por cardholder name
   */
  processCardPayment(paymentRequest: PaymentRequestWithCardInfo): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.apiUrl}/process-payment`, paymentRequest);
  }

  // =============================
  // PAYMENT BRICK METHODS
  // =============================

  /**
   * Crear preferencia para Payment Brick
   * Permite al usuario pagar con su propia cuenta de MercadoPago (diferente a la del usuario logueado)
   */
  createPaymentBrickPreference(request: PaymentBrickPreferenceRequest): Observable<PaymentBrickPreferenceResponse> {
    return this.http.post<PaymentBrickPreferenceResponse>(`${this.apiUrl}/brick/preference`, request);
  }

  /**
   * Procesar pago del Payment Brick
   */
  processPaymentBrick(request: PaymentBrickProcessRequest): Observable<PaymentBrickProcessResponse> {
    return this.http.post<PaymentBrickProcessResponse>(`${this.apiUrl}/brick/process`, request);
  }

  /**
   * Obtener configuración del Payment Brick
   */
  getPaymentBrickConfig(): Observable<PaymentBrickConfig> {
    return this.http.get<PaymentBrickConfig>(`${this.apiUrl}/brick/config`);
  }

  /**
   * Validar método de pago del Payment Brick
   */
  validatePaymentBrickMethod(paymentMethodId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/brick/validate/${paymentMethodId}`);
  }
}

// =============================
// PAYMENT BRICK INTERFACES
// =============================

export interface PaymentBrickPreferenceRequest {
  event_id: number;
  user_id: number;
  total_amount: number;
  tickets: Array<{
    ticket_price_id: number;
    ticket_type: string;
    price: number;
    quantity: number;
  }>;
  payer?: {
    email?: string;
    first_name?: string;
    last_name?: string;
    identification_type?: string;
    identification_number?: string;
    area_code?: string;
    phone?: string;
    street_name?: string;
    street_number?: string;
    zip_code?: string;
  };
  payment_config?: {
    credit_card?: boolean;
    debit_card?: boolean;
    mercado_pago_wallet?: boolean;
    ticket?: boolean;
    bank_transfer?: boolean;
    max_installments?: number;
    purpose?: 'wallet_purchase' | 'onboarding_credits';
  };
}

export interface PaymentBrickPreferenceResponse {
  preference_id: string;
  public_key: string;
  amount: number;
  currency_id: string;
  external_reference: string;
  success_url: string;
  failure_url: string;
  pending_url: string;
  webhook_url: string;
  init_point: string;
  sandbox_init_point: string;
  status: string;
  message: string;
  payment_methods_config: PaymentBrickConfig;
}

export interface PaymentBrickProcessRequest {
  payment_method_id: string;
  transaction_amount: number;
  installments?: number;
  token?: string;
  preference_id: string;
  external_reference: string;
  payer: {
    email: string;
    first_name?: string;
    last_name?: string;
    identification?: {
      type: string;
      number: string;
    };
    phone?: {
      area_code: string;
      number: string;
    };
    address?: {
      street_name: string;
      street_number: string;
      zip_code: string;
    };
  };
  form_data: any;
  selected_payment_method: string;
}

export interface PaymentBrickProcessResponse {
  status: string;
  transaction_id?: number;
  public_key?: string;
  message?: string;
}

export interface PaymentBrickConfig {
  credit_card: boolean;
  debit_card: boolean;
  mercado_pago_wallet: boolean;
  excluded_payment_types: string[];
  max_installments: number;
} 