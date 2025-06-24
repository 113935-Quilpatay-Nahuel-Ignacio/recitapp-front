import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentBrickComponent, PaymentBrickData } from '../../components/payment-brick/payment-brick.component';
import { MercadoPagoApiComponent } from '../../components/mercadopago-api/mercadopago-api.component';

export interface PaymentSelectionData {
  eventId: number;
  userId: number;
  totalAmount: number;
  tickets: Array<{
    ticketPriceId: number;
    ticketType: string;
    price: number;
    quantity: number;
  }>;
  userInfo: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
}

@Component({
  selector: 'app-payment-selection',
  standalone: true,
  imports: [CommonModule, FormsModule, PaymentBrickComponent, MercadoPagoApiComponent],
  template: `
    <div class="payment-selection-container">
      
      <!-- Header -->
      <div class="payment-header mb-4">
        <h3 class="mb-2">
          <i class="bi bi-credit-card me-2"></i>
          Selecciona tu método de pago
        </h3>
        <p class="text-muted">
          Elige la opción de pago que prefieras para completar tu compra
        </p>
      </div>

      <!-- Payment Method Selection -->
      <div class="payment-method-selection mb-4" *ngIf="!selectedPaymentMethod">
        <div class="row g-3">
          
          <!-- Payment Brick (Unificado) -->
          <div class="col-md-6">
            <div class="payment-option-card" 
                 (click)="selectPaymentMethod('payment-brick')"
                 role="button"
                 tabindex="0"
                 [attr.aria-label]="'Seleccionar Payment Brick'"
                 (keydown.enter)="selectPaymentMethod('payment-brick')"
                 (keydown.space)="selectPaymentMethod('payment-brick')">
              
              <div class="payment-option-icon">
                <i class="bi bi-wallet2 text-primary"></i>
              </div>
              
              <h5 class="payment-option-title">Payment Brick</h5>
              
              <p class="payment-option-description">
                Método unificado que incluye todas las opciones:
              </p>
              
              <ul class="payment-option-features">
                <li><i class="bi bi-check-circle text-success me-2"></i>Saldo de MercadoPago</li>
                <li><i class="bi bi-check-circle text-success me-2"></i>Tarjetas de crédito</li>
                <li><i class="bi bi-check-circle text-success me-2"></i>Tarjetas de débito</li>
                <li><i class="bi bi-check-circle text-success me-2"></i>Login independiente en MP</li>
              </ul>
              
              <div class="payment-option-badge">
                <span class="badge bg-primary">Recomendado</span>
              </div>
            </div>
          </div>

          <!-- Card Payment Brick (API) -->
          <div class="col-md-6">
            <div class="payment-option-card" 
                 (click)="selectPaymentMethod('card-api')"
                 role="button"
                 tabindex="0"
                 [attr.aria-label]="'Seleccionar Card API'"
                 (keydown.enter)="selectPaymentMethod('card-api')"
                 (keydown.space)="selectPaymentMethod('card-api')">
              
              <div class="payment-option-icon">
                <i class="bi bi-credit-card text-info"></i>
              </div>
              
              <h5 class="payment-option-title">Card Payment API</h5>
              
              <p class="payment-option-description">
                Método tradicional solo con tarjetas:
              </p>
              
              <ul class="payment-option-features">
                <li><i class="bi bi-check-circle text-success me-2"></i>Tarjetas de crédito</li>
                <li><i class="bi bi-check-circle text-success me-2"></i>Tarjetas de débito</li>
                <li><i class="bi bi-x-circle text-danger me-2"></i>Sin saldo de MP</li>
                <li><i class="bi bi-info-circle text-warning me-2"></i>Datos manuales</li>
              </ul>
              
              <div class="payment-option-badge">
                <span class="badge bg-info">Tradicional</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Back Button -->
      <div class="back-button-container mb-3" *ngIf="selectedPaymentMethod">
        <button class="btn btn-outline-secondary" (click)="goBack()">
          <i class="bi bi-arrow-left me-2"></i>
          Cambiar método de pago
        </button>
      </div>

      <!-- Selected Payment Method -->
      <div class="selected-payment-method" *ngIf="selectedPaymentMethod">
        
        <!-- Payment Brick -->
        <div *ngIf="selectedPaymentMethod === 'payment-brick'">
          <div class="alert alert-info mb-3">
            <i class="bi bi-info-circle me-2"></i>
            <strong>Payment Brick seleccionado:</strong> 
            Puedes pagar con tu saldo de MercadoPago o tarjetas. Si tu cuenta de MercadoPago es diferente 
            a {{ paymentData.userInfo.email }}, podrás iniciar sesión con tu propia cuenta.
          </div>
          
          <app-payment-brick
            [paymentData]="getPaymentBrickData()"
            (paymentSuccess)="onPaymentSuccess($event)"
            (paymentError)="onPaymentError($event)"
            (paymentPending)="onPaymentPending($event)">
          </app-payment-brick>
        </div>

        <!-- Card API -->
        <div *ngIf="selectedPaymentMethod === 'card-api'">
          <div class="alert alert-warning mb-3">
            <i class="bi bi-exclamation-triangle me-2"></i>
            <strong>Card API seleccionado:</strong> 
            Solo podrás pagar con tarjetas de crédito o débito. No incluye saldo de MercadoPago.
          </div>
          
          <app-mercadopago-api
            [paymentData]="getCardApiData()"
            (paymentSuccess)="onPaymentSuccess($event)"
            (paymentError)="onPaymentError($event)">
          </app-mercadopago-api>
        </div>

      </div>

      <!-- Loading -->
      <div *ngIf="isProcessingPayment" class="text-center py-5">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Procesando pago...</span>
        </div>
        <p>Procesando tu pago...</p>
      </div>

    </div>
  `,
  styles: [`
    .payment-selection-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .payment-header {
      text-align: center;
      border-bottom: 2px solid #e9ecef;
      padding-bottom: 20px;
    }

    .payment-option-card {
      border: 2px solid #e9ecef;
      border-radius: 12px;
      padding: 25px 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: white;
      height: 100%;
      position: relative;
      min-height: 300px;
      display: flex;
      flex-direction: column;
    }

    .payment-option-card:hover {
      border-color: #009ee3;
      box-shadow: 0 4px 16px rgba(0, 158, 227, 0.15);
      transform: translateY(-2px);
    }

    .payment-option-icon {
      font-size: 3rem;
      margin-bottom: 15px;
    }

    .payment-option-title {
      color: #333;
      font-weight: 600;
      margin-bottom: 10px;
    }

    .payment-option-description {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 15px;
    }

    .payment-option-features {
      list-style: none;
      padding: 0;
      margin-bottom: 20px;
      flex-grow: 1;
    }

    .payment-option-features li {
      text-align: left;
      padding: 5px 0;
      font-size: 0.9rem;
    }

    .payment-option-badge {
      position: absolute;
      top: 15px;
      right: 15px;
    }

    .selected-payment-method {
      border: 2px solid #009ee3;
      border-radius: 12px;
      padding: 20px;
      background: #f8fffe;
    }

    .back-button-container {
      text-align: center;
    }

    @media (max-width: 768px) {
      .payment-selection-container {
        padding: 15px;
      }

      .payment-option-card {
        margin-bottom: 15px;
        min-height: 250px;
      }

      .payment-option-icon {
        font-size: 2.5rem;
      }
    }
  `]
})
export class PaymentSelectionComponent implements OnInit {
  @Input() paymentData!: PaymentSelectionData;
  @Output() paymentCompleted = new EventEmitter<any>();
  @Output() paymentFailed = new EventEmitter<any>();

