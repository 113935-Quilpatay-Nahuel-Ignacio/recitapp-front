import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-payment-failure',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <div class="card shadow">
            <div class="card-body text-center py-5">
              <div class="mb-4">
                <i class="bi bi-x-circle-fill text-danger" style="font-size: 4rem;"></i>
              </div>
              
              <h2 class="text-danger mb-3">Pago No Procesado</h2>
              
              <p class="lead mb-4">
                Hubo un problema al procesar tu pago.
              </p>
              
              <div class="alert alert-warning mb-4" *ngIf="paymentId">
                <strong>ID de Pago:</strong> {{ paymentId }}
              </div>
              
              <div class="alert alert-warning mb-4" *ngIf="status">
                <strong>Estado:</strong> {{ status }}
              </div>
              
              <p class="text-muted mb-4">
                No se realizó ningún cargo. Puedes intentar nuevamente o contactar con soporte.
              </p>
              
              <div class="d-grid gap-2 d-md-flex justify-content-md-center">
                <button class="btn btn-primary" (click)="goBack()">
                  <i class="bi bi-arrow-left me-2"></i>
                  Intentar Nuevamente
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
export class PaymentFailureComponent implements OnInit {
  paymentId: string | null = null;
  status: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.paymentId = params['payment_id'] || null;
      this.status = params['status'] || null;
    });
  }

  goBack(): void {
    window.history.back();
  }
} 