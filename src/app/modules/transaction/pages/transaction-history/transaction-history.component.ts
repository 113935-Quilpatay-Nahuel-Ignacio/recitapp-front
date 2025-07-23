import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction';
import { SessionService } from '../../../../core/services/session.service';
import { TransactionReceiptDTO } from '../../models/dto/transaction-receipt.dto';
import { RefundRequestDTO } from '../../models/dto/refund-request.dto';
import { TransactionStatusUpdateDTO } from '../../models/dto/transaction-status-update.dto';
import { EnhancedRefundRequestDTO } from '../../models/dto/enhanced-refund-request.dto';
import { EnhancedRefundResponseDTO } from '../../models/dto/enhanced-refund-response.dto';
import { TransactionReceiptModalComponent } from '../../components/transaction-receipt-modal/transaction-receipt-modal.component';
import { ModalService } from '../../../../shared/services/modal.service';
import { ExportService } from '../../../../shared/services/export.service';
import { catchError, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [CommonModule, TransactionReceiptModalComponent],
  templateUrl: './transaction-history.component.html',
  styleUrl: './transaction-history.component.scss',
})
export class TransactionHistoryComponent implements OnInit {
  transactions: Transaction[] = [];
  loading = false;
  error = '';

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  userId: number | null = null;

  selectedReceipt: TransactionReceiptDTO | null = null;

  constructor(
    private transactionService: TransactionService,
    private sessionService: SessionService,
    private modalService: ModalService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    this.userId = this.sessionService.getCurrentUserId();
    
    if (!this.userId) {
      this.error = 'Usuario no autenticado';
      return;
    }
    
    this.loadTransactions();
  }

  loadTransactions(): void {
    if (!this.userId) {
      this.error = 'Usuario no autenticado';
      return;
    }

    this.loading = true;
    this.error = '';

    this.transactionService
      .getPaymentHistory(this.userId)
      .subscribe({
        next: (transactions: any) => {
          this.transactions = transactions;
          this.loading = false;
        },
        error: (err: any) => {
          this.error = err.error?.message || 'Error al cargar las transacciones';
          this.loading = false;
        },
      });
  }

  viewReceipt(transactionId: number): void {
    this.transactionService.getPaymentReceipt(transactionId).subscribe({
      next: (response: TransactionReceiptDTO) => {
        console.log('Receipt data:', response);
        this.selectedReceipt = response;
      },
      error: (err) => {
        console.error('Error fetching receipt:', err);
        this.modalService.error('Error al obtener el recibo de la transacción.', 'Error de Recibo');
        this.selectedReceipt = null; // Ensure modal doesn't show on error
      },
    });
  }

  closeReceiptModal(): void {
    this.selectedReceipt = null;
  }

  // Placeholder for RAPP113935-107: Modify transaction status
  // This would typically be an admin action or triggered by a payment gateway callback
  // For demonstration, let's add a mock way to change status to 'cancelled'
  cancelTransaction(transactionId: number): void {
    this.modalService.showConfirm({
      title: 'Cancelar Transacción',
      message: `¿Estás seguro de que deseas cancelar la transacción ${transactionId}?`,
      type: 'warning',
      confirmText: 'Sí, cancelar',
      cancelText: 'No cancelar',
      details: [
        'Esta acción marcará la transacción como fallida',
        'Se actualizará el historial de transacciones'
      ]
    }).subscribe(confirmed => {
      if (confirmed) {
        const statusUpdate: TransactionStatusUpdateDTO = { statusName: 'FALLIDA' };
        this.transactionService
          .updateTransactionStatus(transactionId, statusUpdate)
          .pipe(
            switchMap(() => {
              // Reload history to reflect the change
              return this.transactionService.getPaymentHistory(this.userId!);
            }),
            catchError((err) => {
              console.error('Error cancelling transaction or reloading history:', err);
              this.modalService.error('Error al cancelar la transacción.', 'Error de Cancelación');
              return of([]);
            })
          )
          .subscribe(updatedTransactions => {
            this.transactions = updatedTransactions;
            this.modalService.success(`Actualización de estado de transacción ${transactionId} iniciada.`);
          });
      }
    });
  }