  selectedPaymentMethod: 'payment-brick' | 'card-api' | null = null;
  isProcessingPayment = false;

  ngOnInit(): void {
    console.log('Payment Selection initialized with data:', this.paymentData);
  }

  selectPaymentMethod(method: 'payment-brick' | 'card-api'): void {
    console.log('Selected payment method:', method);
    this.selectedPaymentMethod = method;
    
    // Scroll automático al seleccionar Payment Brick
    if (method === 'payment-brick') {
      setTimeout(() => {
        this.scrollToPaymentSection();
      }, 100);
    }
  }

  /**
   * Hace scroll suave hacia la sección de pago después de seleccionar método
   */
  private scrollToPaymentSection(): void {
    try {
      const paymentSection = document.querySelector('.selected-payment-method');
      if (paymentSection) {
        paymentSection.scrollIntoView({
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
      console.warn('Could not scroll to payment section:', error);
      // Fallback más simple
      window.scrollBy(0, 300);
    }
  }

  goBack(): void {
    this.selectedPaymentMethod = null;
  }

  getPaymentBrickData(): PaymentBrickData {
    return {
      eventId: this.paymentData.eventId,
      userId: this.paymentData.userId,
      totalAmount: this.paymentData.totalAmount,
      tickets: this.paymentData.tickets,
      payer: {
        email: this.paymentData.userInfo.email,
        firstName: this.paymentData.userInfo.firstName,
        lastName: this.paymentData.userInfo.lastName,
        phone: this.paymentData.userInfo.phone
      },
      config: {
        locale: 'es-AR',
        theme: 'default',
        paymentMethods: {
          creditCard: true,
          debitCard: true,
          mercadoPagoWallet: true,
          ticket: false,
          bankTransfer: false
        },
        maxInstallments: 12,
        purpose: 'wallet_purchase'
      }
    };
  }

  getCardApiData(): any {
    // Adaptar datos para el componente Card API existente
    return {
      eventId: this.paymentData.eventId,
      userId: this.paymentData.userId,
      totalAmount: this.paymentData.totalAmount,
      tickets: this.paymentData.tickets,
      payer: this.paymentData.userInfo,
      apiConfig: {
        locale: 'es-AR',
        theme: 'default',
        enabledPaymentMethods: {
          creditCard: true,
          debitCard: true,
          mercadoPagoWallet: false // Sin saldo de MP en Card API
        }
      }
    };
  }

  onPaymentSuccess(result: any): void {
    console.log('Payment successful:', result);
    this.isProcessingPayment = false;
    this.paymentCompleted.emit({
      ...result,
      paymentMethod: this.selectedPaymentMethod
    });
  }

  onPaymentError(error: any): void {
    console.error('Payment error:', error);
    this.isProcessingPayment = false;
    this.paymentFailed.emit({
      ...error,
      paymentMethod: this.selectedPaymentMethod
    });
  }

  onPaymentPending(result: any): void {
    console.log('Payment pending:', result);
    this.isProcessingPayment = false;
    // Tratar pending como éxito parcial
    this.paymentCompleted.emit({
      ...result,
      paymentMethod: this.selectedPaymentMethod,
      status: 'pending'
    });
  }
} 