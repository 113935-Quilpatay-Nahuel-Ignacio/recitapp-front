import { Component, inject, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TicketService } from '../../../ticket/services/ticket.service';
import { Ticket } from '../../../ticket/models/ticket.model';
import { Observable, of, Subject, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, tap, takeUntil } from 'rxjs/operators';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';

export interface ValidationMode {
  mode: 'qr-scan' | 'identification-code';
  label: string;
  description: string;
}

@Component({
  selector: 'app-ticket-validation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ZXingScannerModule],
  templateUrl: './ticket-validation.component.html',
  styleUrls: ['./ticket-validation.component.scss']
})
export class TicketValidationComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private ticketService = inject(TicketService);
  private destroy$ = new Subject<void>();

  @ViewChild('scanner', { static: false }) scanner!: ElementRef;

  // Validation modes
  validationModes: ValidationMode[] = [
    {
      mode: 'qr-scan',
      label: 'Escáner QR',
      description: 'Escanear código QR con la cámara'
    },
    {
      mode: 'identification-code',
      label: 'Código de Identificación',
      description: 'Ingresar código de identificación del ticket'
    }
  ];

  currentMode: ValidationMode['mode'] = 'qr-scan';
  
  // Scanner configuration
  availableDevices: MediaDeviceInfo[] = [];
  currentDevice: MediaDeviceInfo | undefined = undefined;
  hasDevices = false;
  hasCameras = false;
  hasPermission = false;
  qrResultString = '';
  
  // QR Scanner specific
  allowedFormats = [BarcodeFormat.QR_CODE];
  torchEnabled = false;
  torchAvailable$ = new BehaviorSubject<boolean>(false);
  tryHarder = false;

  // Forms
  identificationForm: FormGroup;

  // State
  isLoading = false;
  isScanning = false;
  validationResult: { 
    isValid: boolean; 
    message: string; 
    ticket?: Ticket;
    mode: ValidationMode['mode'];
    timestamp: Date;
  } | null = null;
  validationError: string | null = null;

  constructor() {
    this.identificationForm = this.fb.group({
      identificationCode: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Camera and QR Scanner methods
  onCamerasFound(devices: MediaDeviceInfo[]): void {
    this.availableDevices = devices;
    this.hasDevices = Boolean(devices && devices.length);
    this.hasCameras = this.hasDevices;
    
    // Select the first device by default
    if (this.hasDevices) {
      this.currentDevice = devices[0];
    }
  }

  onScannerLoaded(): void {
    // Scanner is ready
  }

  onPermissionResponse(permission: boolean): void {
    this.hasPermission = permission;
  }

  onTorchCompatible(isCompatible: boolean): void {
    this.torchAvailable$.next(isCompatible || false);
  }

  onCodeResult(resultString: string): void {
    if (resultString && resultString.trim()) {
      this.qrResultString = resultString;
      this.validateQRCode(resultString);
    }
  }

  onScanError(error: any): void {
    console.error('Scanner error:', error);
    this.validationError = 'Error al acceder a la cámara. Verifique los permisos.';
  }

  // Mode switching
  switchMode(mode: ValidationMode['mode']): void {
    this.currentMode = mode;
    this.resetValidation();
    
    if (mode === 'qr-scan') {
      this.startScanning();
    } else {
      this.stopScanning();
    }
  }

  // Scanner controls
  startScanning(): void {
    this.isScanning = true;
    this.resetValidation();
  }

  stopScanning(): void {
    this.isScanning = false;
  }

  toggleTorch(): void {
    this.torchEnabled = !this.torchEnabled;
  }

  onDeviceSelectChange(selected: string): void {
    const device = this.availableDevices.find(x => x.deviceId === selected);
    if (device) {
      this.currentDevice = device;
    }
  }

  // Validation methods
  private validateQRCode(qrCodeValue: string): void {
    // Extract ticket ID and QR code from the scanned value
    // Assuming QR format: "ticketId:qrCode" or just the QR code itself
    const parts = qrCodeValue.split(':');
    let ticketId: number;
    let qrCode: string;
    
    if (parts.length === 2) {
      ticketId = parseInt(parts[0], 10);
      qrCode = parts[1];
    } else {
      // If we can't parse ticket ID from QR, we'll need to ask user for it
      this.validationError = 'El código QR no contiene el ID del ticket. Por favor, use el modo de código de identificación.';
      this.switchMode('identification-code');
      return;
    }

    if (isNaN(ticketId)) {
      this.validationError = 'ID de ticket inválido en el código QR.';
      return;
    }

    this.performValidation(() => 
      this.ticketService.validateTicket(ticketId, qrCode), 'qr-scan'
    );
  }



  onValidateIdentificationCode(): void {
    if (this.identificationForm.invalid) {
      this.validationError = 'Por favor, ingrese un código de identificación válido.';
      this.identificationForm.markAllAsTouched();
      return;
    }

    const { identificationCode } = this.identificationForm.value;
    this.performValidation(() => 
      this.ticketService.validateTicketByCode(identificationCode), 'identification-code'
    );
  }

  private performValidation(
    validationFn: () => Observable<boolean>, 
    mode: ValidationMode['mode']
  ): void {
    this.isLoading = true;
    this.validationResult = null;
    this.validationError = null;

    validationFn().pipe(
      switchMap(isValid => {
        if (isValid) {
          this.validationResult = {
            isValid: true,
            message: '✅ ACCESO AUTORIZADO - Entrada validada exitosamente',
            mode: mode,
            timestamp: new Date()
          };
          return of(null);
        } else {
          this.validationResult = {
            isValid: false,
            message: '❌ ACCESO DENEGADO - Entrada inválida o ya utilizada',
            mode: mode,
            timestamp: new Date()
          };
          return of(null);
        }
      }),
      tap(() => {
        this.isLoading = false;
        if (mode === 'qr-scan' && this.validationResult?.isValid) {
          // If QR scan was successful, automatically restart scanning after 3 seconds
          setTimeout(() => {
            if (this.currentMode === 'qr-scan') {
              this.resetValidation();
            }
          }, 3000);
        }
      }),
      catchError(err => {
        this.isLoading = false;
        this.validationError = err.error?.message || 'Error durante la validación de la entrada.';
        if (err.status === 404) {
          this.validationError = 'Entrada no encontrada.';
        }
        return of(null);
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  resetValidation(): void {
    this.validationResult = null;
    this.validationError = null;
    this.qrResultString = '';
    this.isLoading = false;
    
    // Reset forms
    this.identificationForm.reset();
  }

  resetAll(): void {
    this.resetValidation();
    this.currentMode = 'qr-scan';
    this.startScanning();
  }

  getCurrentModeConfig(): ValidationMode {
    return this.validationModes.find(m => m.mode === this.currentMode) || this.validationModes[0];
  }
} 