  // Placeholder for RAPP113935-111: Register Refund
  // Simplificado: siempre agrega saldo a billetera virtual
  requestRefund(transactionId: number): void {
    const transaction = this.transactions.find(t => t.id === transactionId);
    if (!transaction) {
      this.modalService.error('Transacción no encontrada.', 'Error');
      return;
    }

    this.modalService.showConfirm({
      title: 'Confirmar Reembolso',
      message: '¿Está seguro de que desea procesar el reembolso? El monto será agregado a su billetera virtual.',
      type: 'info',
      confirmText: 'Sí, procesar reembolso',
      cancelText: 'Cancelar',
      details: [
        `Transacción: #${transactionId}`,
        `Monto: $${transaction.totalAmount}`,
        'El saldo se agregará a su billetera virtual inmediatamente'
      ]
    }).subscribe(confirmed => {
      if (confirmed) {
        // Filter out already refunded tickets
        const availableTickets = transaction.details?.filter(detail => !detail.isRefunded && detail.ticketStatus !== 'CANCELADA') || [];
        
        if (availableTickets.length === 0) {
          this.modalService.info('No hay tickets disponibles para reembolso en esta transacción. Todos los tickets ya han sido reembolsados.', 'Sin Tickets Disponibles');
          return;
        }

        if (availableTickets.length === 1) {
          // Only one ticket available, process full refund for this ticket
          this.modalService.showConfirm({
            title: 'Confirmar Reembolso',
            message: 'Solo queda un ticket disponible para reembolso. Se procesará como reembolso completo.',
            type: 'info',
            confirmText: 'Procesar Reembolso',
            cancelText: 'Cancelar',
            details: [
              `Ticket: ${availableTickets[0].eventName}`,
              `Monto: $${availableTickets[0].unitPrice}`,
              'El monto se agregará a su billetera virtual'
            ]
          }).subscribe(confirmedSingle => {
            if (confirmedSingle) {
              this.processSimplifiedRefund(transactionId, false, [availableTickets[0].ticketId]);
            }
          });
          return;
        }

        // Multiple tickets available, show selection
        this.modalService.showConfirm({
          title: 'Tipo de Reembolso',
          message: `Tickets disponibles para reembolso: ${availableTickets.length}. ¿Desea reembolsar todos los tickets?`,
          type: 'info',
          confirmText: 'Reembolsar Todos',
          cancelText: 'Seleccionar Tickets'
        }).subscribe(isFullRefund => {
          if (isFullRefund) {
            // Refund all available tickets
            const allAvailableIds = availableTickets.map(t => t.ticketId);
            this.processSimplifiedRefund(transactionId, false, allAvailableIds);
          } else {
            // Show ticket selection interface for partial refund
            this.showImprovedTicketSelectionModal(transaction, availableTickets);
          }
        });
      }
    });
  }

  private processSimplifiedRefund(transactionId: number, fullRefund: boolean, ticketIds?: number[]): void {
    const transaction = this.transactions.find(t => t.id === transactionId);
    if (!transaction) {
      this.modalService.error('Transacción no encontrada.', 'Error');
      return;
    }

    // Crear descripción automática
    const ticketCount = fullRefund ? 'todas las entradas' : `${ticketIds?.length || 0} entrada(s)`;
    
    // Extraer el nombre del evento de la descripción original
    let eventName = 'evento';
    if (transaction.description) {
      // Buscar patrón "para [nombre del evento]" en la descripción
      const match = transaction.description.match(/para (.+?)(?:\s-\s|$)/);
      if (match && match[1]) {
        eventName = match[1].trim();
      }
    }
    
    const paymentMethod = this.getPaymentMethodName(transaction.paymentMethodId?.toString() || 'UNKNOWN');
    
    const autoDescription = `Reembolso de ${ticketCount} para ${eventName} - Pago procesado con ${paymentMethod}`;

    const refundRequest: RefundRequestDTO = {
      transactionId,
      reason: autoDescription,
      fullRefund,
    };

    if (!fullRefund && ticketIds && ticketIds.length > 0) {
      refundRequest.ticketIds = ticketIds;
    }

    this.loading = true;
    this.transactionService.registerRefund(refundRequest).subscribe({
      next: (refundTransaction) => {
        this.loading = false;
        
        let message = `🎉 Reembolso procesado exitosamente\n`;
        message += `💰 Monto agregado a billetera virtual: $${refundTransaction.totalAmount}\n`;
        message += `📝 Descripción: ${autoDescription}\n`;
        message += `⏰ Procesado: ${new Date().toLocaleString()}`;
        
        this.modalService.success(message).subscribe(() => {
          this.loadTransactions();
        });
      },
      error: (err) => {
        this.loading = false;
        console.error('Error processing refund:', err);
        this.modalService.error('Error al procesar el reembolso.', 'Error de Reembolso');
      },
    });
  }

