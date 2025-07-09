import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventCalendarService, CalendarEvent } from '../../../../services/event-calendar.service';
import { AuthService } from '../../../../core/services/auth.service';

interface CalendarDay {
  date: Date;
  dateString: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

@Component({
  selector: 'app-event-calendar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="calendar-container">
      <div class="header">
        <h1>Calendario de Eventos</h1>
        <p class="subtitle">Explora eventos próximos en vista mensual</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <p>Cargando calendario...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="error-message">
        <h3>❌ Error</h3>
        <p>{{ error }}</p>
        <button (click)="loadEvents()" class="retry-btn">Reintentar</button>
      </div>

      <!-- Calendar Controls -->
      <div *ngIf="!loading && !error" class="calendar-controls">
        <div class="month-navigation">
          <button (click)="previousMonth()" class="nav-btn">
            ← Anterior
          </button>
          <h2 class="current-month">{{ getCurrentMonthYear() }}</h2>
          <button (click)="nextMonth()" class="nav-btn">
            Siguiente →
          </button>
        </div>
        
        <button (click)="goToToday()" class="today-btn">
          Hoy
        </button>
      </div>

      <!-- Calendar Grid -->
      <div *ngIf="!loading && !error" class="calendar-grid">
        <!-- Day Headers -->
        <div class="day-header" *ngFor="let dayName of dayNames">
          {{ dayName }}
        </div>

        <!-- Calendar Days -->
        <div 
          *ngFor="let day of calendarDays" 
          class="calendar-day"
          [class.other-month]="!day.isCurrentMonth"
          [class.today]="day.isToday"
          [class.has-events]="day.events.length > 0"
          (click)="onDayClick(day)">
          
          <div class="day-number">{{ day.day }}</div>
          
          <div class="events-preview" *ngIf="day.events.length > 0">
            <a 
              *ngFor="let event of day.events.slice(0, 2)" 
              [routerLink]="['/events', event.id]"
              class="event-preview"
              (click)="$event.stopPropagation()">
              {{ event.name }}
            </a>
            <div *ngIf="day.events.length > 2" class="more-events">
              +{{ day.events.length - 2 }} más
            </div>
          </div>
        </div>
      </div>

      <!-- Event Details Modal -->
      <div *ngIf="showEventDetails" class="modal-overlay" (click)="closeEventDetails()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Eventos del {{ selectedDate }}</h3>
            <button (click)="closeEventDetails()" class="close-btn">×</button>
          </div>
          <div class="modal-body">
            <div *ngFor="let event of selectedEvents" class="event-detail">
              <div class="event-info">
                <h4>{{ event.name }}</h4>
                <p class="event-description">{{ event.description }}</p>
                <div class="event-meta">
                  <span class="event-time">🕐 {{ formatEventTime(event.startDateTime) }}</span>
                                      <span class="event-venue">📍 {{ event.venue.name }}</span>
                    <span class="event-artist">🎤 {{ event.mainArtist.name }}</span>
                  <span class="event-price">💰 {{ formatPrice(event.ticketPrice) }}</span>
                </div>
              </div>
              <div class="event-actions">
                <a [routerLink]="['/events', event.id]" class="btn btn-primary">
                  Ver Detalles
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .calendar-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #1A1A1A;
      min-height: 100vh;
      color: white;
    }

    .header {
      text-align: center;
      margin-bottom: 30px;
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
      padding: 40px;
    }

    .spinner {
      border: 4px solid #2D2D2D;
      border-top: 4px solid #22C55E;
      border-radius: 50%;
      width: 40px;
      height: 40px;
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
      color: white;
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

    .calendar-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      background: #2D2D2D;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      border: 1px solid #374151;
    }

    .month-navigation {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .nav-btn {
      background: #22C55E;
      color: #1A1A1A;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .nav-btn:hover {
      background: #16A34A;
      transform: translateY(-2px);
    }

    .current-month {
      color: white;
      margin: 0;
      font-size: 1.5rem;
      min-width: 200px;
      text-align: center;
      font-weight: bold;
    }

    .today-btn {
      background: transparent;
      color: #22C55E;
      border: 2px solid #22C55E;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .today-btn:hover {
      background: #22C55E;
      color: #1A1A1A;
      transform: translateY(-2px);
    }

    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1px;
      background: #374151;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }

    .day-header {
      background: #22C55E;
      color: #1A1A1A;
      padding: 15px;
      text-align: center;
      font-weight: bold;
      font-size: 0.9rem;
    }

    .calendar-day {
      background: #2D2D2D;
      min-height: 120px;
      padding: 10px;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
    }

    .calendar-day:hover {
      background: #374151;
      transform: scale(1.02);
    }

    .calendar-day.other-month {
      background: #1F2937;
      color: #6B7280;
    }

    .calendar-day.today {
      background: rgba(34, 197, 94, 0.1);
      border: 2px solid #22C55E;
      box-shadow: inset 0 0 0 1px #22C55E;
    }

    .calendar-day.has-events {
      background: rgba(34, 197, 94, 0.05);
      border-left: 4px solid #22C55E;
    }

    .day-number {
      font-weight: bold;
      font-size: 1.1rem;
      margin-bottom: 5px;
      color: white;
    }

    .calendar-day.other-month .day-number {
      color: #6B7280;
    }

    .calendar-day.today .day-number {
      color: #22C55E;
    }

    .events-preview {
      font-size: 0.8rem;
    }

    .event-preview {
      background: #22C55E;
      color: #1A1A1A;
      padding: 2px 6px;
      border-radius: 3px;
      margin-bottom: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-decoration: none;
      display: block;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .event-preview:hover {
      background: #16A34A;
      transform: scale(1.05);
    }

    .more-events {
      color: #9CA3AF;
      font-style: italic;
      font-size: 0.7rem;
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
      border-radius: 10px;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
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
      color: #22C55E;
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
      transition: color 0.3s ease;
    }

    .close-btn:hover {
      color: #EF4444;
    }

    .modal-body {
      padding: 20px;
    }

    .event-detail {
      border: 1px solid #374151;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      background: #374151;
    }

    .event-info h4 {
      color: white;
      margin: 0 0 10px 0;
      font-weight: bold;
    }

    .event-description {
      color: #D1D5DB;
      margin: 0 0 10px 0;
      line-height: 1.4;
    }

    .event-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      font-size: 0.9rem;
    }

    .event-meta span {
      color: #9CA3AF;
    }

    .btn {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 5px;
      text-decoration: none;
      font-weight: 600;
      text-align: center;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
    }

    .btn-primary {
      background: #22C55E;
      color: #1A1A1A;
    }

    .btn-primary:hover {
      background: #16A34A;
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(34, 197, 94, 0.4);
    }

    @media (max-width: 768px) {
      .calendar-controls {
        flex-direction: column;
        gap: 15px;
      }
      
      .month-navigation {
        flex-direction: column;
        gap: 10px;
      }
      
      .calendar-grid {
        font-size: 0.8rem;
      }
      
      .calendar-day {
        min-height: 80px;
        padding: 5px;
      }
      
      .event-detail {
        flex-direction: column;
        gap: 10px;
      }
      
      .event-meta {
        flex-direction: column;
        gap: 5px;
      }
    }
  `]
})
export class EventCalendarComponent implements OnInit {
  currentDate = new Date();
  calendarDays: CalendarDay[] = [];
  events: CalendarEvent[] = [];
  loading = false;
  error = '';

  // User roles
  isAdmin = false;
  isModerador = false;
  isEventRegistrar = false;
  isComprador = false;
  currentUser: any = null;

  monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Modal states
  selectedEvents: CalendarEvent[] = [];
  showEventDetails = false;
  selectedDate = '';

  constructor(
    private eventCalendarService: EventCalendarService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeUserRole();
    this.generateCalendar();
    this.loadEvents();
  }

  private initializeUserRole(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser && this.currentUser.role) {
      const userRole = this.currentUser.role.name;
      this.isAdmin = userRole === 'ADMIN';
      this.isModerador = userRole === 'MODERADOR';
      this.isEventRegistrar = userRole === 'REGISTRADOR_EVENTO';
      this.isComprador = userRole === 'COMPRADOR';
    }
  }

  generateCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    // Primer día del mes
    const firstDay = new Date(year, month, 1);
    // Último día del mes
    const lastDay = new Date(year, month + 1, 0);
    
    // Primer día de la semana a mostrar (puede ser del mes anterior)
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // Último día de la semana a mostrar (puede ser del mes siguiente)
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    this.calendarDays = [];
    const currentCalendarDate = new Date(startDate);

    while (currentCalendarDate <= endDate) {
      const dateString = this.formatDateString(currentCalendarDate);
      
      this.calendarDays.push({
        date: new Date(currentCalendarDate),
        dateString: dateString,
        day: currentCalendarDate.getDate(),
        isCurrentMonth: currentCalendarDate.getMonth() === month,
        isToday: this.isToday(currentCalendarDate),
        events: []
      });
      
      currentCalendarDate.setDate(currentCalendarDate.getDate() + 1);
    }
  }

  loadEvents(): void {
    this.loading = true;
    this.error = '';

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth() + 1; // API expects 1-based month

    this.eventCalendarService.getMonthlyEvents(year, month).subscribe({
      next: (eventsByDay) => {
        // Convertir el objeto de eventos por día a un array plano
        const allEvents: CalendarEvent[] = [];
        Object.values(eventsByDay).forEach(dayEvents => {
          allEvents.push(...dayEvents);
        });
        this.assignEventsToCalendarDays(allEvents);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading calendar events:', err);
        this.error = 'Error al cargar eventos del calendario';
        this.loading = false;
      }
    });
  }

  assignEventsToCalendarDays(events: CalendarEvent[]): void {
    // Reset events
    this.calendarDays.forEach(day => day.events = []);
    
    // Filter events based on user role - COMPRADOR can only see verified events
    let filteredEvents = events;
    if (this.isComprador) {
      filteredEvents = events.filter(event => event.verified === true);
    }
    
    // Assign filtered events to days
    filteredEvents.forEach(event => {
      const eventDate = new Date(event.startDateTime);
      const dateString = this.formatDateString(eventDate);
      
      const day = this.calendarDays.find(d => d.dateString === dateString);
      if (day) {
        day.events.push(event);
      }
    });
  }

  previousMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.generateCalendar();
    this.loadEvents();
  }

  nextMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.generateCalendar();
    this.loadEvents();
  }

  goToToday(): void {
    this.currentDate = new Date();
    this.generateCalendar();
    this.loadEvents();
  }

  onDayClick(day: CalendarDay): void {
    if (day.events.length > 0) {
      this.selectedEvents = day.events;
      this.selectedDate = this.formatDisplayDate(day.date);
      this.showEventDetails = true;
    }
  }

  closeEventDetails(): void {
    this.showEventDetails = false;
    this.selectedEvents = [];
    this.selectedDate = '';
  }

  formatDateString(date: Date): string {
    return date.getFullYear() + '-' + 
           String(date.getMonth() + 1).padStart(2, '0') + '-' + 
           String(date.getDate()).padStart(2, '0');
  }

  formatDisplayDate(date: Date): string {
    return date.toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatEventTime(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('es-AR', {
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

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  getCurrentMonthYear(): string {
    return `${this.monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
  }
} 