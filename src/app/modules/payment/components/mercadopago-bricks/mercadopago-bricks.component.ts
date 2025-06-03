import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

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
}

@Component({
  selector: 'app-mercadopago-bricks',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mercadopago-container">
      <div class="alert alert-info mb-4">
        <i class="bi bi-shield-check me-2"></i>
        <strong>Pago seguro con MercadoPago</strong>
        <p class="mb-0 mt-1">Completa los datos de tu tarjeta de forma segura. No almacenamos tu información financiera.</p>
      </div>
      
      <div id="cardPaymentBrick_container"></div>
      
      <div class="mt-3 text-center" *ngIf="isLoading">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Procesando pago...</span>
        </div>
        <p class="mt-2 text-muted">Procesando tu pago...</p>
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

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadMercadoPagoSDK();
    }
  }

  ngOnDestroy(): void {
    this.destroyBricks();
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
      }
      
      // Resetear las referencias
      this.cardPaymentBrickController = null;
      this.bricks = null;
      this.mp = null;
    } catch (error) {
      console.warn('Error destroying MercadoPago Bricks:', error);
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
    
    // Aquí normalmente enviarías los datos al backend para procesar el pago
    // Por ahora simularemos el proceso
    setTimeout(() => {
      this.isLoading = false;
      // Simular éxito del pago
      this.paymentSuccess.emit({
        paymentId: 'MP_' + Date.now(),
        status: 'approved',
        ...cardFormData
      });
    }, 2000);
  }
} 