  private getPaymentMethodName(paymentMethod: string): string {
    const methodMap: { [key: string]: string } = {
      '1': 'MercadoPago',
      '2': 'Tarjeta de Crédito', 
      '3': 'Tarjeta de Débito',
      '4': 'Transferencia Bancaria',
      '5': 'Billetera Virtual',
      '6': 'Efectivo',
      'MERCADO_PAGO': 'MercadoPago',
      'MERCADOPAGO': 'MercadoPago',
      'CREDIT_CARD': 'Tarjeta de Crédito',
      'DEBIT_CARD': 'Tarjeta de Débito',
      'BANK_TRANSFER': 'Transferencia Bancaria',
      'WALLET': 'Billetera Virtual',
      'CASH': 'Efectivo'
    };
    
    return methodMap[paymentMethod] || 'Método de Pago';
  }

  private showImprovedTicketSelectionModal(transaction: Transaction, availableTickets: any[]): void {
    if (!availableTickets || availableTickets.length === 0) {
      this.modalService.error('No hay tickets disponibles para reembolso.', 'Error');
      return;
    }

    // Create a detailed list of available tickets for selection
    const ticketOptions = availableTickets.map(detail => ({
      ticketId: detail.ticketId,
      display: `Ticket #${detail.ticketId} - ${detail.eventName || 'Evento'} - $${detail.unitPrice} (${detail.ticketStatus || 'Estado desconocido'})`,
      price: detail.unitPrice,
      eventName: detail.eventName,
      ticketCode: detail.ticketCode,
      status: detail.ticketStatus
    }));

    // Show a custom modal with checkboxes (simplified version using confirm with details)
    const ticketList = ticketOptions.map((ticket, index) => `${index + 1}. ${ticket.display}`).join('\n');
    
    this.modalService.showPrompt({
      title: 'Seleccionar Tickets para Reembolso',
      message: `Seleccione los tickets a reembolsar escribiendo sus números separados por comas.\n\nTickets disponibles:\n${ticketList}`,
      placeholder: 'Ej: 1, 3, 5 (números de la lista)',
      confirmText: 'Procesar Reembolso Parcial',
      cancelText: 'Cancelar'
    }).subscribe(result => {
      if (result.confirmed && result.value) {
        const selectedIndices = result.value.split(',')
          .map(index => parseInt(index.trim(), 10) - 1) // Convert to 0-based index
          .filter(index => !isNaN(index) && index >= 0 && index < ticketOptions.length);

        if (selectedIndices.length === 0) {
          this.modalService.error('Números inválidos. Verifique los números ingresados.', 'Error de Validación');
          return;
        }

        // Get selected tickets
        const selectedTickets = selectedIndices.map(index => ticketOptions[index]);
        const selectedIds = selectedTickets.map(ticket => ticket.ticketId);

        // Calculate refund amount
        const refundAmount = selectedTickets.reduce((sum, ticket) => sum + ticket.price, 0);

        // Show confirmation with calculated amount and ticket details
        const ticketDetails = selectedTickets.map(t => `• ${t.eventName} - $${t.price}`).join('\n');
        
        this.modalService.showConfirm({
          title: 'Confirmar Reembolso Parcial',
          message: `¿Confirma el reembolso parcial de ${selectedTickets.length} entrada(s)?`,
          type: 'info',
          confirmText: 'Sí, procesar reembolso',
          cancelText: 'Cancelar',
          details: [
            `Tickets seleccionados:\n${ticketDetails}`,
            `Monto total a reembolsar: $${refundAmount}`,
            'El monto se agregará a su billetera virtual'
          ]
        }).subscribe(confirmed => {
          if (confirmed) {
            this.processSimplifiedRefund(transaction.id, false, selectedIds);
          }
        });
      }
    });
  }

  // Remover métodos de reembolso mejorado que ya no se usan
  private processRefund(transactionId: number, reason: string, fullRefund: boolean, ticketIds?: number[]): void {
    // Método obsoleto - usar processSimplifiedRefund en su lugar
    this.processSimplifiedRefund(transactionId, fullRefund, ticketIds);
  }

  private processBasicRefund(transactionId: number, reason: string, fullRefund: boolean, ticketIds?: number[]): void {
    // Método obsoleto - usar processSimplifiedRefund en su lugar
    this.processSimplifiedRefund(transactionId, fullRefund, ticketIds);
  }

  private processEnhancedRefund(transactionId: number, reason: string, fullRefund: boolean, ticketIds?: number[]): void {
    // Método obsoleto - usar processSimplifiedRefund en su lugar
    this.processSimplifiedRefund(transactionId, fullRefund, ticketIds);
  }

