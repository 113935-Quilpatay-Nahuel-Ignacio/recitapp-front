import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

import { Ticket } from '../../models/ticket.model';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../../../core/services/auth.service';
import { StatusFormatter } from '../../../../shared/utils/status-formatter.util';

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
  private http = inject(HttpClient);

  tickets: Ticket[] = [];
  filteredTickets: Ticket[] = [];
  isLoading = true;
  error: string | null = null;
  
  // Pagination properties
  currentPage = 0;
  pageSize = 12;
  totalElements = 0;
  totalPages = 0;
  
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

    this.ticketService.getUserTicketsPaginated(currentUser.id, this.currentPage, this.pageSize)
      .pipe(
        catchError((error: any) => {
          console.error('Error loading user tickets:', error);
          this.error = 'Error al cargar las entradas';
          return of({tickets: [], totalElements: 0, totalPages: 0});
        })
      )
      .subscribe(response => {
        console.log('🎁 [DEBUG] Paginated tickets loaded:', response);
        this.tickets = response.tickets;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
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
    this.router.navigate(['/ticket', ticket.id]);
  }

  downloadTicket(ticket: Ticket): void {
    console.log('Downloading ticket:', ticket.id);
    
    const downloadUrl = `${environment.apiUrl}/tickets/${ticket.id}/download-pdf`;
    
    // Create a link element and trigger download
    this.http.get(downloadUrl, { 
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      catchError(error => {
        console.error('Error downloading ticket:', error);
        alert('Error al descargar la entrada. Por favor intenta nuevamente.');
        return of(null);
      })
    ).subscribe(response => {
      if (response && response.body) {
        // Create blob link to download
        const blob = new Blob([response.body], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `entrada_${ticket.eventName.replace(/\s+/g, '_')}_${ticket.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        window.URL.revokeObjectURL(url);
      }
    });
  }

  shareTicket(ticket: Ticket): void {
    const shareText = `🎫 Tengo una entrada para ${ticket.eventName}
📍 Lugar: ${ticket.venueName}
📅 Fecha: ${this.formatDate(ticket.eventDate)}
🎭 Sección: ${ticket.sectionName}
💰 Precio: ${this.formatPrice(ticket.price)}

¡Te esperamos! 🎵`;

    const shareUrl = `${window.location.origin}/ticket/${ticket.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Entrada para ${ticket.eventName}`,
        text: shareText,
        url: shareUrl
      }).catch(err => {
        console.log('Error sharing:', err);
        this.fallbackShare(shareText, shareUrl);
      });
    } else {
      this.fallbackShare(shareText, shareUrl);
    }
  }

  private fallbackShare(text: string, url: string): void {
    const fullText = `${text}\n\nVer detalles: ${url}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullText).then(() => {
        alert('📋 Información de la entrada copiada al portapapeles');
      }).catch(() => {
        this.showShareModal(fullText);
      });
    } else {
      this.showShareModal(fullText);
    }
  }

  private showShareModal(text: string): void {
    // Simple modal fallback
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;">
        <div style="background: white; padding: 20px; border-radius: 8px; max-width: 400px; width: 90%;">
          <h3>Compartir Entrada</h3>
          <textarea readonly style="width: 100%; height: 150px; margin: 10px 0;">${text}</textarea>
          <div style="text-align: right;">
            <button onclick="this.closest('div').parentElement.remove()" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Cerrar</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
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

  formatPrice(price: number | string | null): string {
    // Handle null or undefined
    if (price === null || price === undefined) {
      return 'Gratis';
    }
    
    // Convert to number if it's a string
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    if (numPrice === 0 || isNaN(numPrice)) {
      return 'Gratis';
    }
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(numPrice);
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
    this.currentPage = 0; // Reset to first page
    this.loadUserTickets();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadUserTickets();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 0; // Reset to first page
    this.loadUserTickets();
  }

  get pageNumbers(): number[] {
    const pages = [];
    for (let i = 0; i < this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  getEndIndex(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);
  }

  goToEvents(): void {
    this.router.navigate(['/events']);
  }

  isValidImageData(qrCode: string): boolean {
    // Check if it's a valid data URL for an image
    return qrCode.startsWith('data:image/') && qrCode.includes('base64,') && qrCode.length > 50;
  }

  onQrImageError(event: any): void {
    console.warn('QR image failed to load:', event);
    // The *ngIf will handle showing the placeholder
  }

  isPromotional2x1(ticket: Ticket): boolean {
    if (!ticket) {
      return false;
    }
    
    // Check ticket type first (most reliable method from backend)
    if (ticket.ticketType === 'PROMOTIONAL_2X1') {
      return true;
    }
    
    // Fallback to promotion name/description (case insensitive)
    const promotionName = ticket.promotionName?.toLowerCase() || '';
    const promotionDescription = ticket.promotionDescription?.toLowerCase() || '';
    
    return promotionName.includes('2x1') || 
           promotionName.includes('dos por uno') ||
           promotionDescription.includes('2x1') || 
           promotionDescription.includes('dos por uno');
  }

  formatStatusName(status: string): string {
    return StatusFormatter.formatStatusName(status);
  }
}
