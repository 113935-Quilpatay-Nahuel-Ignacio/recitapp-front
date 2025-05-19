import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TicketService } from '../../services/ticket.service';
import { Ticket } from '../../models/ticket.model';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HttpClientModule, // Required for TicketService if not provided in root
    DatePipe,
    CurrencyPipe,
  ],
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.scss'],
})
export class TicketDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private ticketService = inject(TicketService);

  ticket$: Observable<Ticket | null> = of(null);
  error: string | null = null;

  ngOnInit(): void {
    this.ticket$ = this.route.paramMap.pipe(
      switchMap((params) => {
        const id = params.get('id');
        if (id) {
          return this.ticketService.getTicketById(+id).pipe(
            catchError((err) => {
              this.error = err.error?.message || 'Error fetching ticket details.';
              return of(null);
            })
          );
        } else {
          this.error = 'Ticket ID not found in route.';
          return of(null);
        }
      })
    );
  }
} 