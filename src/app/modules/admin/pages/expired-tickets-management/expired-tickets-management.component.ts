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
        <h1>Gestión de Tickets Vencidos</h1>
        <p class="subtitle">Administra y procesa tickets de eventos pasados</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <p>Cargando información de tickets vencidos...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !loading" class="error-message">
        <h3><i class="bi bi-exclamation-triangle me-2"></i>Error al cargar datos</h3>
        <p>{{ error }}</p>
        <button class="retry-btn" (click)="loadData()">
          <i class="bi bi-arrow-clockwise me-2"></i>Reintentar
        </button>
      </div>

      <!-- Main Content -->
      <div *ngIf="!loading && !error">
                 <!-- Statistics Dashboard -->
         <div class="stats-dashboard">
           <div class="stat-card">
             <div class="stat-icon"><i class="bi bi-check-circle"></i></div>
             <div class="stat-content">
               <h3>{{ summary.VENDIDA || 0 }}</h3>
               <p>Tickets Vendidos</p>
             </div>
           </div>
           
           <div class="stat-card">
             <div class="stat-icon"><i class="bi bi-clock"></i></div>
             <div class="stat-content">
               <h3>{{ summary.VENCIDA || 0 }}</h3>
               <p>Tickets Vencidos</p>
             </div>
           </div>
           
           <div class="stat-card">
             <div class="stat-icon"><i class="bi bi-x-circle"></i></div>
             <div class="stat-content">
               <h3>{{ summary.CANCELADA || 0 }}</h3>
               <p>Tickets Cancelados</p>
             </div>
           </div>
           
           <div class="stat-card">
             <div class="stat-icon"><i class="bi bi-file-text"></i></div>
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
            <span *ngIf="!loadingPreview"><i class="bi bi-eye me-2"></i>Vista Previa</span>
            <span *ngIf="loadingPreview"><i class="bi bi-hourglass-split me-2"></i>Cargando...</span>
          </button>
          
          <button 
            class="btn btn-danger"
            (click)="onProcessButtonClick()"
            [disabled]="!previewData.length || processing">
            <span *ngIf="!processing"><i class="bi bi-exclamation-triangle me-2"></i>Procesar Tickets Vencidos</span>
            <span *ngIf="processing"><i class="bi bi-hourglass-split me-2"></i>Procesando...</span>
          </button>
          

        </div>

        <!-- No Tickets Message -->
        <div *ngIf="previewData.length === 0 && !loadingPreview && !loading && !error" class="no-tickets-message">
          <div class="no-tickets-content">
            <div class="no-tickets-icon"><i class="bi bi-emoji-smile"></i></div>
            <h3>¡No hay tickets vencidos para procesar!</h3>
            <p>Todos los tickets están en estado correcto o no hay eventos pasados con tickets vendidos.</p>
            <div class="no-tickets-actions">
              <button class="btn btn-secondary" (click)="loadPreview()">
                <i class="bi bi-arrow-clockwise me-2"></i>Verificar nuevamente
              </button>
            </div>
          </div>
        </div>

                 <!-- Preview Section -->
         <div *ngIf="previewData.length > 0" class="preview-section">
           <h2><i class="bi bi-clipboard me-2"></i>Vista Previa de Tickets a Procesar</h2>
           <div class="preview-grid">
             <div *ngFor="let preview of previewData" class="preview-card">
               <div class="preview-header">
                 <h3>{{ preview.eventName }}</h3>
                 <span class="event-date">{{ formatEventDate(preview.eventDate) }}</span>
               </div>
               
               <div class="preview-content">
                 <div class="preview-item">
                   <span class="label"><i class="bi bi-person me-1"></i> Usuario:</span>
                   <span class="value">{{ preview.userName }}</span>
                 </div>
                 
                 <div class="preview-item">
                   <span class="label"><i class="bi bi-envelope me-1"></i> Email:</span>
                   <span class="value">{{ preview.userEmail }}</span>
                 </div>
                 
                 <div class="preview-item">
                   <span class="label"><i class="bi bi-ticket-perforated me-1"></i> Sección:</span>
                   <span class="value">{{ preview.sectionName }}</span>
                 </div>
                 
                 <div class="preview-item">
                   <span class="label"><i class="bi bi-currency-dollar me-1"></i> Precio:</span>
                   <span class="value highlight">{{ formatPrice(preview.price) }}</span>
                 </div>
                 
                 <div class="preview-item">
                   <span class="label"><i class="bi bi-calendar me-1"></i> Compra:</span>
                   <span class="value">{{ formatDate(preview.purchaseDate) }}</span>
                 </div>
                 
                 <div class="preview-item">
                   <span class="label"><i class="bi bi-tag me-1"></i> Estado:</span>
                   <span class="value status-{{ preview.status.toLowerCase() }}">{{ preview.status }}</span>
                 </div>
               </div>
             </div>
           </div>
         </div>

        <!-- Success Message -->
        <div *ngIf="successMessage" class="success-message">
          <h3><i class="bi bi-check-circle me-2"></i>Procesamiento Exitoso</h3>
          <p>{{ successMessage }}</p>
          <button class="btn btn-secondary" (click)="resetView()">
            <i class="bi bi-arrow-clockwise me-2"></i>Actualizar Vista
          </button>
        </div>


      </div>

              <!-- Confirmation Modal -->
        <div *ngIf="showConfirmModal" 
             (click)="showConfirmModal = false" 
             style="position: fixed !important; 
                    top: 0 !important; 
                    left: 0 !important; 
                    width: 100vw !important; 
                    height: 100vh !important; 
                    background: rgba(26, 26, 26, 0.9) !important; 
                    z-index: 999999 !important; 
                    display: flex !important; 
                    justify-content: center !important; 
                    align-items: center !important;">
         <div (click)="$event.stopPropagation()" 
              style="position: fixed !important;
                     top: 50% !important;
                     left: 50% !important;
                     transform: translate(-50%, -50%) !important;
                     background: #2D2D2D !important; 
                     color: white !important; 
                     z-index: 9999999 !important; 
                     width: 500px !important;
                     max-width: 90vw !important;
                     border-radius: 12px !important;
                     box-shadow: 0 20px 40px rgba(0,0,0,0.8) !important;
                     border: 2px solid #22C55E !important;">
                     <div style="background: #1A1A1A !important; 
                        color: white !important; 
                        padding: 20px 24px !important; 
                        border-bottom: 1px solid #22C55E !important;
                        display: flex !important;
                        justify-content: space-between !important;
                        align-items: center !important;
                        border-radius: 12px 12px 0 0 !important;">
             <h3 style="color: #22C55E !important; margin: 0 !important; font-size: 20px !important; font-weight: 600 !important;"><i class="bi bi-exclamation-triangle me-2"></i>Confirmar Procesamiento</h3>
             <button (click)="showConfirmModal = false" 
                     style="background: none !important; 
                            border: none !important; 
                            font-size: 28px !important; 
                            color: #888 !important; 
                            cursor: pointer !important;
                            padding: 0 !important;
                            width: 32px !important;
                            height: 32px !important;
                            transition: color 0.2s !important;"
                     onmouseover="this.style.color='#22C55E'"
                     onmouseout="this.style.color='#888'">×</button>
           </div>
          
                                           <div style="background: #2D2D2D !important; 
                         color: white !important; 
                         padding: 24px !important;
                         line-height: 1.6 !important;">
              <p style="color: white !important; margin-bottom: 18px !important; font-size: 16px !important;"><strong>¿Estás seguro de que deseas procesar todos los tickets vencidos?</strong></p>
              <p style="color: #ccc !important; margin-bottom: 12px !important; font-size: 14px !important;">Esta acción:</p>
               <ul style="color: #e5e5e5 !important; margin-left: 20px !important; font-size: 14px !important;">
                <li style="margin-bottom: 8px !important;">Cambiará el estado de <span style="color: #22C55E !important; font-weight: 600 !important;">{{ previewData.length }} tickets</span> de VENDIDA a VENCIDA</li>
                <li style="margin-bottom: 8px !important;">Procesará tickets de múltiples eventos</li>
                <li style="margin-bottom: 8px !important;">Procesará un monto total de <span style="color: #22C55E !important; font-weight: 600 !important;">{{ formatPrice(getTotalTicketPrice()) }}</span></li>
                <li style="margin-bottom: 8px !important; color: #ff6b6b !important;"><strong>⚠️ No se puede deshacer</strong></li>
             </ul>
           </div>
          
                     <div style="background: #1A1A1A !important; 
                        padding: 20px 24px !important; 
                        border-top: 1px solid #22C55E !important;
                        display: flex !important;
                        justify-content: flex-end !important;
                        gap: 12px !important;
                        border-radius: 0 0 12px 12px !important;">
             <button (click)="showConfirmModal = false" 
                     style="background: #444 !important; 
                            color: white !important;
                            border: 1px solid #666 !important;
                            padding: 12px 20px !important;
                            border-radius: 6px !important;
                            cursor: pointer !important;
                            font-size: 14px !important;
                            font-weight: 500 !important;
                            transition: all 0.2s !important;"
                     onmouseover="this.style.background='#555'; this.style.borderColor='#777'"
                     onmouseout="this.style.background='#444'; this.style.borderColor='#666'">
               ❌ Cancelar
             </button>
             <button (click)="processExpiredTickets()" 
                     style="background: #22C55E !important; 
                            color: white !important;
                            border: 1px solid #22C55E !important;
                            padding: 12px 20px !important;
                            border-radius: 6px !important;
                            cursor: pointer !important;
                            font-size: 14px !important;
                            font-weight: 600 !important;
                            transition: all 0.2s !important;"
                     onmouseover="this.style.background='#1ea54a'; this.style.borderColor='#1ea54a'"
                     onmouseout="this.style.background='#22C55E'; this.style.borderColor='#22C55E'">
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

    .no-tickets-message {
      margin: 40px 0;
      display: flex;
      justify-content: center;
    }

    .no-tickets-content {
      background: #2D2D2D;
      border-radius: 16px;
      padding: 40px 30px;
      text-align: center;
      border: 2px solid #22C55E;
      max-width: 500px;
      width: 100%;
      box-shadow: 0 8px 25px rgba(34, 197, 94, 0.1);
    }

    .no-tickets-icon {
      font-size: 4rem;
      margin-bottom: 20px;
      animation: bounce 2s infinite;
    }

    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-10px);
      }
      60% {
        transform: translateY(-5px);
      }
    }

    .no-tickets-content h3 {
      color: #22C55E;
      margin-bottom: 15px;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .no-tickets-content p {
      color: #9CA3AF;
      margin-bottom: 25px;
      line-height: 1.6;
      font-size: 1rem;
    }

    .no-tickets-actions {
      display: flex;
      justify-content: center;
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
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999 !important;
      backdrop-filter: blur(2px);
    }

    .modal {
      background: #2D2D2D;
      border-radius: 12px;
      max-width: 500px;
      width: 90%;
      border: 1px solid #374151;
      position: relative;
      z-index: 10000 !important;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.7);
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
      console.log('Current user:', user);
      
      if (!user) {
        this.error = 'Debes iniciar sesión para acceder a esta funcionalidad';
        return;
      }
      
      console.log('User role:', user.role?.name);
      
      if (user.role.name !== 'ADMIN') {
        this.error = 'No tienes permisos para acceder a esta funcionalidad. Solo administradores pueden gestionar tickets vencidos.';
        return;
      }
      
      console.log('User is admin, loading data...');
      this.loadData();
    });
  }

  loadData(): void {
    console.log('Loading data...');
    this.loading = true;
    this.error = '';
    
    this.ticketAdminService.getExpiredTicketsSummary().subscribe({
      next: (summary: ExpiredTicketsSummary) => {
        console.log('Summary loaded:', summary);
        this.summary = summary;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading expired ticket stats:', error);
        this.error = 'Error al cargar las estadísticas de tickets vencidos: ' + (error.message || error);
        this.loading = false;
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
        console.log('Preview data loaded:', preview);
      },
      error: (error: any) => {
        this.error = 'Error al cargar la vista previa de tickets vencidos';
        this.loadingPreview = false;
        console.error('Error loading expired ticket preview:', error);
      }
    });
  }

  onProcessButtonClick(): void {
    console.log('Process button clicked');
    console.log('Preview data length:', this.previewData.length);
    console.log('Processing state:', this.processing);
    
    if (this.previewData.length === 0) {
      this.error = 'Primero debes cargar la vista previa de tickets para procesar';
      return;
    }
    
    this.showConfirmModal = true;
    console.log('Modal should be shown:', this.showConfirmModal);
  }

  testModal(): void {
    console.log('Test modal clicked');
    this.showConfirmModal = true;
    console.log('Modal state:', this.showConfirmModal);
  }

  processExpiredTickets(): void {
    console.log('Starting to process expired tickets');
    this.processing = true;
    this.showConfirmModal = false;
    this.error = '';
    
    this.ticketAdminService.markTicketsAsExpired().subscribe({
      next: (result: MarkExpiredResult) => {
        console.log('Processing result:', result);
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
        console.error('Error processing expired tickets:', error);
        this.error = 'Error al procesar los tickets vencidos: ' + (error.message || error);
        this.processing = false;
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
    return this.previewData.reduce((total, preview) => total + preview.price, 0);
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