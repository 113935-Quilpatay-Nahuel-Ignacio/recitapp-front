import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketAdminService, ExpiredTicketsSummary, ExpiredTicketPreview, ExpiredTicketsStatistics, MarkExpiredResult } from '../../../../services/ticket-admin.service';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-expired-tickets-management',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="expired-tickets-container">
      <div class="header">
        <h1>🎫 Gestión de Tickets Vencidos</h1>
        <p class="subtitle">Administra y procesa tickets de eventos pasados</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <p>Cargando información de tickets vencidos...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !loading" class="error-message">
        <h3>❌ Error al cargar datos</h3>
        <p>{{ error }}</p>
        <button class="retry-btn" (click)="loadData()">
          🔄 Reintentar
        </button>
      </div>

      <!-- Main Content -->
      <div *ngIf="!loading && !error">
                 <!-- Statistics Dashboard -->
         <div class="stats-dashboard">
           <div class="stat-card">
             <div class="stat-icon">✅</div>
             <div class="stat-content">
               <h3>{{ summary.VENDIDA || 0 }}</h3>
               <p>Tickets Vendidos</p>
             </div>
           </div>
           
           <div class="stat-card">
             <div class="stat-icon">⏰</div>
             <div class="stat-content">
               <h3>{{ summary.VENCIDA || 0 }}</h3>
               <p>Tickets Vencidos</p>
             </div>
           </div>
           
           <div class="stat-card">
             <div class="stat-icon">❌</div>
             <div class="stat-content">
               <h3>{{ summary.CANCELADA || 0 }}</h3>
               <p>Tickets Cancelados</p>
             </div>
           </div>
           
           <div class="stat-card">
             <div class="stat-icon">📝</div>
             <div class="stat-content">
               <h3>{{ summary.RESERVADA || 0 }}</h3>
               <p>Tickets Reservados</p>
             </div>
           </div>
         </div>

        <!-- Action Buttons -->
        <div class="action-section">
          <button 
            class="btn btn-primary"
            (click)="loadPreview()"
            [disabled]="loadingPreview">
            <span *ngIf="!loadingPreview">👁️ Vista Previa</span>
            <span *ngIf="loadingPreview">⏳ Cargando...</span>
          </button>
          
          <button 
            class="btn btn-danger"
            (click)="showConfirmModal = true"
            [disabled]="!previewData.length || processing">
            <span *ngIf="!processing">⚠️ Procesar Tickets Vencidos</span>
            <span *ngIf="processing">⏳ Procesando...</span>
          </button>
        </div>

                 <!-- Preview Section -->
         <div *ngIf="previewData.length > 0" class="preview-section">
           <h2>📋 Vista Previa de Tickets a Procesar</h2>
           <div class="preview-grid">
             <div *ngFor="let preview of previewData" class="preview-card">
               <div class="preview-header">
                 <h3>{{ preview.eventName }}</h3>
                 <span class="event-date">{{ formatEventDate(preview.eventDate) }}</span>
               </div>
               
               <div class="preview-content">
                 <div class="preview-item">
                   <span class="label">👤 Usuario:</span>
                   <span class="value">{{ preview.userName }}</span>
                 </div>
                 
                 <div class="preview-item">
                   <span class="label">📧 Email:</span>
                   <span class="value">{{ preview.userEmail }}</span>
                 </div>
                 
                 <div class="preview-item">
                   <span class="label">🎫 Sección:</span>
                   <span class="value">{{ preview.sectionName }}</span>
                 </div>
                 
                 <div class="preview-item">
                   <span class="label">💰 Precio:</span>
                   <span class="value highlight">{{ formatPrice(preview.ticketPrice) }}</span>
                 </div>
                 
                 <div class="preview-item">
                   <span class="label">📅 Compra:</span>
                   <span class="value">{{ formatDate(preview.purchaseDate) }}</span>
                 </div>
                 
                 <div class="preview-item">
                   <span class="label">🏷️ Estado:</span>
                   <span class="value status-{{ preview.status.toLowerCase() }}">{{ preview.status }}</span>
                 </div>
               </div>
             </div>
           </div>
         </div>

        <!-- Success Message -->
        <div *ngIf="successMessage" class="success-message">
          <h3>✅ Procesamiento Exitoso</h3>
          <p>{{ successMessage }}</p>
          <button class="btn btn-secondary" (click)="resetView()">
            🔄 Actualizar Vista
          </button>
        </div>
      </div>

      <!-- Confirmation Modal -->
      <div *ngIf="showConfirmModal" class="modal-overlay" (click)="showConfirmModal = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>⚠️ Confirmar Procesamiento</h3>
            <button class="close-btn" (click)="showConfirmModal = false">×</button>
          </div>
          
          <div class="modal-body">
            <p><strong>¿Estás seguro de que deseas procesar todos los tickets vencidos?</strong></p>
                         <p>Esta acción:</p>
             <ul>
               <li>Cambiará el estado de {{ previewData.length }} tickets de VENDIDA a VENCIDA</li>
               <li>Procesará tickets de múltiples eventos</li>
               <li>Procesará un monto total de {{ formatPrice(getTotalTicketPrice()) }}</li>
               <li><strong>No se puede deshacer</strong></li>
             </ul>
          </div>
          
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="showConfirmModal = false">
              ❌ Cancelar
            </button>
            <button class="btn btn-danger" (click)="processExpiredTickets()">
              ✅ Confirmar Procesamiento
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .expired-tickets-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #1A1A1A;
      min-height: 100vh;
      color: white;
    }

    .header {
      text-align: center;
      margin-bottom: 40px;
    }

    .header h1 {
      color: #22C55E;
      margin-bottom: 10px;
      font-size: 2.5rem;
      font-weight: bold;
    }

    .subtitle {
      color: #9CA3AF;
      font-size: 1.1rem;
    }

    .loading {
      text-align: center;
      padding: 60px 20px;
    }

    .spinner {
      border: 4px solid #2D2D2D;
      border-top: 4px solid #22C55E;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-message {
      background: #2D2D2D;
      border-radius: 10px;
      padding: 20px;
      margin: 20px 0;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      text-align: center;
      border-left: 5px solid #EF4444;
    }

    .error-message h3 {
      color: #EF4444;
      margin-bottom: 10px;
    }

    .retry-btn {
      background: #22C55E;
      color: #1A1A1A;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      margin-top: 15px;
      font-weight: 600;
    }

    .retry-btn:hover {
      background: #16A34A;
    }

    .stats-dashboard {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .stat-card {
      background: #2D2D2D;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 15px;
      border: 1px solid #374151;
      transition: all 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(34, 197, 94, 0.1);
      border-color: #22C55E;
    }

    .stat-icon {
      font-size: 2.5rem;
      background: rgba(34, 197, 94, 0.1);
      padding: 15px;
      border-radius: 50%;
      min-width: 70px;
      text-align: center;
    }

    .stat-content h3 {
      color: #22C55E;
      margin: 0 0 5px 0;
      font-size: 1.8rem;
      font-weight: bold;
    }

    .stat-content p {
      color: #9CA3AF;
      margin: 0;
      font-size: 0.9rem;
    }

    .action-section {
      display: flex;
      gap: 20px;
      justify-content: center;
      margin-bottom: 40px;
      flex-wrap: wrap;
    }

    .btn {
      padding: 12px 24px;
      border-radius: 8px;
      border: none;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 1rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #22C55E;
      color: #1A1A1A;
    }

    .btn-primary:hover:not(:disabled) {
      background: #16A34A;
      transform: translateY(-2px);
    }

    .btn-secondary {
      background: transparent;
      color: #22C55E;
      border: 2px solid #22C55E;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #22C55E;
      color: #1A1A1A;
    }

    .btn-danger {
      background: #EF4444;
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
      background: #DC2626;
      transform: translateY(-2px);
    }

    .preview-section {
      margin-bottom: 40px;
    }

    .preview-section h2 {
      color: #22C55E;
      margin-bottom: 20px;
      font-size: 1.5rem;
      text-align: center;
    }

    .preview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 20px;
    }

    .preview-card {
      background: #2D2D2D;
      border-radius: 12px;
      padding: 20px;
      border: 1px solid #374151;
      transition: all 0.3s ease;
    }

    .preview-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(34, 197, 94, 0.1);
      border-color: #22C55E;
    }

    .preview-header {
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid #374151;
    }

    .preview-header h3 {
      color: white;
      margin: 0 0 5px 0;
      font-size: 1.2rem;
    }

    .event-date {
      color: #9CA3AF;
      font-size: 0.9rem;
    }

    .preview-content {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .preview-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .label {
      color: #9CA3AF;
      font-size: 0.9rem;
    }

    .value {
      color: white;
      font-weight: 600;
    }

    .value.highlight {
      color: #22C55E;
    }

    .status-vendida {
      color: #22C55E !important;
      font-weight: bold;
    }

    .status-vencida {
      color: #EF4444 !important;
      font-weight: bold;
    }

    .status-cancelada {
      color: #F59E0B !important;
      font-weight: bold;
    }

    .status-reservada {
      color: #3B82F6 !important;
      font-weight: bold;
    }

    .success-message {
      background: #2D2D2D;
      border-radius: 10px;
      padding: 20px;
      text-align: center;
      border-left: 5px solid #22C55E;
    }

    .success-message h3 {
      color: #22C55E;
      margin-bottom: 10px;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal {
      background: #2D2D2D;
      border-radius: 12px;
      max-width: 500px;
      width: 90%;
      border: 1px solid #374151;
    }

    .modal-header {
      padding: 20px;
      border-bottom: 1px solid #374151;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h3 {
      margin: 0;
      color: #EF4444;
      font-weight: bold;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #9CA3AF;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-btn:hover {
      color: #EF4444;
    }

    .modal-body {
      padding: 20px;
    }

    .modal-body p {
      color: #D1D5DB;
      margin-bottom: 15px;
    }

    .modal-body ul {
      color: #9CA3AF;
      margin-left: 20px;
    }

    .modal-body li {
      margin-bottom: 5px;
    }

    .modal-footer {
      padding: 20px;
      border-top: 1px solid #374151;
      display: flex;
      gap: 15px;
      justify-content: flex-end;
    }

    @media (max-width: 768px) {
      .stats-dashboard {
        grid-template-columns: 1fr;
      }
      
      .action-section {
        flex-direction: column;
        align-items: center;
      }
      
      .preview-grid {
        grid-template-columns: 1fr;
      }
      
      .modal {
        margin: 20px;
      }
      
      .modal-footer {
        flex-direction: column;
      }
    }
  `]
})
export class ExpiredTicketsManagementComponent implements OnInit {
  loading = false;
  loadingPreview = false;
  processing = false;
  error = '';
  successMessage = '';
  
  summary: ExpiredTicketsSummary = {
    VENDIDA: 0,
    VENCIDA: 0,
    CANCELADA: 0,
    RESERVADA: 0
  };
  
  previewData: ExpiredTicketPreview[] = [];
  showConfirmModal = false;

  constructor(
    private ticketAdminService: TicketAdminService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Verificar permisos de administrador
    this.authService.currentUser$.subscribe((user: User | null) => {
      if (!user) {
        this.error = 'Debes iniciar sesión para acceder a esta funcionalidad';
        return;
      }
      
      if (user.role.name !== 'ADMIN') {
        this.error = 'No tienes permisos para acceder a esta funcionalidad. Solo administradores pueden gestionar tickets vencidos.';
        return;
      }
      
      this.loadData();
    });
  }

  loadData(): void {
    this.loading = true;
    this.error = '';
    
    this.ticketAdminService.getExpiredTicketsSummary().subscribe({
      next: (summary: ExpiredTicketsSummary) => {
        this.summary = summary;
        this.loading = false;
      },
      error: (error: any) => {
        this.error = 'Error al cargar las estadísticas de tickets vencidos';
        this.loading = false;
        console.error('Error loading expired ticket stats:', error);
      }
    });
  }

  loadPreview(): void {
    this.loadingPreview = true;
    this.error = '';
    
    this.ticketAdminService.getExpiredTicketsPreview().subscribe({
      next: (preview: ExpiredTicketPreview[]) => {
        this.previewData = preview;
        this.loadingPreview = false;
      },
      error: (error: any) => {
        this.error = 'Error al cargar la vista previa de tickets vencidos';
        this.loadingPreview = false;
        console.error('Error loading expired ticket preview:', error);
      }
    });
  }

  processExpiredTickets(): void {
    this.processing = true;
    this.showConfirmModal = false;
    this.error = '';
    
    this.ticketAdminService.markTicketsAsExpired().subscribe({
      next: (result: MarkExpiredResult) => {
        if (result.success) {
          this.successMessage = result.message;
        } else {
          this.error = result.message;
          if (result.errorDetails && result.errorDetails.length > 0) {
            this.error += '\n\nDetalles:\n' + result.errorDetails.join('\n');
          }
        }
        this.processing = false;
        this.previewData = [];
        this.loadData(); // Refresh stats
      },
      error: (error: any) => {
        this.error = 'Error al procesar los tickets vencidos';
        this.processing = false;
        console.error('Error processing expired tickets:', error);
      }
    });
  }

  resetView(): void {
    this.successMessage = '';
    this.previewData = [];
    this.loadData();
  }

  getTotalTicketsToProcess(): number {
    return this.previewData.length;
  }

  getTotalTicketPrice(): number {
    return this.previewData.reduce((total, preview) => total + preview.ticketPrice, 0);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-AR');
  }

  formatEventDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
} 