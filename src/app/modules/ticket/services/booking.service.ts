import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TicketPurchaseRequestDTO, TicketPurchaseResponseDTO } from '../models/booking.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private purchaseEndpointUrl = `${environment.apiUrl}/tickets/purchase`;
  private bookingsEndpointUrl = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient) {}

  createBooking(payload: TicketPurchaseRequestDTO): Observable<TicketPurchaseResponseDTO> {
    return this.http.post<TicketPurchaseResponseDTO>(this.purchaseEndpointUrl, payload);
  }

  getBookingById(id: number): Observable<TicketPurchaseResponseDTO> {
    return this.http.get<TicketPurchaseResponseDTO>(`${this.bookingsEndpointUrl}/${id}`);
  }

  // Other booking-related methods can be added here:
  // e.g.: getBookingsByUserId(userId: number): Observable<Booking[]>{
  // return this.http.get<Booking[]>(`${this.endpointUrl}/user/${userId}`);
  // }
} 