import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { 
  PaymentResponse, 
  PaymentStatusCode, 
  MercadoPagoStatusHandler 
} from '../../models/mercadopago-payment-status';

@Component({
  selector: 'app-payment-result',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="payment-result-container" [ngClass]="getContainerClass()">
      <div class="payment-result-card">
        <!-- Ícono del estado -->
        <div class="payment-result-icon">
          <i [class]="getStatusIcon()" [ngClass]="getIconClass()"></i>
        </div>

        <!-- Título del estado -->
        <h2 class="payment-result-title" [ngClass]="getTitleClass()">
          {{ getDisplayName() }}
        </h2>

        <!-- Mensaje principal para el usuario -->
        <div class="payment-result-message">
          <p class="main-message">{{ getUserMessage() }}</p>
          
          <!-- Información adicional del pago -->
          <div class="payment-info" *ngIf="paymentResponse.paymentId">
            <div class="info-item">
              <strong>ID de Pago:</strong> {{ paymentResponse.paymentId }}
            </div>
            <div class="info-item" *ngIf="paymentResponse.totalAmount">
              <strong>Monto:</strong> ${{ paymentResponse.totalAmount | number:'1.2-2' }}
            </div>
            <div class="info-item" *ngIf="paymentResponse.paymentMethodInfo?.paymentMethodName">
              <strong>Método de pago:</strong> {{ paymentResponse.paymentMethodInfo.paymentMethodName }}
            </div>
          </div>
        </div>

        <!-- Acciones específicas según el estado -->
        <div class="payment-result-actions">
          
          <!-- CASO 1: Pago aprobado - mostrar botón para ver entradas -->
          <ng-container *ngIf="shouldDeliverTickets()">
            <div class="success-actions">
              <p class="success-note">
                <i class="bi bi-check-circle me-2"></i>
                ¡Felicitaciones! Tus entradas han sido generadas exitosamente.
              </p>
              <div class="action-buttons">
                <button class="btn btn-primary btn-lg" routerLink="/tickets">
                  <i class="bi bi-ticket-perforated me-2"></i>
                  Ver Mis Entradas
                </button>
                <button class="btn btn-outline-secondary" routerLink="/events">
                  <i class="bi bi-calendar-event me-2"></i>
                  Explorar Más Eventos
                </button>
              </div>
            </div>
          </ng-container>

          <!-- CASO 2: Pago pendiente - mostrar mensaje de espera con botón a Mis Entradas -->
          <ng-container *ngIf="isPendingPayment()">
            <div class="pending-actions">
              <p class="pending-note">
                <i class="bi bi-clock me-2"></i>
                Te daremos tus entradas cuando se procese el pago. 
                Puedes revisar el estado en tu sección de entradas.
              </p>
              <div class="action-buttons">
                <button class="btn btn-warning btn-lg" routerLink="/tickets">
                  <i class="bi bi-ticket-perforated me-2"></i>
                  Ir a Mis Entradas
                </button>
                <button class="btn btn-outline-secondary" routerLink="/events">
                  <i class="bi bi-calendar-event me-2"></i>
                  Explorar Eventos
                </button>
              </div>
            </div>
          </ng-container>

          <!-- CASO 3: Pago rechazado - mostrar opciones para reintentar -->
          <ng-container *ngIf="canRetryPayment()">
            <div class="retry-actions">
              <p class="retry-note">
                <i class="bi bi-info-circle me-2"></i>
                No te preocupes, puedes intentarlo nuevamente corrigiendo el problema.
              </p>
              
              <!-- Sugerencias específicas según el tipo de error -->
              <div class="error-suggestions" *ngIf="getErrorSuggestions().length > 0">
                <h6>Sugerencias:</h6>
                <ul class="suggestions-list">
                  <li *ngFor="let suggestion of getErrorSuggestions()">
                    {{ suggestion }}
                  </li>
                </ul>
              </div>

              <div class="action-buttons">
                <button 
                  class="btn btn-danger btn-lg" 
                  (click)="onRetryPayment()"
                  [disabled]="isRetrying">
                  <i class="bi bi-arrow-clockwise me-2" [class.spin]="isRetrying"></i>
                  {{ isRetrying ? 'Reintentando...' : 'Intentar de Nuevo' }}
                </button>
                <button class="btn btn-outline-secondary" routerLink="/events">
                  <i class="bi bi-arrow-left me-2"></i>
                  Volver a Eventos
                </button>
              </div>
            </div>
          </ng-container>

          <!-- CASO 4: Estados que no permiten acción (cancelado, reembolsado, etc.) -->
          <ng-container *ngIf="!shouldDeliverTickets() && !isPendingPayment() && !canRetryPayment()">
            <div class="neutral-actions">
              <div class="action-buttons">
                <button class="btn btn-outline-primary" routerLink="/events">
                  <i class="bi bi-calendar-event me-2"></i>
                  Explorar Eventos
                </button>
                <button class="btn btn-outline-secondary" routerLink="/tickets">
                  <i class="bi bi-ticket-perforated me-2"></i>
                  Mis Entradas
                </button>
              </div>
            </div>
          </ng-container>
        </div>

        <!-- Información de soporte -->
        <div class="support-info" *ngIf="needsSupport()">
          <p class="support-text">
            <i class="bi bi-headset me-2"></i>
            ¿Necesitas ayuda? 
            <a href="mailto:soporte@recitapp.com" class="support-link">
              Contacta a nuestro soporte
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .payment-result-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .payment-result-card {
      background: white;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      padding: 40px;
      text-align: center;
      max-width: 600px;
      width: 100%;
    }

    .payment-result-icon {
      margin-bottom: 20px;
    }

    .payment-result-icon i {
      font-size: 4rem;
    }

    .icon-success { color: #28a745; }
    .icon-error { color: #dc3545; }
    .icon-pending { color: #ffc107; }
    .icon-neutral { color: #6c757d; }

    .payment-result-title {
      margin-bottom: 20px;
      font-size: 1.8rem;
      font-weight: 600;
    }

    .title-success { color: #28a745; }
    .title-error { color: #dc3545; }
    .title-pending { color: #ffc107; }
    .title-neutral { color: #495057; }

    .payment-result-message {
      margin-bottom: 30px;
    }

    .main-message {
      font-size: 1.1rem;
      line-height: 1.6;
      color: #495057;
      margin-bottom: 20px;
    }

    .payment-info {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 15px;
      margin: 20px 0;
    }

    .info-item {
      margin-bottom: 8px;
      font-size: 0.9rem;
    }

    .payment-result-actions {
      margin-bottom: 20px;
    }

    .action-buttons {
      display: flex;
      gap: 15px;
      justify-content: center;
      flex-wrap: wrap;
      margin-top: 20px;
    }

    .btn {
      border-radius: 8px;
      padding: 12px 24px;
      font-weight: 500;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      transition: all 0.3s ease;
    }

    .btn-lg {
      padding: 15px 30px;
      font-size: 1.1rem;
    }

    .success-note, .pending-note, .retry-note {
      background: rgba(40, 167, 69, 0.1);
      border: 1px solid rgba(40, 167, 69, 0.2);
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 20px;
      font-size: 0.95rem;
    }

    .pending-note {
      background: rgba(255, 193, 7, 0.1);
      border-color: rgba(255, 193, 7, 0.2);
    }

    .retry-note {
      background: rgba(220, 53, 69, 0.1);
      border-color: rgba(220, 53, 69, 0.2);
    }

    .error-suggestions {
      text-align: left;
      margin: 15px 0;
      padding: 15px;
      background: #fff3cd;
      border-radius: 8px;
    }

    .suggestions-list {
      margin: 10px 0 0 0;
      padding-left: 20px;
    }

    .suggestions-list li {
      margin-bottom: 5px;
      font-size: 0.9rem;
    }

    .support-info {
      border-top: 1px solid #dee2e6;
      padding-top: 20px;
      margin-top: 20px;
    }

    .support-text {
      font-size: 0.9rem;
      color: #6c757d;
      margin: 0;
    }

    .support-link {
      color: #007bff;
      text-decoration: none;
    }

    .support-link:hover {
      text-decoration: underline;
    }

    .spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .payment-result-card {
        padding: 30px 20px;
      }

      .action-buttons {
        flex-direction: column;
      }

      .btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class PaymentResultComponent implements OnInit {
  @Input() paymentResponse!: PaymentResponse;
  @Output() retryPayment = new EventEmitter<void>();

  isRetrying = false;

  ngOnInit(): void {
    if (!this.paymentResponse) {
      console.error('PaymentResultComponent: paymentResponse is required');
    }
  }

  getStatusCode(): PaymentStatusCode {
    return this.paymentResponse?.statusCode || 'unknown';
  }

  getDisplayName(): string {
    return this.paymentResponse?.displayName || 
           MercadoPagoStatusHandler.getStatusInfo(this.getStatusCode()).displayName;
  }

  getUserMessage(): string {
    return this.paymentResponse?.userMessage || 
           MercadoPagoStatusHandler.getUserMessage(this.getStatusCode());
  }

  shouldDeliverTickets(): boolean {
    return this.paymentResponse?.shouldDeliverTickets ?? 
           MercadoPagoStatusHandler.shouldDeliverTickets(this.getStatusCode());
  }

  canRetryPayment(): boolean {
    return this.paymentResponse?.canRetry ?? 
           MercadoPagoStatusHandler.canRetryPayment(this.getStatusCode());
  }

  isPendingPayment(): boolean {
    const statusCode = this.getStatusCode();
    return statusCode === 'CONT' || statusCode === 'pending' || statusCode === 'in_process';
  }

  needsSupport(): boolean {
    const statusCode = this.getStatusCode();
    return statusCode === 'unknown' || statusCode === 'ERROR' || statusCode === 'CALL';
  }

  getContainerClass(): string {
    const cssClass = MercadoPagoStatusHandler.getStatusCssClass(this.getStatusCode());
    return `container-${cssClass}`;
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
          'Contacta a tu banco para verificar límites'
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

  onRetryPayment(): void {
    this.isRetrying = true;
    this.retryPayment.emit();
    
    // Simular un pequeño delay para UX
    setTimeout(() => {
      this.isRetrying = false;
    }, 2000);
  }
} 