import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-payment-pending',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <div class="card shadow">
            <div class="card-body text-center py-5">
              <div class="mb-4">
                <i class="bi bi-clock-fill text-warning" style="font-size: 4rem;"></i>
              </div>
              
              <h2 class="text-warning mb-3">Pago Pendiente</h2>
              
              <p class="lead mb-4">
                Tu pago está siendo procesado.
              </p>
              
              <div class="alert alert-info mb-4" *ngIf="paymentId">
                <strong>ID de Pago:</strong> {{ paymentId }}
              </div>
              
              <div class="alert alert-info mb-4" *ngIf="status">
                <strong>Estado:</strong> {{ status }}
              </div>
              
              <p class="text-muted mb-4">
                Te notificaremos por correo electrónico cuando el pago sea confirmado.
                Mientras tanto, puedes seguir explorando nuestros eventos.
              </p>
              
              <div class="d-grid gap-2 d-md-flex justify-content-md-center">
                <button class="btn btn-primary" routerLink="/tickets">
                  <i class="bi bi-ticket-perforated me-2"></i>
                  Ver Mis Entradas
                </button>
                <button class="btn btn-outline-secondary" routerLink="/events">
                  <i class="bi bi-calendar-event me-2"></i>
                  Explorar Eventos
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border: none;
      border-radius: 15px;
    }
    
    .btn {
      border-radius: 8px;
      padding: 10px 20px;
    }
  `]
})
export class PaymentPendingComponent implements OnInit {
  paymentId: string | null = null;
  status: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.paymentId = params['payment_id'] || null;
      this.status = params['status'] || null;
    });
  }
} 