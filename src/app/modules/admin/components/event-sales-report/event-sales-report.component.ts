import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationAdminService, EventSalesReportDTO } from '../../services/reservation-admin.service';
import { EventService } from '../../../event/services/event.service';
import { EventDTO } from '../../../event/models/event';
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

  events$: Observable<EventDTO[]> = of([]);
  selectedEventId: number | null = null;
  
  private loadReportSubject = new Subject<number>();
  report$: Observable<EventSalesReportDTO | null> = of(null);
  
  isLoadingEvents = false;
  isLoadingReport = false;
  loadEventsError: string | null = null;
  loadReportError: string | null = null;

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
      tap(() => this.isLoadingReport = false)
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
} 