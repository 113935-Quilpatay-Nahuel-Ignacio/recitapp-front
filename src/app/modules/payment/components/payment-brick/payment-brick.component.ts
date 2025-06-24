import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, PLATFORM_ID, Inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PaymentService } from '../../services/payment.service';

declare var MercadoPago: any;

export interface PaymentBrickConfig {
  locale: string;
  theme: string;
  paymentMethods: {
    creditCard: boolean;
    debitCard: boolean;
    mercadoPagoWallet: boolean;
    ticket: boolean;
    bankTransfer: boolean;
  };
  maxInstallments: number;
  purpose: 'wallet_purchase' | 'onboarding_credits';
}

export interface PaymentBrickData {
  eventId: number;
  userId: number;
  totalAmount: number;
  tickets: Array<{
    ticketPriceId: number;
    ticketType: string;
    price: number;
    quantity: number;
  }>;
  payer?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    identificationType?: string;
    identificationNumber?: string;
    areaCode?: string;
    phone?: string;
    streetName?: string;
    streetNumber?: string;
    zipCode?: string;
  };
  config: PaymentBrickConfig;
}

@Component({
  selector: 'app-payment-brick',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="payment-brick-container" role="main" aria-label="Pago con MercadoPago Payment Brick">
      
      <!-- Header Information -->
      <div class="alert alert-info mb-4" role="banner" aria-live="polite">
        <i class="bi bi-shield-check me-2" aria-hidden="true"></i>
        <strong>Pago unificado con MercadoPago</strong>
        <p class="mb-0 mt-1">
          Puedes pagar con tu saldo de MercadoPago, tarjetas de crédito o débito. 
          Si tienes una cuenta diferente en MercadoPago, podrás iniciar sesión con ella.
        </p>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-container text-center py-5">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p>Preparando métodos de pago...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="errorMessage" class="alert alert-danger" role="alert">
        <i class="bi bi-exclamation-triangle me-2"></i>
        <strong>Error:</strong> {{ errorMessage }}
        <button class="btn btn-sm btn-outline-danger ms-2" (click)="retryPayment()">
          Reintentar
        </button>
      </div>

      <!-- Payment Brick Container -->
      <div 
        #paymentBrickContainer 
        id="paymentBrick_container"
        class="payment-brick-wrapper"
        [style.display]="isLoading || errorMessage ? 'none' : 'block'"
        aria-label="Formulario de pago de MercadoPago">
      </div>

      <!-- Payment Summary -->
      <div 
        #paymentSummary
        class="payment-summary" 
        *ngIf="!isLoading && !errorMessage">
        <div class="card">
          <div class="card-header">
            <h6 class="mb-0">
              <i class="bi bi-receipt me-2"></i>
              Resumen de compra
            </h6>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-8">
                <span class="fw-semibold">Total a pagar:</span>
              </div>
              <div class="col-4 text-end">
                <span class="fs-5 fw-bold text-primary">
                  ${{ totalAmountFormatted }}
                </span>
              </div>
            </div>
            <hr>
            <div class="small text-muted">
              <i class="bi bi-info-circle me-1"></i>
              Los datos de tu tarjeta están protegidos por MercadoPago
            </div>
          </div>
        </div>
      </div>

      <!-- Debug Info (only in development) -->
      <div class="debug-info" *ngIf="showDebugInfo">
        <div class="card border-warning">
          <div class="card-header bg-warning text-dark">
            <small><i class="bi bi-bug me-1"></i>Debug Info</small>
          </div>
          <div class="card-body">
            <small>
              <strong>Preference ID:</strong> {{ preferenceId }}<br>
              <strong>Public Key:</strong> {{ publicKeyMasked }}<br>
              <strong>Event ID:</strong> {{ paymentData.eventId }}<br>
              <strong>User ID:</strong> {{ paymentData.userId }}
            </small>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .payment-brick-container {
      max-width: 600px;
      margin: 0 auto;
      position: relative;
    }

    .payment-brick-wrapper {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      border: 1px solid #e9ecef;
    }

    .loading-container {
      background: white;
      border-radius: 12px;
      border: 2px dashed #dee2e6;
      min-height: 300px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    .payment-summary .card {
      border: 1px solid #e9ecef;
      box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
    }

    .payment-summary .card-header {
      background-color: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
    }

    .alert {
      border-radius: 8px;
      border: none;
    }

    .alert-info {
      background-color: #e6f7ff;
      color: #0c5460;
    }

    .alert-danger {
      background-color: #f8d7da;
      color: #721c24;
    }

    .debug-info {
      opacity: 0.8;
    }

    .debug-info .card {
      font-size: 0.85rem;
    }

    @media (max-width: 768px) {
      .payment-brick-container {
        padding: 0 15px;
      }
      
      .payment-brick-wrapper {
        padding: 15px;
      }
      
      .payment-summary .row {
        font-size: 0.9rem;
      }
    }

    /* Espaciado mejorado para las secciones */
    .payment-summary {
      margin-top: 2.5rem; /* Espaciado superior para separar de 'Datos del Pagador' */
    }

    .debug-info {
      margin-top: 2rem; /* Espaciado para debug info */
    }

    /* Estilos para el Payment Brick de MercadoPago */
    :deep(.mp-payment-brick) {
      border: none !important;
      box-shadow: none !important;
    }

    :deep(.mp-payment-brick .mp-form-group) {
      margin-bottom: 1rem;
    }

    :deep(.mp-payment-brick .mp-input) {
      border-radius: 6px;
      border: 1px solid #ced4da;
      padding: 0.75rem;
      font-size: 1rem;
    }

    :deep(.mp-payment-brick .mp-input:focus) {
      border-color: #009ee3;
      box-shadow: 0 0 0 0.2rem rgba(0, 158, 227, 0.25);
    }

    :deep(.mp-payment-brick .mp-button) {
      background: linear-gradient(135deg, #009ee3 0%, #0084c7 100%);
      border: none;
      border-radius: 8px;
      padding: 0.75rem 1.5rem;
      font-size: 1.1rem;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    :deep(.mp-payment-brick .mp-button:hover) {
      background: linear-gradient(135deg, #0084c7 0%, #006fa0 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 158, 227, 0.3);
    }

    /* Espaciado específico para las secciones del Payment Brick */
    :deep(.mp-payment-brick .andes-container) {
      margin-bottom: 2rem; /* Espaciado entre secciones internas */
    }

    :deep(.mp-payment-brick .payer-info-section) {
      margin-bottom: 2.5rem; /* Más espacio después de 'Datos del Pagador' */
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #e9ecef;
    }

    :deep(.mp-payment-brick .payment-section) {
      margin-top: 2rem; /* Espaciado superior para 'Completar Pago' */
      padding-top: 1.5rem;
    }

    /* Estilos específicos para botones de MercadoPago */
    :deep(.mp-payment-brick .mp-button[aria-label*="Pagar"]),
    :deep(.mp-payment-brick .mp-button[type="submit"]),
    :deep(.mp-payment-brick .cho-container .mp-button) {
      margin-top: 1.5rem; /* Espaciado superior para botón de pago */
    }

    /* Espaciado para sección de métodos de pago */
    :deep(.mp-payment-brick .payment-method-selector) {
      margin-bottom: 2rem;
    }
  `]
})
export class PaymentBrickComponent implements OnInit, OnDestroy {
  @Input() paymentData!: PaymentBrickData;
  @Output() paymentSuccess = new EventEmitter<any>();
  @Output() paymentError = new EventEmitter<any>();
  @Output() paymentPending = new EventEmitter<any>();

  @ViewChild('paymentBrickContainer', { static: true }) 
  paymentBrickContainer!: ElementRef;

  @ViewChild('paymentSummary', { static: false }) 
  paymentSummary!: ElementRef;

  // State management
  isLoading = true;
  errorMessage = '';
  
  // MercadoPago variables
  private mp: any;
  private bricksBuilder: any;
  private paymentBrickController: any;
  
  // Configuration
  preferenceId = '';
  publicKey = '';
  showDebugInfo = false; // Cambiar a true para debugging

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private paymentService: PaymentService
  ) {}

  get totalAmountFormatted(): string {
    return this.paymentData?.totalAmount?.toFixed(2) || '0.00';
  }

  get publicKeyMasked(): string {
    return this.publicKey ? this.publicKey.substring(0, 20) + '...' : '';
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initializePaymentBrick();
    }
  }

  ngOnDestroy(): void {
    if (this.paymentBrickController) {
      try {
        this.paymentBrickController.unmount();
      } catch (error) {
        console.warn('Error unmounting payment brick:', error);
      }
    }
  }

  private async initializePaymentBrick(): Promise<void> {
    try {
      this.isLoading = true;
      this.errorMessage = '';

      // 1. Crear preferencia en el backend
      const preferenceResponse = await this.createPaymentPreference();
      
      if (preferenceResponse.status !== 'success') {
        throw new Error(preferenceResponse.message || 'Error creating payment preference');
      }

      this.preferenceId = preferenceResponse.preference_id;
      this.publicKey = preferenceResponse.public_key;

      // 2. Cargar SDK de MercadoPago si no está cargado
      await this.loadMercadoPagoSDK();

      // 3. Inicializar MercadoPago con public key
      this.mp = new MercadoPago(this.publicKey, {
        locale: this.paymentData.config.locale || 'es-AR'
      });

      // 4. Crear Bricks Builder
      this.bricksBuilder = this.mp.bricks();

      // 5. Renderizar Payment Brick
      await this.renderPaymentBrick();

      this.isLoading = false;

    } catch (error) {
      console.error('Error initializing Payment Brick:', error);
      this.errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.isLoading = false;
    }
  }

  private async createPaymentPreference(): Promise<any> {
    const requestData = {
      event_id: this.paymentData.eventId,
      user_id: this.paymentData.userId,
      total_amount: this.paymentData.totalAmount,
      tickets: this.paymentData.tickets.map(ticket => ({
        ticket_price_id: ticket.ticketPriceId,
        ticket_type: ticket.ticketType,
        price: ticket.price,
        quantity: ticket.quantity
      })),
      payer: this.paymentData.payer ? {
        email: this.paymentData.payer.email,
        first_name: this.paymentData.payer.firstName,
        last_name: this.paymentData.payer.lastName,
        identification_type: this.paymentData.payer.identificationType,
        identification_number: this.paymentData.payer.identificationNumber,
        area_code: this.paymentData.payer.areaCode,
        phone: this.paymentData.payer.phone,
        street_name: this.paymentData.payer.streetName,
        street_number: this.paymentData.payer.streetNumber,
        zip_code: this.paymentData.payer.zipCode
      } : undefined,
      payment_config: {
        credit_card: this.paymentData.config.paymentMethods.creditCard,
        debit_card: this.paymentData.config.paymentMethods.debitCard,
        mercado_pago_wallet: this.paymentData.config.paymentMethods.mercadoPagoWallet,
        ticket: this.paymentData.config.paymentMethods.ticket,
        bank_transfer: this.paymentData.config.paymentMethods.bankTransfer,
        max_installments: this.paymentData.config.maxInstallments,
        purpose: this.paymentData.config.purpose
      }
    };

    return this.paymentService.createPaymentBrickPreference(requestData).toPromise();
  }

  private async loadMercadoPagoSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof MercadoPago !== 'undefined') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load MercadoPago SDK'));
      document.head.appendChild(script);
    });
  }

  private async renderPaymentBrick(): Promise<void> {
    const settings = {
      initialization: {
        amount: this.paymentData.totalAmount,
        preferenceId: this.preferenceId,
      },
      customization: {
        paymentMethods: {
          ticket: this.paymentData.config.paymentMethods.ticket ? "all" : "all",
          creditCard: this.paymentData.config.paymentMethods.creditCard ? "all" : "all", 
          debitCard: this.paymentData.config.paymentMethods.debitCard ? "all" : "all",
          mercadoPago: this.paymentData.config.paymentMethods.mercadoPagoWallet ? "all" : "all",
        },
        visual: {
          style: {
            theme: this.paymentData.config.theme || 'default'
          }
        }
      },
      callbacks: {
        onReady: () => {
          console.log('Payment Brick is ready');
          this.isLoading = false;
          
          // Agregar event listener para el botón de MercadoPago después de que se cargue
          setTimeout(() => {
            this.addScrollListenerToMPButton();
          }, 1000);
        },
        onSubmit: ({ selectedPaymentMethod, formData }: any) => {
          return this.handlePaymentSubmit(selectedPaymentMethod, formData);
        },
        onError: (error: any) => {
          console.error('Payment Brick error:', error);
          this.paymentError.emit(error);
        },
      },
    };

    try {
      this.paymentBrickController = await this.bricksBuilder.create(
        "payment",
        "paymentBrick_container",
        settings
      );
    } catch (error) {
      console.error('Error creating Payment Brick:', error);
      throw error;
    }
  }

  /**
   * Añade listener de scroll automático al botón "Pagar con MercadoPago"
   */
  private addScrollListenerToMPButton(): void {
    try {
      // Buscar botones de MercadoPago en el DOM
      const mpButtons = document.querySelectorAll('[data-testid*="mercado-pago"], .mp-button, [aria-label*="Pagar"], [data-cy*="mercadopago"]');
      
      mpButtons.forEach(button => {
        button.addEventListener('click', () => {
          console.log('🧱 [PAYMENT-BRICK] MercadoPago button clicked - scrolling down');
          this.scrollToPaymentSummary();
        });
      });

      // También buscar botones que contengan texto de MercadoPago
      const allButtons = document.querySelectorAll('button, .mp-button, [role="button"]');
      allButtons.forEach(button => {
        const buttonText = button.textContent?.toLowerCase() || '';
        if (buttonText.includes('mercado') || buttonText.includes('pago') || buttonText.includes('wallet')) {
          button.addEventListener('click', () => {
            console.log('🧱 [PAYMENT-BRICK] MercadoPago-related button clicked - scrolling down');
            this.scrollToPaymentSummary();
          });
        }
      });

    } catch (error) {
      console.warn('Could not add scroll listener to MP button:', error);
    }
  }

  /**
   * Hace scroll suave hacia la sección de resumen de pago
   */
  private scrollToPaymentSummary(): void {
    setTimeout(() => {
      try {
        if (this.paymentSummary?.nativeElement) {
          this.paymentSummary.nativeElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          });
        } else {
          // Fallback: scroll hacia abajo de la página
          window.scrollBy({
            top: 300,
            behavior: 'smooth'
          });
        }
      } catch (error) {
        console.warn('Could not scroll to payment summary:', error);
        // Fallback más simple
        window.scrollBy(0, 300);
      }
    }, 500); // Pequeño delay para que el contenido se actualice
  }

  private async handlePaymentSubmit(selectedPaymentMethod: any, formData: any): Promise<void> {
    try {
      console.log('Processing payment:', { selectedPaymentMethod, formData });

      const processResponse = await this.paymentService.processPaymentBrick({
        payment_method_id: selectedPaymentMethod.id,
        transaction_amount: this.paymentData.totalAmount,
        installments: formData.installments,
        token: formData.token,
        preference_id: this.preferenceId,
        external_reference: `BRICK-${this.paymentData.eventId}-${this.paymentData.userId}`,
        payer: {
          email: formData.payer.email,
          first_name: formData.payer.first_name,
          last_name: formData.payer.last_name,
          identification: formData.payer.identification,
          phone: formData.payer.phone,
          address: formData.payer.address
        },
        form_data: formData,
        selected_payment_method: selectedPaymentMethod.type
      }).toPromise();

      if (processResponse && processResponse.status === 'approved') {
        this.paymentSuccess.emit(processResponse);
      } else if (processResponse && processResponse.status === 'pending') {
        this.paymentPending.emit(processResponse);
      } else {
        this.paymentError.emit(processResponse || { status: 'error', message: 'Unknown error' });
      }

    } catch (error) {
      console.error('Error processing payment:', error);
      this.paymentError.emit(error);
    }
  }

  retryPayment(): void {
    this.errorMessage = '';
    this.initializePaymentBrick();
  }
}