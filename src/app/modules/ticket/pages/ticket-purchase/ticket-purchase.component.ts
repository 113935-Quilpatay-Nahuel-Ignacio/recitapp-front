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
import { PaymentService, PaymentRequest, TicketItem, PayerInfo, PaymentResponse } from '../../../payment/services/payment.service';
import { MercadoPagoBricksComponent, PaymentData } from '../../../payment/components/mercadopago-bricks/mercadopago-bricks.component';
import { SessionService } from '../../../../core/services/session.service';
import { TransactionService } from '../../../transaction/services/transaction.service';

// import { TicketTypeService } from '../../services/ticket-type.service'; // OLD
// import { TicketType } from '../../models/ticket-type.model'; // OLD
// import { BookingPayload, BookingDetailPayload } from '../../models/booking.model'; // OLD - BookingPayload is TicketPurchaseRequestDTO

@Component({
  selector: 'app-ticket-purchase',
  templateUrl: './ticket-purchase.component.html',
  styleUrls: ['./ticket-purchase.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MercadoPagoBricksComponent]
})
export class TicketPurchaseComponent implements OnInit {
  event$: Observable<Event | null> = EMPTY;
  sectionOffers: EventSectionOffer[] = []; // Renamed from ticketTypes
  purchaseForm: FormGroup; // This will be restructured
  payerForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  eventId!: number;
  showPayerForm = false;
  showPaymentForm = false;
  showWalletOption = false;
  paymentData: PaymentData | null = null;
  currentUserId: number | null = null;
  
  // Wallet properties
  userWalletBalance = 0;
  walletDiscountApplied = 0;
  amountAfterWallet = 0;
  useWalletPayment = false;
  isLoadingWallet = false;
  
  // Cached total to avoid multiple calculations
  totalAmount = 0;

  // Payment method ID - En producción esto vendría de la respuesta de MercadoPago
  MERCADOPAGO_PAYMENT_METHOD_ID = 5; // ID para "MERCADOPAGO" en la tabla payment_methods
  WALLET_PAYMENT_METHOD_ID = 4; // ID para "BILLETERA_VIRTUAL" en la tabla payment_methods

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private eventSectionOfferService: EventSectionOfferService, // Injected new service
    private bookingService: BookingService,
    private eventService: EventService,
    private modalService: ModalService,
    private paymentService: PaymentService,
    public sessionService: SessionService, // Hacer público para uso en template
    private transactionService: TransactionService,
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

    this.payerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: [''],
      documentType: ['DNI'],
      documentNumber: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Verificar que el usuario esté autenticado
    this.currentUserId = this.sessionService.getCurrentUserId();
    if (!this.currentUserId) {
      this.error = 'Debe iniciar sesión para comprar entradas.';
      this.router.navigate(['/auth/login'], { 
        queryParams: { returnUrl: this.router.url } 
      });
      return;
    }

    // Pre-llenar formulario del pagador con datos del usuario actual
    this.prefillPayerForm();

    const eventIdParam = this.route.snapshot.paramMap.get('id');
    if (!eventIdParam) {
      this.error = 'Event ID is missing from the route.';
      console.error(this.error);
      return;
    }
    this.eventId = +eventIdParam;
    this.loadEventDetails();
    this.loadSectionOffers(); // Renamed method
    this.loadUserWalletBalance(); // Load wallet balance
    this.calculateTotal(); // Initialize total calculation
  }

  private prefillPayerForm(): void {
    const currentUser = this.sessionService.getCurrentUser();
    if (currentUser) {
      this.payerForm.patchValue({
        email: currentUser.email || '',
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        phone: currentUser.phone || '',
        // documentType y documentNumber se mantienen vacíos para que el usuario los complete
      });
    }
  }

  get attendeeTickets(): FormArray {
    return this.purchaseForm.get('attendeeTickets') as FormArray;
  }

  private loadEventDetails(): void {
    this.isLoading = true;
    this.event$ = this.eventService.getEventById(this.eventId).pipe(
      rxjsMap((dto: EventDTO): Event => {
        // Verificar si el evento está disponible para compra
        if (dto.statusName !== 'EN_VENTA') {
          const statusMessage = this.getStatusMessage(dto.statusName);
          this.error = statusMessage;
          // Redirigir de vuelta al detalle del evento
          setTimeout(() => {
            this.router.navigate(['/events', this.eventId]);
          }, 3000);
        }

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
          statusName: dto.statusName
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
    this.calculateTotal();
    this.updateWalletCalculations();
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
    this.updateWalletCalculations(); // Update wallet calculations after adding tickets 
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
    this.updateWalletCalculations(); // Update wallet calculations after removing ticket
  }

  calculateTotal(): number {
    let total = 0;
    this.attendeeTickets.controls.forEach(control => {
      total += control.get('price')?.value || 0;
    });
    this.totalAmount = total;
    return total;
  }
  
  getTotal(): number {
    return this.totalAmount;
  }

  // Debug method to check form validity
  debugFormValidity(): void {
    console.log('=== FORM VALIDATION DEBUG ===');
    console.log('Purchase form valid:', this.purchaseForm.valid);
    console.log('Purchase form errors:', this.purchaseForm.errors);
    console.log('Attendee tickets count:', this.attendeeTickets.length);
    
    this.attendeeTickets.controls.forEach((control, index) => {
      const formGroup = control as FormGroup;
      console.log(`\nTicket ${index + 1}:`);
      console.log('  Valid:', formGroup.valid);
      console.log('  Values:', formGroup.value);
      console.log('  Errors:', formGroup.errors);
      
      Object.keys(formGroup.controls).forEach(key => {
        const fieldControl = formGroup.get(key);
        if (fieldControl?.invalid) {
          console.log(`  ${key} - Invalid:`, fieldControl.errors);
        }
      });
    });
  }

  private loadUserWalletBalance(): void {
    if (!this.currentUserId) {
      return;
    }
    
    this.isLoadingWallet = true;
    this.transactionService.getUserWalletBalance(this.currentUserId)
      .pipe(
        finalize(() => this.isLoadingWallet = false),
        catchError(err => {
          console.error('Error loading wallet balance:', err);
          this.userWalletBalance = 0;
          return EMPTY;
        })
      )
      .subscribe(balance => {
        this.userWalletBalance = balance;
        this.calculateTotal(); // Initialize total calculation
        this.updateWalletCalculations();
      });
  }

  private updateWalletCalculations(): void {
    const totalAmount = this.calculateTotal();
    
    if (this.userWalletBalance >= totalAmount && totalAmount > 0) {
      // Wallet can cover the entire purchase
      this.walletDiscountApplied = totalAmount;
      this.amountAfterWallet = 0;
      this.showWalletOption = true;
    } else if (this.userWalletBalance > 0 && totalAmount > 0) {
      // Wallet can cover part of the purchase
      this.walletDiscountApplied = this.userWalletBalance;
      this.amountAfterWallet = totalAmount - this.userWalletBalance;
      this.showWalletOption = true;
    } else {
      // No wallet balance available
      this.walletDiscountApplied = 0;
      this.amountAfterWallet = totalAmount;
      this.showWalletOption = false;
    }
  }

  onSubmit(): void {
    if (this.purchaseForm.invalid) {
      // Debug: Log specific validation errors
      console.log('Form is invalid. Checking specific errors...');
      this.attendeeTickets.controls.forEach((control, index) => {
        const formGroup = control as FormGroup;
        console.log(`Ticket ${index + 1} errors:`, formGroup.errors);
        Object.keys(formGroup.controls).forEach(key => {
          const fieldControl = formGroup.get(key);
          if (fieldControl?.invalid) {
            console.log(`  - ${key}: ${fieldControl.errors ? JSON.stringify(fieldControl.errors) : 'invalid'}`);
          }
        });
      });
      
      this.error = 'Por favor complete todos los campos requeridos para cada entrada.';
      this.purchaseForm.markAllAsTouched();
      return;
    }

    if (this.attendeeTickets.length === 0) {
      this.error = 'Por favor agregue al menos una entrada para comprar.';
      return;
    }

    // Mostrar formulario de datos del pagador
    this.showPayerForm = true;
    this.error = null;
  }

  proceedToPayment(): void {
    if (this.payerForm.invalid) {
      this.error = 'Por favor complete todos los datos del pagador.';
      this.payerForm.markAllAsTouched();
      return;
    }

    const tickets: TicketItem[] = this.attendeeTickets.value.map((ticketFormValue: any) => ({
      sectionId: ticketFormValue.sectionId,
      ticketPriceId: ticketFormValue.ticketPriceId,
      ticketType: ticketFormValue.ticketType,
      attendeeFirstName: ticketFormValue.attendeeFirstName,
      attendeeLastName: ticketFormValue.attendeeLastName,
      attendeeDni: ticketFormValue.attendeeDni,
      price: ticketFormValue.price,
      quantity: 1 // Cada ticket es individual
    }));

    const payerInfo: PayerInfo = {
      email: this.payerForm.value.email,
      firstName: this.payerForm.value.firstName,
      lastName: this.payerForm.value.lastName,
      phone: this.payerForm.value.phone,
      documentType: this.payerForm.value.documentType,
      documentNumber: this.payerForm.value.documentNumber
    };

    const paymentRequest: PaymentRequest = {
      eventId: this.eventId,
      userId: this.currentUserId!,
      tickets: tickets,
      totalAmount: this.calculateTotal(),
      payer: payerInfo
    };

    this.isLoading = true;
    this.error = null;

    this.paymentService.createPaymentPreference(paymentRequest)
      .pipe(
        finalize(() => (this.isLoading = false)),
        catchError(err => {
          console.error('Error creating payment preference:', err);
          this.error = 'Error al crear la preferencia de pago. Por favor intente nuevamente.';
          return EMPTY;
        })
      )
      .subscribe(response => {
        // Configurar datos para Checkout Bricks
        this.paymentData = {
          totalAmount: response.totalAmount,
          publicKey: response.publicKey,
          preferenceId: response.preferenceId,
          bricksConfig: response.bricksConfig,
          paymentRequest: paymentRequest // Include original payment request
        };
        this.showPaymentForm = true;
      });
  }

  onPaymentSuccess(paymentResult: any): void {
    this.modalService.success(
      `¡Pago exitoso! ID de pago: ${paymentResult.paymentId}`, 
      'Compra Exitosa'
    ).subscribe(() => {
      this.router.navigate(['/payment/success'], {
        queryParams: {
          payment_id: paymentResult.paymentId,
          status: paymentResult.status
        }
      });
    });
  }

  onPaymentError(error: any): void {
    console.error('Payment error:', error);
    this.error = error.error || 'Error al procesar el pago. Por favor intente nuevamente.';
    this.showPaymentForm = false;
  }

  goBackToTickets(): void {
    this.showPayerForm = false;
    this.showPaymentForm = false;
    this.paymentData = null;
    this.error = null;
  }

  goBackToPayer(): void {
    this.showPaymentForm = false;
    this.paymentData = null;
  }

  processWalletPayment(): void {
    if (this.payerForm.invalid) {
      this.error = 'Por favor complete todos los datos del pagador.';
      this.payerForm.markAllAsTouched();
      return;
    }

    if (this.amountAfterWallet !== 0) {
      this.error = 'El saldo de billetera virtual no es suficiente para cubrir la compra completa.';
      return;
    }

    const tickets: TicketItem[] = this.attendeeTickets.value.map((ticketFormValue: any) => ({
      sectionId: ticketFormValue.sectionId,
      ticketPriceId: ticketFormValue.ticketPriceId,
      ticketType: ticketFormValue.ticketType,
      attendeeFirstName: ticketFormValue.attendeeFirstName,
      attendeeLastName: ticketFormValue.attendeeLastName,
      attendeeDni: ticketFormValue.attendeeDni,
      price: ticketFormValue.price,
      quantity: 1
    }));

    const payerInfo: PayerInfo = {
      email: this.payerForm.value.email,
      firstName: this.payerForm.value.firstName,
      lastName: this.payerForm.value.lastName,
      phone: this.payerForm.value.phone,
      documentType: this.payerForm.value.documentType,
      documentNumber: this.payerForm.value.documentNumber
    };

    const paymentRequest: PaymentRequest = {
      eventId: this.eventId,
      userId: this.currentUserId!,
      tickets: tickets,
      totalAmount: this.calculateTotal(),
      payer: payerInfo
    };

    this.isLoading = true;
    this.error = null;

    this.paymentService.processWalletPayment(paymentRequest)
      .pipe(
        finalize(() => (this.isLoading = false)),
        catchError(err => {
          console.error('Error processing wallet payment:', err);
          this.error = 'Error al procesar el pago con billetera virtual. Por favor intente nuevamente.';
          return EMPTY;
        })
      )
             .subscribe((response: PaymentResponse) => {
         this.modalService.success(
           'Compra realizada exitosamente con billetera virtual', 
           'Compra Exitosa'
         ).subscribe(() => {
           this.router.navigate(['/payment/success'], {
             queryParams: {
               transaction_id: response.transactionId,
               status: 'COMPLETED'
             }
           });
         });
       });
  }

  private getStatusMessage(status: string | undefined): string {
    switch (status) {
      case 'PROXIMO':
        return 'Este evento está programado pero la venta de entradas aún no ha comenzado. Serás redirigido al detalle del evento.';
      case 'AGOTADO':
        return 'Lo sentimos, todas las entradas para este evento han sido vendidas. Serás redirigido al detalle del evento.';
      case 'CANCELADO':
        return 'Este evento ha sido cancelado. Si ya compraste entradas, te contactaremos sobre el proceso de reembolso. Serás redirigido al detalle del evento.';
      case 'FINALIZADO':
        return 'Este evento ya ha concluido. No es posible comprar entradas. Serás redirigido al detalle del evento.';
      default:
        return `La venta de entradas para este evento no está activa actualmente. Serás redirigido al detalle del evento.`;
    }
  }
}
