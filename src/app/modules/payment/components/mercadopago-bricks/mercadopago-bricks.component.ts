import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PaymentService, PaymentRequest } from '../../services/payment.service';

declare var MercadoPago: any;

export interface BricksConfiguration {
  locale: string;
  theme: string;
  paymentMethods: {
    creditCard: boolean;
    debitCard: boolean;
    mercadoPagoWallet: boolean;
    cash: boolean;
    bankTransfer: boolean;
  };
}

export interface PaymentData {
  totalAmount: number;
  publicKey: string;
  preferenceId: string;
  bricksConfig: BricksConfiguration;
  paymentRequest?: PaymentRequest; // Original payment request data
}

@Component({
  selector: 'app-mercadopago-bricks',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mercadopago-container" role="main" aria-label="Pago con MercadoPago">
      <div class="alert alert-info mb-4" role="banner" aria-live="polite">
        <i class="bi bi-shield-check me-2" aria-hidden="true"></i>
        <strong>Pago seguro con MercadoPago</strong>
        <p class="mb-0 mt-1">Completa los datos de tu tarjeta de forma segura. No almacenamos tu información financiera.</p>
      </div>
      
      <div id="cardPaymentBrick_container" 
           role="region" 
           aria-label="Formulario de pago"></div>
      
      <div class="mt-3 text-center" 
           *ngIf="isLoading" 
           role="status" 
           aria-live="assertive">
        <div class="spinner-border text-primary" 
             role="status" 
             aria-label="Procesando pago">
          <span class="visually-hidden">Procesando pago...</span>
        </div>
        <p class="mt-2 text-muted" aria-live="polite">Procesando tu pago...</p>
      </div>
    </div>
  `,
  styles: [`
    .mercadopago-container {
      max-width: 600px;
      margin: 0 auto;
    }
    
    #cardPaymentBrick_container {
      min-height: 300px;
    }
    
    .alert {
      border-radius: 8px;
    }
  `]
})
export class MercadoPagoBricksComponent implements OnInit, OnDestroy {
  @Input() paymentData!: PaymentData;
  @Output() paymentSuccess = new EventEmitter<any>();
  @Output() paymentError = new EventEmitter<any>();
  
  isLoading = false;
  private mp: any;
  private bricks: any;
  private cardPaymentBrickController: any;
  private accessibilityMonitor: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadMercadoPagoSDK();
      this.startAccessibilityMonitor();
    }
  }

  ngOnDestroy(): void {
    this.destroyBricks();
    this.stopAccessibilityMonitor();
  }

  private destroyBricks(): void {
    try {
      // Destruir el controlador del brick específico si existe
      if (this.cardPaymentBrickController && typeof this.cardPaymentBrickController.unmount === 'function') {
        this.cardPaymentBrickController.unmount();
      }
      
      // Limpiar el contenedor
      const container = document.getElementById('cardPaymentBrick_container');
      if (container) {
        container.innerHTML = '';
        // Remove any problematic attributes
        container.removeAttribute('aria-hidden');
      }
      
      // Clean up any accessibility issues that might persist
      this.cleanupGlobalAccessibilityIssues();
      
      // Resetear las referencias
      this.cardPaymentBrickController = null;
      this.bricks = null;
      this.mp = null;
    } catch (error) {
      console.warn('Error destroying MercadoPago Bricks:', error);
    }
  }

  private cleanupGlobalAccessibilityIssues(): void {
    try {
      // Remove aria-hidden from app-root if it was added
      const appRoot = document.querySelector('app-root');
      if (appRoot && appRoot.hasAttribute('aria-hidden')) {
        appRoot.removeAttribute('aria-hidden');
      }
      
      // Remove any lingering aria-hidden attributes from focusable elements
      const focusableWithAriaHidden = document.querySelectorAll(
        '[aria-hidden="true"] button, [aria-hidden="true"] input, [aria-hidden="true"] select, [aria-hidden="true"] textarea, [aria-hidden="true"] a[href]'
      );
      
      focusableWithAriaHidden.forEach(element => {
        const parent = element.closest('[aria-hidden="true"]');
        if (parent) {
          parent.removeAttribute('aria-hidden');
        }
      });
    } catch (error) {
      console.warn('Error cleaning up accessibility issues:', error);
    }
  }

  private loadMercadoPagoSDK(): void {
    // Verificar si el SDK ya está cargado
    if (typeof MercadoPago !== 'undefined') {
      this.initializeMercadoPago();
      return;
    }

    // Cargar el SDK dinámicamente
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
      // Verificar si ya está inicializado
      if (this.mp && this.bricks) {
        this.createCardPaymentBrick();
        return;
      }

      // Limpiar cualquier brick existente antes de crear uno nuevo
      this.destroyBricks();

      // Inicializar MercadoPago con la public key
      this.mp = new MercadoPago(this.paymentData.publicKey, {
        locale: this.paymentData.bricksConfig.locale
      });

      this.bricks = this.mp.bricks();
      
      // Pequeño delay para asegurar que el DOM esté listo
      setTimeout(() => {
        this.createCardPaymentBrick();
      }, 100);
      
    } catch (error) {
      console.error('Error initializing MercadoPago:', error);
      this.paymentError.emit({ error: 'Error al inicializar MercadoPago' });
    }
  }

  private createCardPaymentBrick(): void {
    const renderCardPaymentBrick = async () => {
      try {
        const settings = {
          initialization: {
            amount: this.paymentData.totalAmount,
            preferenceId: this.paymentData.preferenceId,
          },
          customization: {
            visual: {
              style: {
                theme: this.paymentData.bricksConfig.theme
              }
            },
            paymentMethods: {
              creditCard: this.paymentData.bricksConfig.paymentMethods.creditCard ? 'all' : 'none',
              debitCard: this.paymentData.bricksConfig.paymentMethods.debitCard ? 'all' : 'none',
              mercadoPago: this.paymentData.bricksConfig.paymentMethods.mercadoPagoWallet ? 'all' : 'none'
            }
          },
          callbacks: {
            onReady: () => {
              console.log('MercadoPago Card Payment Brick ready');
              this.fixAccessibilityIssues();
            },
            onSubmit: (cardFormData: any) => {
              this.handlePaymentSubmission(cardFormData);
            },
            onError: (error: any) => {
              console.error('MercadoPago Brick error:', error);
              this.paymentError.emit(error);
            }
          }
        };

        // Almacenar la referencia del controlador del brick
        this.cardPaymentBrickController = await this.bricks.create('cardPayment', 'cardPaymentBrick_container', settings);
      } catch (error) {
        console.error('Error creating card payment brick:', error);
        this.paymentError.emit({ error: 'Error al crear el formulario de pago' });
      }
    };

    renderCardPaymentBrick();
  }

  private handlePaymentSubmission(cardFormData: any): void {
    this.isLoading = true;
    
    if (!this.paymentData.paymentRequest) {
      console.error('Payment request data is missing');
      this.paymentError.emit({ error: 'Datos de pago faltantes' });
      this.isLoading = false;
      return;
    }
    
    // Process the payment through the backend
    this.paymentService.processPayment(this.paymentData.paymentRequest).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Payment processed successfully:', response);
        
        this.paymentSuccess.emit({
          paymentId: response.preferenceId,
          ...response,
          cardFormData
        });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Payment processing failed:', error);
        
        this.paymentError.emit({
          error: 'Error procesando el pago',
          details: error
        });
      }
    });
  }

  private fixAccessibilityIssues(): void {
    try {
      // Wait a bit for DOM to settle
      setTimeout(() => {
        const container = document.getElementById('cardPaymentBrick_container');
        if (container) {
          // Remove aria-hidden from interactive elements
          const interactiveElements = container.querySelectorAll(
            'button, input, select, textarea, [tabindex]:not([tabindex="-1"]), a[href]'
          );
          
          interactiveElements.forEach(element => {
            // Remove aria-hidden from focusable elements
            if (element.hasAttribute('aria-hidden')) {
              element.removeAttribute('aria-hidden');
            }
            
            // Ensure proper accessibility attributes
            if (element.tagName === 'BUTTON' && !element.hasAttribute('aria-label')) {
              const buttonText = element.textContent?.trim();
              if (buttonText) {
                element.setAttribute('aria-label', buttonText);
              }
            }
          });
          
          // Remove aria-hidden from any parent containers that contain focusable elements
          const elementsWithAriaHidden = container.querySelectorAll('[aria-hidden="true"]');
          elementsWithAriaHidden.forEach(element => {
            const hasFocusableDescendants = element.querySelectorAll(
              'button, input, select, textarea, [tabindex]:not([tabindex="-1"]), a[href]'
            ).length > 0;
            
            if (hasFocusableDescendants) {
              element.removeAttribute('aria-hidden');
            }
          });
          
          // Ensure the container itself is accessible
          container.removeAttribute('aria-hidden');
          
          // Add proper role and label to the container
          if (!container.hasAttribute('role')) {
            container.setAttribute('role', 'region');
          }
          if (!container.hasAttribute('aria-label')) {
            container.setAttribute('aria-label', 'Formulario de pago con MercadoPago');
          }
        }
        
        // Also check for issues at app-root level
        const appRoot = document.querySelector('app-root');
        if (appRoot && appRoot.hasAttribute('aria-hidden')) {
          appRoot.removeAttribute('aria-hidden');
        }
      }, 500);
    } catch (error) {
      console.warn('Error fixing accessibility issues:', error);
    }
  }

  private startAccessibilityMonitor(): void {
    // Monitor accessibility issues every 2 seconds
    this.accessibilityMonitor = setInterval(() => {
      this.cleanupGlobalAccessibilityIssues();
    }, 2000);
  }

  private stopAccessibilityMonitor(): void {
    if (this.accessibilityMonitor) {
      clearInterval(this.accessibilityMonitor);
      this.accessibilityMonitor = null;
    }
  }
} 