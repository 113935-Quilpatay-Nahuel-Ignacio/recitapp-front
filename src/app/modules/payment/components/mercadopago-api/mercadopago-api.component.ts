import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PaymentService, PaymentRequest } from '../../services/payment.service';
import { CheckoutApiService } from '../../services/checkout-api.service';

declare var MercadoPago: any;

export interface ApiConfiguration {
  locale: string;
  theme: string;
  enabledPaymentMethods: {
    creditCard: boolean;
    debitCard: boolean;
    mercadoPagoWallet: boolean;
  };
}

export interface PaymentData {
  totalAmount: number;
  publicKey: string;
  preferenceId: string;
  apiConfig: ApiConfiguration;
  paymentRequest?: PaymentRequest;
}

export interface CardFormData {
  cardNumber: string;
  cardholderName: string;
  cardExpirationMonth: string;
  cardExpirationYear: string;
  securityCode: string;
  identificationType: string;
  identificationNumber: string;
  issuer: string;
  paymentMethodId: string;
  token: string;
  installments: number;
}

@Component({
  selector: 'app-mercadopago-api',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="mercadopago-api-container" role="main" aria-label="Pago con MercadoPago - Checkout API">
      
      <!-- Header Information -->
      <div class="alert alert-info mb-4" role="banner" aria-live="polite">
        <i class="bi bi-shield-check me-2" aria-hidden="true"></i>
        <strong>Pago seguro con MercadoPago</strong>
        <p class="mb-0 mt-1">Ingresa los datos de tu tarjeta o usa tu saldo de Mercado Pago de forma segura.</p>
      </div>

      <!-- Payment Method Selection -->
      <div class="payment-methods-section mb-4" *ngIf="paymentMethods.length > 0">
        <h5 class="mb-3">Selecciona tu método de pago</h5>
        <div class="payment-methods-grid">
          <div 
            *ngFor="let method of paymentMethods" 
            class="payment-method-option"
            [class.selected]="selectedPaymentMethod === method.id"
            (click)="selectPaymentMethod(method.id)"
            role="button"
            tabindex="0"
            [attr.aria-label]="'Seleccionar ' + method.name"
            (keydown.enter)="selectPaymentMethod(method.id)"
            (keydown.space)="selectPaymentMethod(method.id)">
            <img [src]="method.logo" [alt]="method.name" class="payment-method-logo">
            <span class="payment-method-name">{{ method.name }}</span>
          </div>
        </div>
      </div>

      <!-- Card Payment Form -->
      <form [formGroup]="cardForm" (ngSubmit)="processPayment()" 
            *ngIf="selectedPaymentMethod !== 'account_money'"
            class="card-payment-form" 
            role="form" 
            aria-label="Formulario de pago con tarjeta">
        
        <!-- Card Number -->
        <div class="form-group mb-3">
          <label for="cardNumber" class="form-label">Número de tarjeta</label>
          <div class="input-container">
            <div id="cardNumber" class="mp-input-container" 
                 [attr.data-checkout]="'cardNumber'"
                 aria-label="Número de tarjeta"></div>
            <div class="card-logo" *ngIf="detectedCardBrand">
              <img [src]="getCardBrandLogo(detectedCardBrand)" [alt]="detectedCardBrand">
            </div>
          </div>
          <div class="form-error" *ngIf="cardForm.get('cardNumber')?.invalid && cardForm.get('cardNumber')?.touched">
            El número de tarjeta es requerido
          </div>
        </div>

        <!-- Expiration Date and CVV -->
        <div class="row mb-3">
          <div class="col-md-6">
            <label for="expirationDate" class="form-label">Fecha de vencimiento</label>
            <div id="expirationDate" class="mp-input-container" 
                 [attr.data-checkout]="'expirationDate'"
                 aria-label="Fecha de vencimiento MM/AA"></div>
            <div class="form-error" *ngIf="cardForm.get('expirationDate')?.invalid && cardForm.get('expirationDate')?.touched">
              Fecha de vencimiento requerida
            </div>
          </div>
          <div class="col-md-6">
            <label for="securityCode" class="form-label">Código de seguridad</label>
            <div id="securityCode" class="mp-input-container" 
                 [attr.data-checkout]="'securityCode'"
                 aria-label="Código de seguridad CVV"></div>
            <div class="form-error" *ngIf="cardForm.get('securityCode')?.invalid && cardForm.get('securityCode')?.touched">
              Código de seguridad requerido
            </div>
          </div>
        </div>

        <!-- Cardholder Name -->
        <div class="form-group mb-3">
          <label for="cardholderName" class="form-label">Nombre del titular</label>
          <input 
            type="text" 
            id="cardholderName" 
            class="form-control" 
            formControlName="cardholderName"
            placeholder="Nombre tal como aparece en la tarjeta"
            [attr.data-checkout]="'cardholderName'"
            aria-label="Nombre del titular de la tarjeta">
          <div class="form-error" *ngIf="cardForm.get('cardholderName')?.invalid && cardForm.get('cardholderName')?.touched">
            El nombre del titular es requerido
          </div>
        </div>

        <!-- Identification -->
        <div class="row mb-3">
          <div class="col-md-4">
            <label for="identificationType" class="form-label">Tipo de documento</label>
            <select 
              id="identificationType" 
              class="form-select" 
              formControlName="identificationType"
              [attr.data-checkout]="'docType'"
              aria-label="Tipo de documento">
              <option value="">Seleccionar</option>
              <option *ngFor="let type of identificationTypes" [value]="type.id">
                {{ type.name }}
              </option>
            </select>
          </div>
          <div class="col-md-8">
            <label for="identificationNumber" class="form-label">Número de documento</label>
            <input 
              type="text" 
              id="identificationNumber" 
              class="form-control" 
              formControlName="identificationNumber"
              placeholder="12345678"
              [attr.data-checkout]="'docNumber'"
              aria-label="Número de documento">
          </div>
        </div>

        <!-- Email -->
        <div class="form-group mb-3">
          <label for="email" class="form-label">Email</label>
          <input 
            type="email" 
            id="email" 
            class="form-control" 
            formControlName="email"
            placeholder="tu@email.com"
            aria-label="Dirección de email">
          <div class="form-error" *ngIf="cardForm.get('email')?.invalid && cardForm.get('email')?.touched">
            Email válido requerido
          </div>
        </div>

        <!-- Installments -->
        <div class="form-group mb-4" *ngIf="installmentOptions.length > 0">
          <label for="installments" class="form-label">Cuotas</label>
          <select 
            id="installments" 
            class="form-select" 
            formControlName="installments"
            [attr.data-checkout]="'installments'"
            aria-label="Número de cuotas">
            <option *ngFor="let installment of installmentOptions" [value]="installment.installments">
              {{ installment.installments }}x de ${{ installment.installment_amount | number:'1.2-2' }}
              <span *ngIf="installment.total_amount !== paymentData.totalAmount">
                (Total: ${{ installment.total_amount | number:'1.2-2' }})
              </span>
            </option>
          </select>
        </div>

        <!-- Pay Button -->
        <button 
          type="submit" 
          class="btn btn-primary btn-lg w-100 pay-button"
          [disabled]="isLoading || cardForm.invalid"
          aria-label="Procesar pago">
          <span *ngIf="!isLoading" class="d-flex align-items-center justify-content-center">
            <i class="bi bi-credit-card me-2" aria-hidden="true"></i>
            Pagar ${{ paymentData.totalAmount | number:'1.2-2' }}
          </span>
          <span *ngIf="isLoading" class="d-flex align-items-center justify-content-center">
            <div class="spinner-border spinner-border-sm me-2" role="status">
              <span class="visually-hidden">Procesando...</span>
            </div>
            Procesando pago...
          </span>
        </button>
      </form>

      <!-- Mercado Pago Wallet Payment -->
      <div *ngIf="selectedPaymentMethod === 'account_money'" class="wallet-payment-section">
        <div class="wallet-info p-4 text-center">
          <i class="bi bi-wallet2 display-4 text-primary mb-3"></i>
          <h5>Pagar con saldo de Mercado Pago</h5>
          <p class="text-muted mb-4">
            Usa el dinero disponible en tu cuenta de Mercado Pago
          </p>
          <button 
            type="button" 
            class="btn btn-primary btn-lg"
            (click)="processWalletPayment()"
            [disabled]="isLoading"
            aria-label="Pagar con saldo de Mercado Pago">
            <span *ngIf="!isLoading">
              <i class="bi bi-wallet2 me-2"></i>
              Pagar ${{ paymentData.totalAmount | number:'1.2-2' }}
            </span>
            <span *ngIf="isLoading" class="d-flex align-items-center justify-content-center">
              <div class="spinner-border spinner-border-sm me-2" role="status">
                <span class="visually-hidden">Procesando...</span>
              </div>
              Procesando...
            </span>
          </button>
        </div>
      </div>

      <!-- Loading Overlay -->
      <div class="loading-overlay" *ngIf="isLoading" role="status" aria-live="assertive">
        <div class="loading-content">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Procesando pago...</span>
          </div>
          <p class="mt-3">Procesando tu pago...</p>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .mercadopago-api-container {
      max-width: 600px;
      margin: 0 auto;
      position: relative;
    }

    .payment-methods-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .payment-method-option {
      border: 2px solid #e9ecef;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: white;
    }

    .payment-method-option:hover {
      border-color: #009ee3;
      box-shadow: 0 2px 8px rgba(0, 158, 227, 0.1);
    }

    .payment-method-option.selected {
      border-color: #009ee3;
      background-color: #f8fffe;
      box-shadow: 0 2px 8px rgba(0, 158, 227, 0.2);
    }

    .payment-method-logo {
      width: 40px;
      height: 30px;
      object-fit: contain;
      margin-bottom: 10px;
    }

    .payment-method-name {
      display: block;
      font-weight: 500;
      color: #333;
    }

    .card-payment-form {
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    }

    .input-container {
      position: relative;
    }

    .mp-input-container {
      width: 100%;
      height: 45px;
      border: 1px solid #ced4da;
      border-radius: 6px;
      padding: 10px 12px;
      font-size: 16px;
      transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }

    .mp-input-container:focus-within {
      border-color: #009ee3;
      box-shadow: 0 0 0 0.2rem rgba(0, 158, 227, 0.25);
    }

    .card-logo {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
    }

    .card-logo img {
      width: 30px;
      height: 20px;
      object-fit: contain;
    }

    .form-label {
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
    }

    .form-control, .form-select {
      height: 45px;
      border-radius: 6px;
      border: 1px solid #ced4da;
      font-size: 16px;
    }

    .form-control:focus, .form-select:focus {
      border-color: #009ee3;
      box-shadow: 0 0 0 0.2rem rgba(0, 158, 227, 0.25);
    }

    .form-error {
      color: #dc3545;
      font-size: 14px;
      margin-top: 5px;
    }

    .pay-button {
      height: 50px;
      font-size: 18px;
      font-weight: 600;
      background: linear-gradient(135deg, #009ee3 0%, #0084c7 100%);
      border: none;
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    .pay-button:hover:not(:disabled) {
      background: linear-gradient(135deg, #0084c7 0%, #006fa0 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 158, 227, 0.3);
    }

    .pay-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .wallet-payment-section {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    }

    .wallet-info {
      border: 2px dashed #009ee3;
      border-radius: 12px;
      background: linear-gradient(135deg, #f8fffe 0%, #e6f7ff 100%);
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      z-index: 1000;
    }

    .loading-content {
      text-align: center;
    }

    .alert {
      border-radius: 8px;
      border: none;
    }

    .alert-info {
      background-color: #e6f7ff;
      color: #0c5460;
    }

    @media (max-width: 768px) {
      .mercadopago-api-container {
        padding: 0 15px;
      }
      
      .card-payment-form {
        padding: 20px;
      }
      
      .payment-methods-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MercadoPagoApiComponent implements OnInit, OnDestroy {
  @Input() paymentData!: PaymentData;
  @Output() paymentSuccess = new EventEmitter<any>();
  @Output() paymentError = new EventEmitter<any>();

  cardForm!: FormGroup;
  isLoading = false;
  
  // MercadoPago SDK variables
  private mp: any;
  
  // Form data
  paymentMethods: any[] = [];
  selectedPaymentMethod: string = '';
  identificationTypes: any[] = [];
  installmentOptions: any[] = [];
  detectedCardBrand: string = '';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private checkoutApiService: CheckoutApiService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadMercadoPagoSDK();
    }
  }

  ngOnDestroy(): void {
    // Cleanup any MercadoPago SDK instances
    if (this.mp) {
      this.mp = null;
    }
  }

  private initializeForm(): void {
    this.cardForm = this.fb.group({
      cardNumber: ['', Validators.required],
      cardholderName: ['', Validators.required],
      expirationDate: ['', Validators.required],
      securityCode: ['', Validators.required],
      identificationType: ['', Validators.required],
      identificationNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      installments: [1, Validators.required]
    });
  }

  private loadMercadoPagoSDK(): void {
    if (typeof MercadoPago !== 'undefined') {
      this.initializeMercadoPago();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.onload = () => {
      this.initializeMercadoPago();
    };
    script.onerror = () => {
      console.error('Error loading MercadoPago SDK');
      this.paymentError.emit({ error: 'No se pudo cargar el SDK de MercadoPago' });
    };
    document.head.appendChild(script);
  }

  private initializeMercadoPago(): void {
    try {
      this.mp = new MercadoPago(this.paymentData.publicKey, {
        locale: this.paymentData.apiConfig.locale
      });

      this.setupPaymentMethods();
      this.loadIdentificationTypes();
      this.setupCardInputs();
      
    } catch (error) {
      console.error('Error initializing MercadoPago:', error);
      this.paymentError.emit({ error: 'Error al inicializar MercadoPago' });
    }
  }

  private setupPaymentMethods(): void {
    this.paymentMethods = [];
    
    // Add credit/debit cards if enabled
    if (this.paymentData.apiConfig.enabledPaymentMethods.creditCard || 
        this.paymentData.apiConfig.enabledPaymentMethods.debitCard) {
      this.paymentMethods.push({
        id: 'cards',
        name: 'Tarjeta de Crédito/Débito',
        logo: 'assets/images/payment-methods/cards.png'
      });
    }

    // Add Mercado Pago wallet if enabled
    if (this.paymentData.apiConfig.enabledPaymentMethods.mercadoPagoWallet) {
      this.paymentMethods.push({
        id: 'account_money',
        name: 'Saldo de Mercado Pago',
        logo: 'assets/images/payment-methods/mercadopago.png'
      });
    }

    // Select first available method by default
    if (this.paymentMethods.length > 0) {
      this.selectedPaymentMethod = this.paymentMethods[0].id;
    }
  }

  private loadIdentificationTypes(): void {
    this.mp.getIdentificationTypes()
      .then((response: any) => {
        this.identificationTypes = response;
      })
      .catch((error: any) => {
        console.error('Error loading identification types:', error);
      });
  }

  private setupCardInputs(): void {
    // Setup card number input with validation and brand detection
    const cardNumberElement = document.getElementById('cardNumber');
    if (cardNumberElement) {
      cardNumberElement.addEventListener('input', (event: any) => {
        this.onCardNumberChange(event.target.value);
      });
    }
  }

  selectPaymentMethod(methodId: string): void {
    this.selectedPaymentMethod = methodId;
  }

  private onCardNumberChange(cardNumber: string): void {
    // Remove spaces and non-numeric characters
    const cleanNumber = cardNumber.replace(/\D/g, '');
    
    if (cleanNumber.length >= 6) {
      this.mp.getPaymentMethod({ bin: cleanNumber.substring(0, 6) })
        .then((response: any) => {
          if (response.results && response.results.length > 0) {
            const paymentMethod = response.results[0];
            this.detectedCardBrand = paymentMethod.id;
            this.loadInstallments(paymentMethod.id);
          }
        })
        .catch((error: any) => {
          console.warn('Error detecting card brand:', error);
        });
    }
  }

  private loadInstallments(paymentMethodId: string): void {
    this.mp.getInstallments({
      amount: this.paymentData.totalAmount,
      locale: this.paymentData.apiConfig.locale,
      payment_method_id: paymentMethodId
    }).then((response: any) => {
      if (response[0] && response[0].payer_costs) {
        this.installmentOptions = response[0].payer_costs;
      }
    }).catch((error: any) => {
      console.warn('Error loading installments:', error);
    });
  }

  processPayment(): void {
    if (this.cardForm.invalid) {
      this.markFormGroupTouched(this.cardForm);
      return;
    }

    this.isLoading = true;

    // Create card token
    this.mp.createCardToken({
      cardNumber: this.cardForm.get('cardNumber')?.value,
      cardholderName: this.cardForm.get('cardholderName')?.value,
      cardExpirationMonth: this.cardForm.get('expirationDate')?.value.split('/')[0],
      cardExpirationYear: this.cardForm.get('expirationDate')?.value.split('/')[1],
      securityCode: this.cardForm.get('securityCode')?.value,
      identificationType: this.cardForm.get('identificationType')?.value,
      identificationNumber: this.cardForm.get('identificationNumber')?.value
    }).then((response: any) => {
      this.processTokenizedPayment(response.id);
    }).catch((error: any) => {
      this.isLoading = false;
      console.error('Error creating card token:', error);
      this.paymentError.emit({ error: 'Error al procesar los datos de la tarjeta' });
    });
  }

  private processTokenizedPayment(token: string): void {
    const paymentRequest = this.checkoutApiService.buildCardPaymentRequest(
      this.paymentData.totalAmount,
      this.paymentData.paymentRequest?.description || 'Compra de entradas',
      this.paymentData.paymentRequest?.eventId || 0,
      this.paymentData.paymentRequest?.userId || 0,
      token,
      this.detectedCardBrand,
      this.detectedCardBrand.includes('debit') ? 'debit_card' : 'credit_card',
      {
        email: this.cardForm.get('email')?.value,
        firstName: this.cardForm.get('cardholderName')?.value?.split(' ')[0],
        lastName: this.cardForm.get('cardholderName')?.value?.split(' ').slice(1).join(' '),
        identificationType: this.cardForm.get('identificationType')?.value,
        identificationNumber: this.cardForm.get('identificationNumber')?.value
      },
      this.cardForm.get('installments')?.value || 1,
      {
        cardholderName: this.cardForm.get('cardholderName')?.value
      }
    );

    this.checkoutApiService.processCardPayment(paymentRequest).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.paymentSuccess.emit(response);
      },
      error: (error) => {
        this.isLoading = false;
        this.paymentError.emit({ error: 'Error procesando el pago', details: error });
      }
    });
  }

  processWalletPayment(): void {
    this.isLoading = true;
    
    // For wallet payments, we use a different flow
    const walletPaymentData = {
      ...this.paymentData.paymentRequest,
      payment_method_id: 'account_money'
    };

    this.paymentService.processPayment(walletPaymentData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.paymentSuccess.emit(response);
      },
      error: (error) => {
        this.isLoading = false;
        this.paymentError.emit({ error: 'Error procesando el pago con saldo', details: error });
      }
    });
  }

  getCardBrandLogo(brand: string): string {
    const brandLogos: { [key: string]: string } = {
      'visa': 'assets/images/payment-methods/visa.png',
      'master': 'assets/images/payment-methods/mastercard.png',
      'amex': 'assets/images/payment-methods/amex.png',
      'diners': 'assets/images/payment-methods/diners.png'
    };
    return brandLogos[brand] || 'assets/images/payment-methods/card-default.png';
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}