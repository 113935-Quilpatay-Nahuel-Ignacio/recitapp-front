import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface CheckoutApiPaymentRequest {
  totalAmount: number;
  description: string;
  eventId: number;
  userId: number;
  cardToken: string;
  paymentMethodId: string;
  paymentTypeId: string;
  installments?: number;
  payer: {
    email: string;
    firstName?: string;
    lastName?: string;
    identificationType?: string;
    identificationNumber?: string;
    phone?: string;
  };
  cardInfo?: {
    cardholderName?: string;
    issuerId?: string;
    firstSixDigits?: string;
    lastFourDigits?: string;
    expirationMonth?: string;
    expirationYear?: string;
  };
}

export interface WalletPaymentRequest {
  totalAmount: number;
  description: string;
  eventId: number;
  userId: number;
  payer: {
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface PaymentResponse {
  preferenceId: string;
  publicKey: string;
  totalAmount: number;
  status: string;
  transactionId?: number;
  paymentMethodInfo?: {
    paymentMethodId: string;
    paymentTypeId: string;
    paymentMethodName: string;
    issuerName?: string;
  };
  apiConfig?: {
    locale: string;
    theme: string;
    enabledPaymentMethods: {
      creditCard: boolean;
      debitCard: boolean;
      mercadoPagoWallet: boolean;
    };
  };
}

export interface PaymentStatusResponse {
  paymentId: string;
  status: string;
  timestamp: number;
}

export interface PublicKeyResponse {
  publicKey: string;
}

@Injectable({
  providedIn: 'root'
})
export class CheckoutApiService {
  private readonly baseUrl = `${environment.apiUrl}/checkout-api`;
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  /**
   * Procesar pago con tarjeta usando Checkout API
   */
  processCardPayment(paymentRequest: CheckoutApiPaymentRequest): Observable<PaymentResponse> {
    console.log('🚀 [CHECKOUT_API_SERVICE] Enviando pago con tarjeta:', paymentRequest);
    
    return this.http.post<PaymentResponse>(
      `${this.baseUrl}/card-payment`,
      paymentRequest,
      this.httpOptions
    ).pipe(
      map(response => {
        console.log('✅ [CHECKOUT_API_SERVICE] Respuesta del pago con tarjeta:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ [CHECKOUT_API_SERVICE] Error en pago con tarjeta:', error);
        return this.handleError(error);
      })
    );
  }

  /**
   * Procesar pago con dinero en cuenta de Mercado Pago
   */
  processWalletPayment(paymentRequest: WalletPaymentRequest): Observable<PaymentResponse> {
    console.log('🚀 [CHECKOUT_API_SERVICE] Enviando pago con wallet:', paymentRequest);
    
    return this.http.post<PaymentResponse>(
      `${this.baseUrl}/wallet-payment`,
      paymentRequest,
      this.httpOptions
    ).pipe(
      map(response => {
        console.log('✅ [CHECKOUT_API_SERVICE] Respuesta del pago con wallet:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ [CHECKOUT_API_SERVICE] Error en pago con wallet:', error);
        return this.handleError(error);
      })
    );
  }

  /**
   * Obtener estado de un pago
   */
  getPaymentStatus(paymentId: string): Observable<PaymentStatusResponse> {
    console.log('🔍 [CHECKOUT_API_SERVICE] Consultando estado del pago:', paymentId);
    
    return this.http.get<PaymentStatusResponse>(
      `${this.baseUrl}/payment-status/${paymentId}`
    ).pipe(
      map(response => {
        console.log('✅ [CHECKOUT_API_SERVICE] Estado del pago obtenido:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ [CHECKOUT_API_SERVICE] Error obteniendo estado del pago:', error);
        return this.handleError(error);
      })
    );
  }

  /**
   * Obtener clave pública de MercadoPago
   */
  getPublicKey(): Observable<string> {
    console.log('🔑 [CHECKOUT_API_SERVICE] Solicitando clave pública');
    
    return this.http.get<PublicKeyResponse>(`${this.baseUrl}/public-key`).pipe(
      map(response => {
        console.log('✅ [CHECKOUT_API_SERVICE] Clave pública obtenida');
        return response.publicKey;
      }),
      catchError(error => {
        console.error('❌ [CHECKOUT_API_SERVICE] Error obteniendo clave pública:', error);
        return this.handleError(error);
      })
    );
  }

  /**
   * Verificar salud del servicio
   */
  healthCheck(): Observable<any> {
    return this.http.get(`${this.baseUrl}/health`).pipe(
      map(response => {
        console.log('📊 [CHECKOUT_API_SERVICE] Health check:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ [CHECKOUT_API_SERVICE] Error en health check:', error);
        return this.handleError(error);
      })
    );
  }

  /**
   * Construir petición de pago con tarjeta
   */
  buildCardPaymentRequest(
    amount: number,
    description: string,
    eventId: number,
    userId: number,
    cardToken: string,
    paymentMethodId: string,
    paymentTypeId: string,
    payerData: any,
    installments: number = 1,
    cardInfo?: any
  ): CheckoutApiPaymentRequest {
    return {
      totalAmount: amount,
      description,
      eventId,
      userId,
      cardToken,
      paymentMethodId,
      paymentTypeId,
      installments,
      payer: {
        email: payerData.email,
        firstName: payerData.firstName,
        lastName: payerData.lastName,
        identificationType: payerData.identificationType,
        identificationNumber: payerData.identificationNumber,
        phone: payerData.phone
      },
      cardInfo: cardInfo ? {
        cardholderName: cardInfo.cardholderName,
        issuerId: cardInfo.issuerId,
        firstSixDigits: cardInfo.firstSixDigits,
        lastFourDigits: cardInfo.lastFourDigits,
        expirationMonth: cardInfo.expirationMonth,
        expirationYear: cardInfo.expirationYear
      } : undefined
    };
  }

  /**
   * Construir petición de pago con wallet
   */
  buildWalletPaymentRequest(
    amount: number,
    description: string,
    eventId: number,
    userId: number,
    payerData: any
  ): WalletPaymentRequest {
    return {
      totalAmount: amount,
      description,
      eventId,
      userId,
      payer: {
        email: payerData.email,
        firstName: payerData.firstName,
        lastName: payerData.lastName
      }
    };
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'Error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Error del servidor: ${error.status} - ${error.message}`;
      
      // Si hay detalles del error en el cuerpo de la respuesta
      if (error.error && error.error.paymentMethodInfo && error.error.paymentMethodInfo.paymentMethodName) {
        errorMessage = error.error.paymentMethodInfo.paymentMethodName;
      } else if (error.error && error.error.error) {
        errorMessage = error.error.error;
      }
    }
    
    console.error('🚨 [CHECKOUT_API_SERVICE] Error detallado:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
} 