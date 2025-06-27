import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { 
  PaymentResponse, 
  PaymentStatusCode, 
  MercadoPagoStatusHandler 
} from '../../models/mercadopago-payment-status';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styleUrls: ['./payment-success.component.scss'],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-10 col-lg-8">
          <div class="payment-result-card" [ngClass]="getCardClass()">
            <div class="card-body text-center py-5">
              
              <!-- Ícono del estado -->
              <div class="mb-4">
                <i [class]="getStatusIcon()" [ngClass]="getIconClass()" style="font-size: 4rem;"></i>
              </div>
              
              <!-- Título dinámico según estado -->
              <h2 [ngClass]="getTitleClass()" class="mb-3">{{ getDisplayName() }}</h2>
              
              <!-- Mensaje principal -->
              <p class="lead mb-4">{{ getUserMessage() }}</p>
              
              <!-- Información del pago -->
              <div class="payment-details mb-4" *ngIf="showPaymentDetails()">
                <div class="row">
                  <div class="col-md-6" *ngIf="paymentId">
                    <div class="detail-item">
                      <strong>ID de Pago:</strong>
                      <span class="detail-value">{{ paymentId }}</span>
                    </div>
                  </div>
                  <div class="col-md-6" *ngIf="amount">
                    <div class="detail-item">
                      <strong>Monto:</strong>
                      <span class="detail-value">\${{ amount | number:'1.2-2' }}</span>
                    </div>
                  </div>
                  <div class="col-12" *ngIf="paymentMethod">
                    <div class="detail-item">
                      <strong>Método de pago:</strong>
                      <span class="detail-value">{{ paymentMethod }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Mensaje específico según estado -->
              <div class="status-specific-content mb-4">
                
                <!-- CASO 1: Pago aprobado -->
                <div *ngIf="shouldDeliverTickets()" class="success-content">
                  <div class="alert alert-success">
                    <i class="fas fa-check-circle me-2"></i>
                    <strong>¡Felicitaciones!</strong> Tus entradas han sido generadas exitosamente.
                    Recibirás un correo electrónico con todos los detalles.
                  </div>
                </div>

                <!-- CASO 2: Pago pendiente -->
                <div *ngIf="isPendingPayment()" class="pending-content">
                  <div class="alert alert-warning">
                    <i class="fas fa-clock me-2"></i>
                    <strong>Pago en proceso.</strong> Te daremos tus entradas cuando se complete el procesamiento.
                    Puedes revisar el estado en tu sección de entradas.
                  </div>
                </div>

                <!-- CASO 3: Pago rechazado -->
                <div *ngIf="canRetryPayment()" class="error-content">
                  <div class="alert alert-danger">
                    <i class="fas fa-times-circle me-2"></i>
                    <strong>Pago rechazado.</strong> No te preocupes, puedes intentarlo nuevamente.
                  </div>
                  
                  <!-- Sugerencias específicas -->
                  <div class="error-suggestions" *ngIf="getErrorSuggestions().length > 0">
                    <h6 class="text-start">Sugerencias para solucionar el problema:</h6>
                    <ul class="text-start suggestions-list">
                      <li *ngFor="let suggestion of getErrorSuggestions()">{{ suggestion }}</li>
                    </ul>
                  </div>
                </div>

                <!-- CASO 4: Otros estados -->
                <div *ngIf="!shouldDeliverTickets() && !isPendingPayment() && !canRetryPayment()" class="neutral-content">
                  <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    {{ getUserMessage() }}
                  </div>
                </div>
              </div>
              
              <!-- Acciones según estado -->
              <div class="action-buttons">
                
                <!-- Acciones para pago aprobado -->
                <div *ngIf="shouldDeliverTickets()" class="success-actions">
                  <div class="d-grid gap-2 d-md-flex justify-content-md-center">
                    <button class="btn btn-primary btn-lg" routerLink="/tickets">
                      <i class="fas fa-ticket-alt me-2"></i>
                      Ver Mis Entradas
                    </button>
                    <button class="btn btn-outline-secondary" routerLink="/events">
                      <i class="fas fa-calendar-alt me-2"></i>
                      Explorar Más Eventos
                    </button>
                  </div>
                </div>

                <!-- Acciones para pago pendiente -->
                <div *ngIf="isPendingPayment()" class="pending-actions">
                  <div class="d-grid gap-2 d-md-flex justify-content-md-center">
                    <button class="btn btn-warning btn-lg" routerLink="/tickets">
                      <i class="fas fa-ticket-alt me-2"></i>
                      Ir a Mis Entradas
                    </button>
                    <button class="btn btn-outline-secondary" routerLink="/events">
                      <i class="fas fa-calendar-alt me-2"></i>
                      Explorar Eventos
                    </button>
                  </div>
                </div>

                <!-- Acciones para pago rechazado -->
                <div *ngIf="canRetryPayment()" class="retry-actions">
                  <div class="d-grid gap-2 d-md-flex justify-content-md-center">
                    <button class="btn btn-danger btn-lg" (click)="retryPayment()">
                      <i class="fas fa-redo me-2"></i>
                      Intentar de Nuevo
                    </button>
                    <button class="btn btn-outline-secondary" routerLink="/events">
                      <i class="fas fa-arrow-left me-2"></i>
                      Volver a Eventos
                    </button>
                  </div>
                </div>

                <!-- Acciones por defecto -->
                <div *ngIf="!shouldDeliverTickets() && !isPendingPayment() && !canRetryPayment()" class="default-actions">
                  <div class="d-grid gap-2 d-md-flex justify-content-md-center">
                    <button class="btn btn-outline-primary" routerLink="/events">
                      <i class="fas fa-calendar-alt me-2"></i>
                      Explorar Eventos
                    </button>
                    <button class="btn btn-outline-secondary" routerLink="/tickets">
                      <i class="fas fa-ticket-alt me-2"></i>
                      Mis Entradas
                    </button>
                  </div>
                </div>
              </div>

              <!-- Información de soporte -->
              <div class="support-info mt-4" *ngIf="needsSupport()">
                <p class="text-muted small">
                  <i class="bi bi-headset me-2"></i>
                  ¿Necesitas ayuda? 
                  <a href="mailto:soporte@recitapp.com" class="text-decoration-none">
                    Contacta a nuestro soporte
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PaymentSuccessComponent implements OnInit {
  paymentId: string | null = null;
  status: string | null = null;
  statusCode: PaymentStatusCode | null = null;
  statusDetail: string | null = null;
  amount: number | null = null;
  paymentMethod: string | null = null;
  isDataLoaded = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      console.log('🔍 Payment Success - Query Params:', params);
      
      this.paymentId = params['payment_id'] || params['transaction_id'] || params['id'] || null;
      this.status = params['status'] || null;
      this.statusCode = params['status_code'] || params['statusCode'] || (this.status as PaymentStatusCode) || null;
      this.statusDetail = params['status_detail'] || params['statusDetail'] || null;
      this.amount = params['amount'] ? parseFloat(params['amount']) : null;
      this.paymentMethod = params['payment_method'] || null;
      this.isDataLoaded = true;

      console.log('💳 Payment Success - Processed Data:', {
        paymentId: this.paymentId,
        status: this.status,
        statusCode: this.statusCode,
        statusDetail: this.statusDetail,
        amount: this.amount,
        paymentMethod: this.paymentMethod
      });

      // Si no tenemos información del estado, determinarlo basado en la URL
      if (!this.statusCode && this.status) {
        this.statusCode = this.determineStatusCode(this.status);
        console.log('🔄 Status Code determined from status:', this.status, '→', this.statusCode);
      }
    });
  }

  private determineStatusCode(status: string): PaymentStatusCode {
    // Mapear estados tradicionales a los nuevos códigos
    const statusMap: { [key: string]: PaymentStatusCode } = {
      'COMPLETED': 'APRO',
      'approved': 'APRO',
      'pending': 'CONT',
      'rejected': 'OTHE',
      'cancelled': 'cancelled',
      'in_process': 'CONT'
    };
    
    return statusMap[status] || 'unknown';
  }

  getStatusCode(): PaymentStatusCode {
    return this.statusCode || 'unknown';
  }

  getDisplayName(): string {
    return MercadoPagoStatusHandler.getStatusInfo(this.getStatusCode()).displayName;
  }

  getUserMessage(): string {
    return MercadoPagoStatusHandler.getUserMessage(this.getStatusCode());
  }

  shouldDeliverTickets(): boolean {
    return MercadoPagoStatusHandler.shouldDeliverTickets(this.getStatusCode());
  }

  canRetryPayment(): boolean {
    return MercadoPagoStatusHandler.canRetryPayment(this.getStatusCode());
  }

  isPendingPayment(): boolean {
    const statusCode = this.getStatusCode();
    return statusCode === 'CONT' || statusCode === 'pending' || statusCode === 'in_process';
  }

  needsSupport(): boolean {
    const statusCode = this.getStatusCode();
    return statusCode === 'unknown' || statusCode === 'ERROR' || statusCode === 'CALL';
  }

  showPaymentDetails(): boolean {
    return !!(this.paymentId || this.amount || this.paymentMethod);
  }

  getCardClass(): string {
    const cssClass = MercadoPagoStatusHandler.getStatusCssClass(this.getStatusCode());
    return `card-${cssClass.replace('status-', '')}`;
  }

  getStatusIcon(): string {
    return MercadoPagoStatusHandler.getStatusIcon(this.getStatusCode());
  }

  getIconClass(): string {
    const cssClass = MercadoPagoStatusHandler.getStatusCssClass(this.getStatusCode());
    return `icon-${cssClass.replace('status-', '')}`;
  }

  getTitleClass(): string {
    const cssClass = MercadoPagoStatusHandler.getStatusCssClass(this.getStatusCode());
    return `title-${cssClass.replace('status-', '')}`;
  }

  getErrorSuggestions(): string[] {
    const statusCode = this.getStatusCode();
    
    switch (statusCode) {
      case 'FUND':
        return [
          'Verifica que tu tarjeta tenga fondos suficientes',
          'Intenta con una tarjeta diferente',
          'Contacta a tu banco para verificar límites de compra'
        ];
      case 'SECU':
        return [
          'Verifica que el código CVV sea correcto',
          'Asegúrate de ingresar los 3 o 4 dígitos del reverso de tu tarjeta'
        ];
      case 'EXPI':
        return [
          'Verifica que la fecha de vencimiento sea correcta',
          'Asegúrate de usar el formato MM/AA',
          'Comprueba que tu tarjeta no esté vencida'
        ];
      case 'FORM':
        return [
          'Revisa que todos los campos estén completos',
          'Verifica que los datos de la tarjeta sean correctos',
          'Asegúrate de que no haya espacios o caracteres especiales'
        ];
      case 'CALL':
        return [
          'Contacta a tu banco para autorizar el pago',
          'Informa que estás realizando una compra en línea',
          'Intenta con otra tarjeta mientras tanto'
        ];
      default:
        return [
          'Verifica los datos de tu tarjeta',
          'Intenta con otro método de pago',
          'Asegúrate de tener una conexión estable a internet'
        ];
    }
  }

  retryPayment(): void {
    // Volver a la página anterior o a la selección de eventos
    window.history.back();
  }
} 