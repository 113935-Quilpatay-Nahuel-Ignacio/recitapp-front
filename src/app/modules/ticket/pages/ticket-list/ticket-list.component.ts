import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Ticket } from '../../models/ticket.model';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../../../core/services/auth.service';

interface TicketStats {
  total: number;
  active: number;
  used: number;
  expired: number;
}

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule
  ],
  templateUrl: './ticket-list.component.html',
  styleUrl: './ticket-list.component.scss'
})
export class TicketListComponent implements OnInit {
  private ticketService = inject(TicketService);
  private authService = inject(AuthService);
  private router = inject(Router);

  tickets: Ticket[] = [];
  filteredTickets: Ticket[] = [];
  isLoading = true;
  error: string | null = null;
  
  // Filter properties
  searchTerm = '';
  selectedStatus = 'all';
  selectedDateFilter = 'all';
  
  // Statistics
  stats: TicketStats = {
    total: 0,
    active: 0,
    used: 0,
    expired: 0
  };

  // Filter tabs
  activeTab = 'all';

  ngOnInit(): void {
    this.loadUserTickets();
  }

  private loadUserTickets(): void {
    this.isLoading = true;
    this.error = null;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.error = 'Usuario no autenticado';
      this.isLoading = false;
      return;
    }

    this.ticketService.getUserTickets(currentUser.id)
      .pipe(
        catchError((error: any) => {
          console.error('Error loading user tickets:', error);
          this.error = 'Error al cargar las entradas';
          return of([]);
        })
      )
      .subscribe(tickets => {
        this.tickets = tickets;
        this.calculateStats();
        this.applyFilters();
        this.isLoading = false;
      });
  }

  private calculateStats(): void {
    this.stats = {
      total: this.tickets.length,
      active: this.tickets.filter(t => t.status.toLowerCase() === 'activa' || t.status.toLowerCase() === 'active').length,
      used: this.tickets.filter(t => t.status.toLowerCase() === 'usada' || t.status.toLowerCase() === 'used').length,
      expired: this.tickets.filter(t => t.status.toLowerCase() === 'expirada' || t.status.toLowerCase() === 'expired').length
    };
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  onDateFilterChange(): void {
    this.applyFilters();
  }

  onTabChange(tab: string): void {
    this.activeTab = tab;
    this.selectedStatus = tab;
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.tickets];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(ticket =>
        ticket.eventName.toLowerCase().includes(term) ||
        ticket.venueName.toLowerCase().includes(term) ||
        ticket.sectionName.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(ticket => {
        const status = ticket.status.toLowerCase();
        switch (this.selectedStatus) {
          case 'active':
            return status === 'activa' || status === 'active';
          case 'used':
            return status === 'usada' || status === 'used';
          case 'expired':
            return status === 'expirada' || status === 'expired';
          default:
            return true;
        }
      });
    }

    // Apply date filter
    if (this.selectedDateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(ticket => {
        const eventDate = new Date(ticket.eventDate);
        switch (this.selectedDateFilter) {
          case 'upcoming':
            return eventDate > now;
          case 'past':
            return eventDate < now;
          case 'this-week':
            const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            return eventDate >= now && eventDate <= weekFromNow;
          case 'this-month':
            const monthFromNow = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
            return eventDate >= now && eventDate <= monthFromNow;
          default:
            return true;
        }
      });
    }

    this.filteredTickets = filtered;
  }

  viewTicketDetails(ticket: Ticket): void {
    // Navigate to ticket detail page
    this.router.navigate(['/tickets', ticket.id]);
  }

  downloadTicket(ticket: Ticket): void {
    // Implement ticket download functionality
    console.log('Downloading ticket:', ticket.id);
  }

  shareTicket(ticket: Ticket): void {
    // Implement ticket sharing functionality
    if (navigator.share) {
      navigator.share({
        title: `Entrada para ${ticket.eventName}`,
        text: `Tengo una entrada para ${ticket.eventName} en ${ticket.venueName}`,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(
        `Entrada para ${ticket.eventName} en ${ticket.venueName} - ${window.location.href}`
      );
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  }

  getStatusClass(status: string): string {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'activa':
      case 'active':
        return 'success';
      case 'usada':
      case 'used':
        return 'info';
      case 'expirada':
      case 'expired':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getStatusIcon(status: string): string {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'activa':
      case 'active':
        return 'bi-check-circle';
      case 'usada':
      case 'used':
        return 'bi-check2-all';
      case 'expirada':
      case 'expired':
        return 'bi-x-circle';
      default:
        return 'bi-question-circle';
    }
  }

  refreshTickets(): void {
    this.loadUserTickets();
  }

  goToEvents(): void {
    this.router.navigate(['/events']);
  }
}
