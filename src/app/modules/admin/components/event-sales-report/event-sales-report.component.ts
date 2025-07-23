import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationAdminService, EventSalesReportDTO } from '../../services/reservation-admin.service';
import { EventService } from '../../../event/services/event.service';
import { EventDTO } from '../../../event/models/event';
import { ExportService } from '../../../../shared/services/export.service';
import { Observable, of, Subject } from 'rxjs';
import { catchError, switchMap, tap, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-event-sales-report',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe],
  templateUrl: './event-sales-report.component.html',
  styleUrls: ['./event-sales-report.component.scss']
})
export class EventSalesReportComponent implements OnInit {
  private reservationAdminService = inject(ReservationAdminService);
  private eventService = inject(EventService);
  private exportService = inject(ExportService);

  events$: Observable<EventDTO[]> = of([]);
  selectedEventId: number | null = null;
  
  private loadReportSubject = new Subject<number>();
  report$: Observable<EventSalesReportDTO | null> = of(null);
  
  isLoadingEvents = false;
  isLoadingReport = false;
  loadEventsError: string | null = null;
  loadReportError: string | null = null;
  currentReport: EventSalesReportDTO | null = null;

  constructor() {
    this.report$ = this.loadReportSubject.pipe(
      tap(() => {
        this.isLoadingReport = true;
        this.loadReportError = null;
      }),
      switchMap(eventId => {
        if (!eventId) return of(null);
        return this.reservationAdminService.getEventSalesReport(eventId).pipe(
          catchError(err => {
            console.error('Error fetching sales report:', err);
            this.loadReportError = err.error?.message || err.message || 'Error al cargar el reporte de ventas.';
            return of(null);
          })
        );
      }),
      tap((report) => {
        this.isLoadingReport = false;
        this.currentReport = report;
      })
    );
  }

  ngOnInit(): void {
    this.fetchEvents();
  }

  fetchEvents(): void {
    this.isLoadingEvents = true;
    this.loadEventsError = null;
    this.events$ = this.eventService.searchEvents({}).pipe( // Use searchEvents with empty filters
      tap(() => this.isLoadingEvents = false),
      catchError(err => {
        console.error('Error fetching events:', err);
        this.loadEventsError = err.error?.message || err.message || 'Error al cargar eventos.';
        this.isLoadingEvents = false;
        return of([]);
      })
    );
  }

  onEventSelected(): void {
    if (this.selectedEventId) {
      this.loadReportSubject.next(this.selectedEventId);
    } else {
      this.report$ = of(null); // Clear report if no event is selected
    }
  }

  async exportToPDF(): Promise<void> {
    if (!this.currentReport) {
      console.warn('No hay reporte disponible para exportar');
      return;
    }

    try {
      const exportData = {
        title: 'Reporte de Ventas por Evento',
        subtitle: `${this.currentReport.eventName} (ID: ${this.currentReport.eventId})`,
        metadata: {
          'Fecha de Generación': new Date(this.currentReport.generatedDate).toLocaleDateString('es-AR'),
          'Período': this.currentReport.periodStartDate && this.currentReport.periodEndDate 
            ? `${new Date(this.currentReport.periodStartDate).toLocaleDateString('es-AR')} - ${new Date(this.currentReport.periodEndDate).toLocaleDateString('es-AR')}`
            : 'No especificado'
        },
        columns: [
          { header: 'Sección', key: 'sectionName', width: 25 },
          { header: 'ID Sección', key: 'sectionId', width: 15, type: 'number' as const },
          { header: 'Tickets Vendidos', key: 'ticketsSold', width: 20, type: 'number' as const },
          { header: 'Ingresos', key: 'revenue', width: 20, type: 'currency' as const }
        ],
        data: this.currentReport.items,
        summary: {
          'Total Entradas Vendidas': this.currentReport.soldTickets,
          'Ingresos Totales': new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(this.currentReport.totalRevenue),
          'Entradas Promocionales': this.currentReport.promotionalTicketsCount || 'N/A',
          'Tasa de Ocupación': this.currentReport.occupancyRateOverall 
            ? new Intl.NumberFormat('es-AR', { style: 'percent', minimumFractionDigits: 2 }).format(this.currentReport.occupancyRateOverall)
            : 'N/A'
        }
      };

      await this.exportService.exportToPDF(exportData);
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      alert('Error al generar el archivo PDF. Por favor, inténtelo de nuevo.');
    }
  }

  async exportToExcel(): Promise<void> {
    if (!this.currentReport) {
      console.warn('No hay reporte disponible para exportar');
      return;
    }

    try {
      const exportData = {
        title: 'Reporte de Ventas por Evento',
        subtitle: `${this.currentReport.eventName} (ID: ${this.currentReport.eventId})`,
        metadata: {
          'Fecha de Generación': new Date(this.currentReport.generatedDate).toLocaleDateString('es-AR'),
          'Período': this.currentReport.periodStartDate && this.currentReport.periodEndDate 
            ? `${new Date(this.currentReport.periodStartDate).toLocaleDateString('es-AR')} - ${new Date(this.currentReport.periodEndDate).toLocaleDateString('es-AR')}`
            : 'No especificado',
          'Total Entradas Vendidas': this.currentReport.soldTickets,
          'Ingresos Totales': this.currentReport.totalRevenue,
          'Entradas Promocionales': this.currentReport.promotionalTicketsCount || 0,
          'Tasa de Ocupación': this.currentReport.occupancyRateOverall || 0
        },
        columns: [
          { header: 'Sección', key: 'sectionName', width: 25 },
          { header: 'ID Sección', key: 'sectionId', width: 15, type: 'number' as const },
          { header: 'Tickets Vendidos', key: 'ticketsSold', width: 20, type: 'number' as const },
          { header: 'Ingresos', key: 'revenue', width: 20, type: 'currency' as const }
        ],
        data: this.currentReport.items
      };

      await this.exportService.exportToExcel(exportData);
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      alert('Error al generar el archivo Excel. Por favor, inténtelo de nuevo.');
    }
  }
} 