import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EventSectionOffer } from '../models/event-section-offer.model';
import { environment } from '../../../../environments/environment';

// Interface for the raw SectionAvailabilityDTO from backend
interface SectionAvailabilityDTO {
  sectionId: number;
  sectionName: string;
  totalCapacity: number;
  availableTickets: number;
  soldTickets: number;
  basePrice: number; // This is the price
  availabilityPercentage: number;
}

@Injectable({
  providedIn: 'root',
})
export class EventSectionOfferService {
  // Endpoint from EventAvailabilityController
  private apiUrl = `${environment.apiUrl}/events`; 

  constructor(private http: HttpClient) {}

  getEventSectionOffers(eventId: number): Observable<EventSectionOffer[]> {
    return this.http
      .get<SectionAvailabilityDTO[]>(`${this.apiUrl}/${eventId}/sections/availability`)
      .pipe(
        map(backendOffers =>
          backendOffers.map(offer => {
            const eventSectionOffer: EventSectionOffer = {
              sectionId: offer.sectionId,
              sectionName: offer.sectionName,
              price: offer.basePrice,
              availableTickets: offer.availableTickets,
              totalCapacity: offer.totalCapacity,
              currency: 'ARS', // Placeholder: fetch or set appropriately
            };
            return eventSectionOffer;
          }),
        ),
      );
  }
} 