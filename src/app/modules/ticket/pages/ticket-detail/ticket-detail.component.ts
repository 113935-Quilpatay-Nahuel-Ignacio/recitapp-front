import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TicketService, AttendeeUpdateRequest, TicketTransferBySearchRequest } from '../../services/ticket.service';
import { Ticket } from '../../models/ticket.model';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SessionService } from '../../../../core/services/session.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ModalService } from '../../../../shared/services/modal.service';
import { StatusFormatter } from '../../../../shared/utils/status-formatter.util';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HttpClientModule,
    DatePipe,
    CurrencyPipe,
    ReactiveFormsModule,
  ],
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.scss'],
})
export class TicketDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ticketService = inject(TicketService);
  private fb = inject(FormBuilder);
  private sessionService = inject(SessionService);
  private authService = inject(AuthService);
  private modalService = inject(ModalService);
  private http = inject(HttpClient);

  private ticketSubject = new BehaviorSubject<Ticket | null>(null);
  ticket$: Observable<Ticket | null> = this.ticketSubject.asObservable();
  
  error: string | null = null;
  isEditModalOpen = false;
  attendeeForm: FormGroup;
  
  isTransferModalOpen = false;
  transferTicketForm: FormGroup;
  transferError: string | null = null;
  transferLoading = false;

  editingTicketId: number | null = null;
  isLoading = true;
  currentTicketId: number | null = null;
  currentUserId: number | null = null;

  constructor() {
    this.attendeeForm = this.fb.group({
      attendeeFirstName: ['', Validators.required],
      attendeeLastName: ['', Validators.required],
      attendeeDni: ['', Validators.required],
    });

    this.transferTicketForm = this.fb.group({
      recipientFirstName: ['', Validators.required],
      recipientLastName: ['', Validators.required],
      recipientDni: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.currentUserId = this.sessionService.getCurrentUserId();
    
    if (!this.currentUserId) {
      this.error = 'Usuario no autenticado';
      return;
    }

    this.route.params.subscribe((params) => {
      this.currentTicketId = +params['id'];
      this.loadTicketDetails();
    });
  }

  loadTicketDetails(): void {
    this.ticket$ = this.route.paramMap.pipe(
      switchMap((params) => {
        const id = params.get('id');
        if (id) {
          this.currentTicketId = +id;
          this.isLoading = true;
          return this.ticketService.getTicketById(+id).pipe(
            tap(ticket => {
              this.ticketSubject.next(ticket);
              this.isLoading = false;
            }),
            catchError((err) => {
              this.error = (err.error as any)?.message || 'Error fetching ticket details.';
              this.ticketSubject.next(null);
              this.isLoading = false;
              return of(null);
            })
          );
        } else {
          this.error = 'Ticket ID not found in route.';
          this.ticketSubject.next(null);
          return of(null);
        }
      })
    );
  }

  canEditTicket(ticket: Ticket | null): boolean {
    if (!ticket || !ticket.status || !ticket.eventDate) return false;
    
    const isActiveEvent = new Date(ticket.eventDate) > new Date();
    const isStatusVendida = ticket.status.toUpperCase() === 'VENDIDA';

    return isStatusVendida && isActiveEvent;
  }

  canTransferTicket(ticket: Ticket | null): boolean {
    return this.canEditTicket(ticket);
  }

  openEditModal(ticket: Ticket): void {
    if (!this.canEditTicket(ticket)) {
      this.error = 'No se permite la modificación para esta entrada.';
      return;
    }
    this.editingTicketId = ticket.id;
    this.attendeeForm.patchValue({
      attendeeFirstName: ticket.attendeeFirstName,
      attendeeLastName: ticket.attendeeLastName,
      attendeeDni: ticket.attendeeDni,
    });
    this.isEditModalOpen = true;
    this.error = null;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.attendeeForm.reset();
    this.editingTicketId = null;
  }

  onSaveAttendeeDetails(): void {
    if (this.attendeeForm.invalid || !this.editingTicketId) {
      this.error = 'Por favor, complete todos los campos requeridos.';
      this.attendeeForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.error = null;

    const formValues = this.attendeeForm.value;
    const updateRequest: AttendeeUpdateRequest = {
      attendeeFirstName: formValues.attendeeFirstName,
      attendeeLastName: formValues.attendeeLastName,
      attendeeDni: formValues.attendeeDni,
    };

    this.ticketService.updateTicketAttendee(this.editingTicketId, updateRequest).pipe(
      tap(updatedTicket => {
        this.ticketSubject.next(updatedTicket);
        this.isLoading = false;
        this.closeEditModal();
      }),
      catchError(err => {
        this.error = (err.error as any)?.message || 'Error al actualizar los detalles del asistente.';
        this.isLoading = false;
        return of(null);
      })
    ).subscribe();
  }

  openTransferModal(): void {
    if (!this.canTransferTicket(this.ticketSubject.value) || !this.currentTicketId) {
      this.transferError = 'Esta entrada no se puede transferir en este momento.';
      return;
    }
    this.isTransferModalOpen = true;
    this.transferError = null;
    this.transferTicketForm.reset();
  }

  closeTransferModal(): void {
    this.isTransferModalOpen = false;
    this.transferTicketForm.reset();
    this.transferError = null;
  }

  onConfirmTransfer(): void {
    if (this.transferTicketForm.invalid || !this.currentTicketId || !this.currentUserId) {
      if (!this.currentUserId) {
        this.transferError = 'Error: No se pudo identificar al usuario actual para la transferencia (ID de usuario no disponible).';
      } else {
        this.transferError = 'Por favor complete todos los campos requeridos del destinatario.';
      }
      this.transferTicketForm.markAllAsTouched();
      return;
    }
    this.transferLoading = true;
    this.transferError = null;

    const searchData: TicketTransferBySearchRequest = this.transferTicketForm.value;

    this.ticketService.transferTicketBySearch(this.currentUserId, this.currentTicketId, searchData).pipe(
      tap(updatedTicket => {
        this.ticketSubject.next(updatedTicket);
        this.transferLoading = false;
        this.transferError = null;
        this.closeTransferModal();
        this.modalService.success('¡Entrada transferida con éxito! El nuevo dueño y asistente es el usuario encontrado.', 'Transferencia Exitosa');
        
        // Redirigir a la lista de tickets después de un breve delay para que el usuario vea el mensaje
        setTimeout(() => {
          this.router.navigate(['/tickets']);
        }, 2000);
      }),
      catchError(err => {
        this.transferError = (err.error as any)?.message || 'Error al transferir la entrada por búsqueda.';
        this.transferLoading = false;
        console.error('Transfer error:', err);
        this.modalService.error(this.transferError || 'Error al transferir la entrada por búsqueda.', 'Error de Transferencia');
        return of(null);
      })
    ).subscribe();
  }

  formatStatusName(status: string | undefined): string {
    return StatusFormatter.formatStatusName(status);
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

  // New methods for the improved UI
  formatDate(dateString: string | Date): string {
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

  isValidQrCode(qrCode: string): boolean {
    // Check if it's a valid data URL for an image
    return qrCode.startsWith('data:image/') && qrCode.includes('base64,') && qrCode.length > 50;
  }

  downloadTicket(ticket: Ticket): void {
    console.log('Downloading ticket:', ticket.id);
    
    if (!this.currentUserId) {
      alert('Error: Usuario no autenticado. Por favor inicia sesión nuevamente.');
      return;
    }
    
    const downloadUrl = `${environment.apiUrl}/tickets/${ticket.id}/download-pdf`;
    
    // Get auth token from authService
    const token = this.authService.getToken();
    const headers: any = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Create a link element and trigger download
    this.http.get(downloadUrl, { 
      responseType: 'blob',
      observe: 'response',
      headers: headers
    }).pipe(
      catchError(error => {
        console.error('Error downloading ticket:', error);
        if (error.status === 401) {
          alert('Error de autenticación. Por favor inicia sesión nuevamente.');
        } else {
          alert('Error al descargar la entrada. Por favor intenta nuevamente.');
        }
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

  goToEvent(eventId: number): void {
    if (!eventId) {
      alert('Error: No se pudo encontrar la información del evento.');
      return;
    }
    this.router.navigate(['/events', eventId]);
  }
} 