  async exportToPDF(): Promise<void> {
    if (!this.transactions || this.transactions.length === 0) {
      console.warn('No hay transacciones disponibles para exportar');
      return;
    }

    try {
      const exportData = {
        title: 'Historial de Transacciones',
        subtitle: `Usuario ID: ${this.userId} | Total: ${this.transactions.length} transacciones`,
        metadata: {
          'Fecha de Generación': new Date().toLocaleDateString('es-AR'),
          'Usuario ID': this.userId?.toString() || 'N/A',
          'Total de Transacciones': this.transactions.length
        },
        columns: [
          { header: 'ID', key: 'id', width: 10, type: 'number' as const },
          { header: 'Fecha', key: 'transactionDate', width: 20, type: 'date' as const },
          { header: 'Descripción', key: 'description', width: 35 },
          { header: 'Estado', key: 'status', width: 15 },
          { header: 'Monto', key: 'totalAmount', width: 15, type: 'currency' as const },
          { header: 'Método de Pago', key: 'paymentMethodName', width: 20 }
        ],
        data: this.transactions.map(transaction => ({
          ...transaction,
          paymentMethodName: this.getPaymentMethodName(transaction.paymentMethodId?.toString() || 'UNKNOWN')
        })),
        summary: {
          'Total de Transacciones': this.transactions.length,
          'Transacciones Completadas': this.transactions.filter(t => t.statusName === 'COMPLETADA').length,
          'Transacciones Pendientes': this.transactions.filter(t => t.statusName === 'PENDIENTE').length,
          'Transacciones Fallidas': this.transactions.filter(t => t.statusName === 'FALLIDA').length,
          'Monto Total': new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(
            this.transactions.filter(t => t.statusName === 'COMPLETADA').reduce((sum, t) => sum + t.totalAmount, 0)
          )
        }
      };

      await this.exportService.exportToPDF(exportData);
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      this.modalService.error('Error al generar el archivo PDF. Por favor, inténtelo de nuevo.', 'Error de Exportación');
    }
  }

  async exportToExcel(): Promise<void> {
    if (!this.transactions || this.transactions.length === 0) {
      console.warn('No hay transacciones disponibles para exportar');
      return;
    }

    try {
      // Preparar datos principales
      const mainData = this.transactions.map(transaction => ({
        id: transaction.id,
        fecha: transaction.transactionDate,
        descripcion: transaction.description,
        estado: transaction.statusName,
        monto: transaction.totalAmount,
        metodoPago: this.getPaymentMethodName(transaction.paymentMethodId?.toString() || 'UNKNOWN'),
        esReembolso: transaction.isRefund ? 'Sí' : 'No',
        referenciaExterna: transaction.externalReference || 'N/A'
      }));

      // Preparar datos de detalles si existen
      const detailsData: any[] = [];
      this.transactions.forEach(transaction => {
        if (transaction.details && transaction.details.length > 0) {
          transaction.details.forEach(detail => {
            detailsData.push({
              transactionId: transaction.id,
              ticketId: detail.ticketId,
              eventName: detail.eventName,
              ticketCode: detail.ticketCode,
              unitPrice: detail.unitPrice,
              ticketStatus: detail.ticketStatus,
              isRefunded: detail.isRefunded ? 'Sí' : 'No'
            });
          });
        }
      });

      const exportData = {
        title: 'Historial de Transacciones',
        subtitle: `Usuario ID: ${this.userId}`,
        metadata: {
          'Fecha de Generación': new Date().toLocaleDateString('es-AR'),
          'Usuario ID': this.userId?.toString() || 'N/A',
          'Total de Transacciones': this.transactions.length,
          'Completadas': this.transactions.filter(t => t.statusName === 'COMPLETADA').length,
          'Pendientes': this.transactions.filter(t => t.statusName === 'PENDIENTE').length,
          'Fallidas': this.transactions.filter(t => t.statusName === 'FALLIDA').length,
          'Monto Total Completado': this.transactions.filter(t => t.statusName === 'COMPLETADA').reduce((sum, t) => sum + t.totalAmount, 0)
        },
        columns: [
          { header: 'ID Transacción', key: 'id', width: 15, type: 'number' as const },
          { header: 'Fecha', key: 'fecha', width: 20, type: 'date' as const },
          { header: 'Descripción', key: 'descripcion', width: 40 },
          { header: 'Estado', key: 'estado', width: 15 },
          { header: 'Monto', key: 'monto', width: 15, type: 'currency' as const },
          { header: 'Método de Pago', key: 'metodoPago', width: 20 },
          { header: 'Es Reembolso', key: 'esReembolso', width: 15 },
          { header: 'Referencia Externa', key: 'referenciaExterna', width: 25 }
        ],
        data: mainData
      };

      await this.exportService.exportToExcel(exportData);
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      this.modalService.error('Error al generar el archivo Excel. Por favor, inténtelo de nuevo.', 'Error de Exportación');
    }
  }
}
