import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

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
  payment_methods_config: {
    credit_card: boolean;
    debit_card: boolean;
    mercado_pago_wallet: boolean;
    excluded_payment_types: string[];
    max_installments: number;
  };
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

@Injectable({
  providedIn: 'root'
})
export class PaymentBrickService {

  private readonly apiUrl = `${environment.apiUrl}/payments/brick`;

  constructor(private http: HttpClient) {}

  /**
   * Crear preferencia para Payment Brick
   */
  createPaymentBrickPreference(request: PaymentBrickPreferenceRequest): Observable<PaymentBrickPreferenceResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<PaymentBrickPreferenceResponse>(
      `${this.apiUrl}/preference`,
      request,
      { headers }
    );
  }

  /**
   * Procesar pago del Payment Brick
   */
  processPaymentBrick(request: PaymentBrickProcessRequest): Observable<PaymentBrickProcessResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<PaymentBrickProcessResponse>(
      `${this.apiUrl}/process`,
      request,
      { headers }
    );
  }

  /**
   * Obtener configuración del Payment Brick
   */
  getPaymentBrickConfig(): Observable<PaymentBrickConfig> {
    return this.http.get<PaymentBrickConfig>(`${this.apiUrl}/config`);
  }

  /**
   * Validar método de pago
   */
  validatePaymentMethod(paymentMethodId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/validate/${paymentMethodId}`);
  }

  /**
   * Obtener public key de MercadoPago
   */
  getPublicKey(): Observable<string> {
    return this.http.get(`${this.apiUrl}/public-key`, { responseType: 'text' });
  }
} 