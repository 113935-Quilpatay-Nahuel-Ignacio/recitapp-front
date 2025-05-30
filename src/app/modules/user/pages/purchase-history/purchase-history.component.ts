import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { UserService } from '../../services/user.service';
import { PurchaseHistory } from '../../models/purchase-history';
import { Router } from '@angular/router';
import { SessionService } from '../../../../core/services/session.service';

@Component({
  selector: 'app-purchase-history',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './purchase-history.component.html',
  styleUrls: ['./purchase-history.component.scss'],
})
export class PurchaseHistoryComponent implements OnInit {
  purchases: PurchaseHistory[] = [];
  userId: number | null = null;
  loading = false;
  error = '';

  constructor(
    private userService: UserService, 
    private router: Router,
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    // Get current user ID from session
    this.userId = this.sessionService.getCurrentUserId();
    
    if (!this.userId) {
      this.error = 'Usuario no autenticado';
      return;
    }
    
    this.loadPurchaseHistory();
  }

  loadPurchaseHistory(): void {
    if (!this.userId) {
      this.error = 'Usuario no autenticado';
      return;
    }

    this.loading = true;

    this.userService.getUserPurchaseHistory(this.userId).subscribe({
      next: (purchases) => {
        this.purchases = purchases;
        this.loading = false;
      },
      error: (err) => {
        this.error =
          err.error?.message || 'Error al cargar historial de compras';
        this.loading = false;
      },
    });
  }

  goToEventDetails(eventId: number): void {
    this.router.navigate(['/event', eventId]);
  }

  goToTicketDetails(ticketId: number): void {
    if (ticketId === undefined || ticketId === null) {
      console.error(
        'Error: ticketId is undefined or null, cannot navigate to ticket details.',
        'Check the data source for purchase history items.'
      );
      this.error =
        'ID de entrada no disponible. No se pueden mostrar los detalles.';
      return;
    }
    this.router.navigate(['/ticket', ticketId]);
  }
}
