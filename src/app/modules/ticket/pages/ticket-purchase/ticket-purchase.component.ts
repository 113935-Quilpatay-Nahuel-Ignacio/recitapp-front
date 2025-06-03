import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable, EMPTY } from 'rxjs';
import { map as rxjsMap, tap, catchError, finalize } from 'rxjs/operators';
import { EventSectionOfferService } from '../../services/event-section-offer.service';
import { BookingService } from '../../services/booking.service';
import { EventService } from '../../../event/services/event.service';
import { EventSectionOffer } from '../../models/event-section-offer.model';
import { TicketPurchaseRequestDTO, TicketRequest, TicketPurchaseResponseDTO } from '../../models/booking.model';
import { EventDTO } from '../../../event/models/event';
import { Event } from '../../models/event';
import { ModalService } from '../../../../shared/services/modal.service';

// import { TicketTypeService } from '../../services/ticket-type.service'; // OLD
// import { TicketType } from '../../models/ticket-type.model'; // OLD
// import { BookingPayload, BookingDetailPayload } from '../../models/booking.model'; // OLD - BookingPayload is TicketPurchaseRequestDTO

@Component({
  selector: 'app-ticket-purchase',
  templateUrl: './ticket-purchase.component.html',
  styleUrls: ['./ticket-purchase.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class TicketPurchaseComponent implements OnInit {
  event$: Observable<Event | null> = EMPTY;
  sectionOffers: EventSectionOffer[] = []; // Renamed from ticketTypes
  purchaseForm: FormGroup; // This will be restructured
  isLoading = false;
  error: string | null = null;
  eventId!: number;

  // Temporary placeholder for paymentMethodId and userId - made public for template access
  MOCK_PAYMENT_METHOD_ID = 1; 
  MOCK_USER_ID = 4; // Changed to 4 as per request. Replace with actual logged-in user ID later.

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private eventSectionOfferService: EventSectionOfferService, // Injected new service
    private bookingService: BookingService,
    private eventService: EventService,
    private modalService: ModalService,
  ) {
    // Form structure needs a major rethink to match TicketPurchaseRequestDTO
    // For now, let's initialize it simply. We will build it dynamically.
    this.purchaseForm = this.fb.group({
      // Example: a control to select a section (will be more complex)
      // selectedSection: [null, Validators.required],
      // Example: a control for number of tickets for that section
      // quantity: [1, [Validators.required, Validators.min(1)]],
      // This FormArray will hold FormGroups for each individual ticket's attendee data
      attendeeTickets: this.fb.array([]) 
    });
  }

  ngOnInit(): void {
    const eventIdParam = this.route.snapshot.paramMap.get('id');
    if (!eventIdParam) {
      this.error = 'Event ID is missing from the route.';
      console.error(this.error);
      return;
    }
    this.eventId = +eventIdParam;
    this.loadEventDetails();
    this.loadSectionOffers(); // Renamed method
  }

  get attendeeTickets(): FormArray {
    return this.purchaseForm.get('attendeeTickets') as FormArray;
  }

  private loadEventDetails(): void {
    this.isLoading = true;
    this.event$ = this.eventService.getEventById(this.eventId).pipe(
      rxjsMap((dto: EventDTO): Event => {
        let isoStartDateTime: string | undefined = undefined;
        if (dto.startDateTime) {
          isoStartDateTime = typeof dto.startDateTime === 'string' ? 
            dto.startDateTime : dto.startDateTime.toISOString();
        }
        return {
          id: dto.id,
          name: dto.name,
          description: dto.description,
          startDateTime: isoStartDateTime,
          location: dto.venueName,
        };
      }),
      tap(() => this.isLoading = false),
      catchError(err => {
        console.error('Error loading event details:', err);
        this.error = 'Failed to load event details.';
        this.isLoading = false;
        return EMPTY;
      })
    );
  }

  // Renamed from loadTicketTypes to loadSectionOffers
  private loadSectionOffers(): void {
    this.isLoading = true;
    this.error = null; // Clear previous errors
    this.eventSectionOfferService
      .getEventSectionOffers(this.eventId)
      .pipe(
        finalize(() => (this.isLoading = false)),
        catchError(err => {
          console.error('Error loading section offers:', err);
          this.error = 'Failed to load section offers. Please ensure the event has sections and pricing defined.';
          this.sectionOffers = []; // Clear offers on error
          return EMPTY;
        }),
      )
      .subscribe(offers => {
        this.sectionOffers = offers;
        // The form initialization will need to change significantly.
        // For now, we are not pre-populating the form based on these offers in the same way.
        // The user will interact to add tickets for specific sections.
        this.attendeeTickets.clear(); // Clear any existing attendee ticket forms
      });
  }

  // THIS METHOD NEEDS COMPLETE REWORK - Placeholder logic
  // This method will be called when user adds a ticket for a specific section offer
  addTicketForSection(section: EventSectionOffer, quantity: number = 1): void {
    // This method is deprecated - use addTicketForSectionAndType instead
    if (!section.ticketPrices || section.ticketPrices.length === 0) {
      this.error = 'No hay precios definidos para esta sección';
      return;
    }
    
    // Use the first available ticket price as fallback
    const firstTicketPrice = section.ticketPrices[0];
    for (let i = 0; i < quantity; i++) {
      this.attendeeTickets.push(this.fb.group({
        sectionId: [section.sectionId, Validators.required],
        sectionName: [section.sectionName], // For display in form if needed
        ticketPriceId: [firstTicketPrice.ticketPriceId, Validators.required],
        ticketType: [firstTicketPrice.ticketType],
        price: [firstTicketPrice.price, Validators.required], // Price per ticket for this section
        attendeeFirstName: ['', Validators.required],
        attendeeLastName: ['', Validators.required],
        attendeeDni: ['', Validators.required],
        // promotionId: [null] // If promotions are handled
      }));
    }
    // Trigger form update for total calculation, etc.
    this.purchaseForm.updateValueAndValidity(); 
  }

  // New method to handle specific ticket type selection
  addTicketForSectionAndType(section: EventSectionOffer, ticketTypeSelect: HTMLSelectElement, quantity: number = 1): void {
    const selectedTicketPriceId = ticketTypeSelect.value;
    if (!selectedTicketPriceId) {
      this.error = 'Por favor seleccione un tipo de entrada';
      return;
    }

    const selectedTicketPrice = section.ticketPrices?.find(tp => tp.ticketPriceId.toString() === selectedTicketPriceId);
    if (!selectedTicketPrice) {
      this.error = 'Tipo de entrada no válido';
      return;
    }

    if (quantity > selectedTicketPrice.availableQuantity) {
      this.error = `Solo hay ${selectedTicketPrice.availableQuantity} entradas disponibles de tipo ${selectedTicketPrice.ticketType}`;
      return;
    }

    for (let i = 0; i < quantity; i++) {
      this.attendeeTickets.push(this.fb.group({
        sectionId: [section.sectionId, Validators.required],
        sectionName: [section.sectionName], // For display in form if needed
        ticketPriceId: [selectedTicketPrice.ticketPriceId, Validators.required],
        ticketType: [selectedTicketPrice.ticketType],
        price: [selectedTicketPrice.price, Validators.required], // Price per ticket for this section
        attendeeFirstName: ['', Validators.required],
        attendeeLastName: ['', Validators.required],
        attendeeDni: ['', Validators.required],
        // promotionId: [null] // If promotions are handled
      }));
    }
    
    // Clear the form after adding
    ticketTypeSelect.value = '';
    const quantityInput = document.getElementById(`quantity-${section.sectionId}`) as HTMLInputElement;
    if (quantityInput) {
      quantityInput.value = '1';
    }
    
    // Clear any previous errors
    this.error = null;
    
    // Trigger form update for total calculation, etc.
    this.purchaseForm.updateValueAndValidity(); 
  }

  // Get maximum quantity for selected ticket type
  getMaxQuantityForSelectedTicketType(section: EventSectionOffer, selectedTicketPriceId: string): number {
    if (!selectedTicketPriceId || !section.ticketPrices) {
      return 0;
    }
    
    const selectedTicketPrice = section.ticketPrices.find(tp => tp.ticketPriceId.toString() === selectedTicketPriceId);
    return selectedTicketPrice ? selectedTicketPrice.availableQuantity : 0;
  }

  removeTicket(index: number): void {
    this.attendeeTickets.removeAt(index);
    this.purchaseForm.updateValueAndValidity();
  }

  calculateTotal(): number {
    let total = 0;
    this.attendeeTickets.controls.forEach(control => {
      total += control.get('price')?.value || 0;
    });
    return total;
  }

  onSubmit(): void {
    if (this.purchaseForm.invalid) {
      this.error = 'Please fill in all required fields for each ticket.';
      this.purchaseForm.markAllAsTouched(); // Mark all fields as touched to show errors
      console.log('Form is invalid:', this.purchaseForm.value);
      console.log('Form errors:', this.purchaseForm.errors);
      this.attendeeTickets.controls.forEach((ctrl, i) => {
        console.log(`Ticket ${i} errors:`, ctrl.errors, ctrl.value);
      });
      return;
    }

    if (this.attendeeTickets.length === 0) {
      this.error = 'Please add at least one ticket to purchase.';
      return;
    }

    const ticketRequests: TicketRequest[] = this.attendeeTickets.value.map((ticketFormValue: any) => ({
      sectionId: ticketFormValue.sectionId,
      attendeeFirstName: ticketFormValue.attendeeFirstName,
      attendeeLastName: ticketFormValue.attendeeLastName,
      attendeeDni: ticketFormValue.attendeeDni,
      price: ticketFormValue.price, // Price for this specific ticket
      // promotionId: ticketFormValue.promotionId // If promotions are handled
    }));

    const payload: TicketPurchaseRequestDTO = {
      eventId: this.eventId,
      paymentMethodId: this.MOCK_PAYMENT_METHOD_ID, // Replace with actual payment method ID
      userId: this.MOCK_USER_ID, // Replace with actual user ID
      tickets: ticketRequests,
    };

    this.isLoading = true;
    this.error = null;
    this.bookingService
      .createBooking(payload) // Assuming createBooking can take this new payload structure
      .pipe(
        finalize(() => (this.isLoading = false)),
        catchError(err => {
          console.error('Error creating booking:', err);
          const backendError = err.error;
          if (backendError && backendError.message) {
            this.error = backendError.message; 
            if (backendError.details) {
                this.error += ` (${backendError.details})`;
            }
          } else {
            this.error = 'Failed to create booking. Please try again.';
          }
          return EMPTY;
        }),
      )
      // Use TicketPurchaseResponseDTO for the subscribed value
      .subscribe((bookingResponse: TicketPurchaseResponseDTO) => { 
        this.modalService.success(`¡Reserva exitosa! ID de transacción: ${bookingResponse.transactionId}`, 'Compra Exitosa').subscribe(() => {
          this.purchaseForm.reset();
          this.attendeeTickets.clear();
          this.loadSectionOffers(); // Refresh section offers (e.g., for availability)
          this.router.navigate(['/tickets']); // Navigate to tickets page or transaction history
        });
      });
  }
}
