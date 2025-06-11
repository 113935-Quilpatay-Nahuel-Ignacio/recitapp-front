import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { NotificationService } from '../../../notification/services/notification.service';
import { FirebaseService } from '../../../../services/firebase.service';

interface TestResult {
  success: boolean;
  message: string;
  timestamp: Date;
}

@Component({
  selector: 'app-notification-test',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTabsModule,
    MatSnackBarModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatCheckboxModule,
    MatListModule
  ],
  templateUrl: './notification-test.component.html',
  styleUrls: ['./notification-test.component.scss']
})
export class NotificationTestComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private notificationService = inject(NotificationService);
  private firebaseService = inject(FirebaseService);

  emailForm!: FormGroup;
  smsForm!: FormGroup;
  pushForm!: FormGroup;
  deviceTokenForm!: FormGroup;

  isLoading = {
    email: false,
    sms: false,
    push: false,
    deviceToken: false
  };

  testResults: TestResult[] = [];
  deviceTokens: string[] = [];
  generatedTokens: string[] = [];
  realTokens: string[] = [];
  webPushSupported = false;

  emailTemplates = [
    { value: 'custom', name: 'Personalizado' },
    { value: 'new-event', name: 'Nuevo Evento' },
    { value: 'low-availability', name: 'Baja Disponibilidad' },
    { value: 'reminder', name: 'Recordatorio' }
  ];

  smsTemplates = [
    { value: 'custom', name: 'Personalizado' },
    { value: 'event-reminder', name: 'Recordatorio de Evento' },
    { value: 'ticket-confirmation', name: 'Confirmación de Ticket' },
    { value: 'event-cancellation', name: 'Cancelación de Evento' }
  ];

  pushTypes = [
    { value: 'simple', name: 'Notificación Simple' },
    { value: 'advanced', name: 'Notificación Avanzada' },
    { value: 'topic', name: 'Notificación por Tópico' },
    { value: 'event', name: 'Notificación de Evento' }
  ];

  ngOnInit() {
    this.initializeForms();
    this.loadDeviceTokens();
    this.generateTestTokens();
    this.initializeWebPush();
  }

  initializeForms() {
    this.emailForm = this.fb.group({
      template: ['custom', Validators.required],
      to: ['test@example.com', [Validators.required, Validators.email]],
      subject: ['Prueba de Notificación - RecitApp', Validators.required],
      message: ['Esta es una notificación de prueba desde RecitApp Admin Panel.', Validators.required],
      // Campos específicos para templates
      eventName: ['Concierto de Prueba'],
      artistName: ['Artista de Prueba'],
      venueName: ['Venue de Prueba'],
      eventDate: ['2024-12-31T20:00:00'],
      ticketsRemaining: [10]
    });

    this.smsForm = this.fb.group({
      template: ['custom', Validators.required],
      phoneNumber: ['+1234567890', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      message: ['Prueba SMS desde RecitApp', Validators.required],
      templateId: ['event-reminder'],
      // Campos específicos para templates
      eventName: ['Evento de Prueba'],
      venueName: ['Venue de Prueba']
    });

    this.pushForm = this.fb.group({
      type: ['simple', Validators.required],
      deviceToken: ['', Validators.required],
      title: ['RecitApp - Notificación de Prueba', Validators.required],
      body: ['Esta es una notificación push de prueba', Validators.required],
      topic: ['test-topic'],
      eventId: ['1'],
      actionUrl: ['https://recitapp.com/events/1'],
      imageUrl: [''],
      priority: ['high'],
      // Campos específicos para notificación de evento
      eventName: ['Concierto de Prueba'],
      artistName: ['Artista de Prueba']
    });

    this.deviceTokenForm = this.fb.group({
      deviceToken: ['', Validators.required]
    });
  }

  loadDeviceTokens() {
    this.notificationService.getUserDeviceTokens().subscribe({
      next: (tokens) => {
        this.deviceTokens = tokens.map(t => t.deviceToken);
        if (this.deviceTokens.length > 0) {
          this.pushForm.patchValue({ deviceToken: this.deviceTokens[0] });
        }
      },
      error: (error) => {
        console.error('Error loading device tokens:', error);
      }
    });
  }

  onEmailTemplateChange() {
    const template = this.emailForm.get('template')?.value;
    
    switch (template) {
      case 'new-event':
        this.emailForm.patchValue({
          subject: 'Nuevo Evento Disponible - RecitApp',
          message: 'Se ha agregado un nuevo evento que podría interesarte.'
        });
        break;
      case 'low-availability':
        this.emailForm.patchValue({
          subject: 'Últimas Entradas Disponibles - RecitApp',
          message: 'Quedan pocas entradas para el evento. ¡No te lo pierdas!'
        });
        break;
      case 'reminder':
        this.emailForm.patchValue({
          subject: 'Recordatorio de Evento - RecitApp',
          message: 'Te recordamos que tienes un evento próximo.'
        });
        break;
      default:
        this.emailForm.patchValue({
          subject: 'Prueba de Notificación - RecitApp',
          message: 'Esta es una notificación de prueba desde RecitApp Admin Panel.'
        });
    }
  }

  onSmsTemplateChange() {
    const template = this.smsForm.get('template')?.value;
    
    switch (template) {
      case 'event-reminder':
        this.smsForm.patchValue({
          message: 'Recordatorio: Tu evento es mañana. Detalles en RecitApp.'
        });
        break;
      case 'ticket-confirmation':
        this.smsForm.patchValue({
          message: 'Tu ticket ha sido confirmado. Revisa tu email para más detalles.'
        });
        break;
      case 'event-cancellation':
        this.smsForm.patchValue({
          message: 'Evento cancelado. Reembolso procesándose. Más info en RecitApp.'
        });
        break;
      default:
        this.smsForm.patchValue({
          message: 'Prueba SMS desde RecitApp'
        });
    }
  }

  testEmail() {
    if (this.emailForm.invalid) {
      this.markFormGroupTouched(this.emailForm);
      return;
    }

    this.isLoading.email = true;
    const formData = this.emailForm.value;
    
    let request: any;
    
    if (formData.template === 'new-event') {
      request = this.http.post(`${environment.apiUrl}/notifications/email/new-event`, {
        recipientEmail: formData.to,
        eventName: formData.eventName,
        artistName: formData.artistName,
        eventDate: formData.eventDate,
        venueName: formData.venueName
      }, { responseType: 'text' });
    } else if (formData.template === 'low-availability') {
      request = this.http.post(`${environment.apiUrl}/notifications/email/low-availability`, {
        recipientEmail: formData.to,
        eventName: formData.eventName,
        ticketsRemaining: formData.ticketsRemaining
      }, { responseType: 'text' });
    } else {
      request = this.http.post(`${environment.apiUrl}/notifications/test/email`, null, {
        params: {
          to: formData.to,
          subject: formData.subject,
          message: formData.message
        },
        responseType: 'text'
      });
    }

    request.subscribe({
      next: (response: string) => {
        this.addTestResult(true, `${response}`);
        this.isLoading.email = false;
      },
      error: (error: any) => {
        console.error('Error enviando email:', error);
        let errorMessage = 'Error desconocido';
        if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.status) {
          errorMessage = `Error HTTP ${error.status}: ${error.statusText || 'Error del servidor'}`;
        }
        this.addTestResult(false, `Error enviando email: ${errorMessage}`);
        this.isLoading.email = false;
      }
    });
  }

  testSms() {
    if (this.smsForm.invalid) {
      this.markFormGroupTouched(this.smsForm);
      return;
    }

    this.isLoading.sms = true;
    const formData = this.smsForm.value;
    
    let request: any;
    
    if (formData.template === 'custom') {
      request = this.http.post(`${environment.apiUrl}/notifications/test/sms`, null, {
        params: {
          phoneNumber: formData.phoneNumber,
          message: formData.message
        },
        responseType: 'text'
      });
    } else {
      request = this.http.post(`${environment.apiUrl}/notifications/test/sms/template`, null, {
        params: {
          phoneNumber: formData.phoneNumber,
          templateId: formData.templateId,
          eventName: formData.eventName,
          venueName: formData.venueName
        },
        responseType: 'text'
      });
    }

    request.subscribe({
      next: (response: string) => {
        this.addTestResult(true, `${response}`);
        this.isLoading.sms = false;
      },
      error: (error: any) => {
        console.error('Error enviando SMS:', error);
        let errorMessage = 'Error desconocido';
        if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.status) {
          errorMessage = `Error HTTP ${error.status}: ${error.statusText || 'Error del servidor'}`;
        }
        this.addTestResult(false, `Error enviando SMS: ${errorMessage}`);
        this.isLoading.sms = false;
      }
    });
  }

  testPush() {
    if (this.pushForm.invalid) {
      this.markFormGroupTouched(this.pushForm);
      return;
    }

    this.isLoading.push = true;
    const formData = this.pushForm.value;
    
    let request: any;
    
    switch (formData.type) {
      case 'simple':
        request = this.http.post(`${environment.apiUrl}/notifications/test/push`, null, {
          params: {
            deviceToken: formData.deviceToken,
            title: formData.title,
            body: formData.body
          },
          responseType: 'text'
        });
        break;
        
      case 'advanced':
        request = this.http.post(`${environment.apiUrl}/notifications/test/push/advanced`, null, {
          params: {
            deviceToken: formData.deviceToken,
            title: formData.title,
            body: formData.body,
            eventId: formData.eventId,
            actionUrl: formData.actionUrl,
            imageUrl: formData.imageUrl
          },
          responseType: 'text'
        });
        break;
        
      case 'topic':
        request = this.http.post(`${environment.apiUrl}/notifications/test/push/topic`, null, {
          params: {
            topic: formData.topic,
            title: formData.title,
            body: formData.body
          },
          responseType: 'text'
        });
        break;
        
      case 'event':
        request = this.http.post(`${environment.apiUrl}/notifications/test/push/event-notification`, null, {
          params: {
            deviceToken: formData.deviceToken,
            eventId: formData.eventId,
            eventName: formData.eventName,
            artistName: formData.artistName
          },
          responseType: 'text'
        });
        break;
    }

    request.subscribe({
      next: (response: string) => {
        this.addPushTestResult(true, `${response}`);
        this.isLoading.push = false;
      },
      error: (error: any) => {
        console.error('Error enviando push notification:', error);
        let errorMessage = 'Error desconocido';
        if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.status) {
          errorMessage = `Error HTTP ${error.status}: ${error.statusText || 'Error del servidor'}`;
        }
        this.addPushTestResult(false, `Error enviando push notification: ${errorMessage}`);
        this.isLoading.push = false;
      }
    });
  }

  validateDeviceToken() {
    if (this.deviceTokenForm.invalid) {
      this.markFormGroupTouched(this.deviceTokenForm);
      return;
    }

    this.isLoading.deviceToken = true;
    const deviceToken = this.deviceTokenForm.get('deviceToken')?.value;
    
    this.http.post(`${environment.apiUrl}/notifications/test/push/validate-token`, null, {
      params: { deviceToken },
      responseType: 'text'
    }).subscribe({
      next: (response: string) => {
        this.addTestResult(true, `${response}`, false);
        this.isLoading.deviceToken = false;
      },
      error: (error: any) => {
        console.error('Error validando token:', error);
        let errorMessage = 'Error desconocido';
        if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.status) {
          errorMessage = `Error HTTP ${error.status}: ${error.statusText || 'Error del servidor'}`;
        }
        this.addTestResult(false, `Token inválido: ${errorMessage}`, false);
        this.isLoading.deviceToken = false;
      }
    });
  }

  addTestResult(success: boolean, message: string, skipSnackbar: boolean = false) {
    this.testResults.unshift({
      success,
      message,
      timestamp: new Date()
    });
    
    // Mantener solo los últimos 10 resultados
    if (this.testResults.length > 10) {
      this.testResults = this.testResults.slice(0, 10);
    }

    // Mostrar snackbar solo si no se especifica omitirlo
    if (!skipSnackbar) {
      this.snackBar.open(
        success ? 'Operación exitosa' : 'Error en la operación',
        'Cerrar',
        {
          duration: 3000,
          panelClass: success ? 'success-snackbar' : 'error-snackbar'
        }
      );
    }
  }

  // Método específico para resultados de push notifications
  addPushTestResult(success: boolean, message: string) {
    this.testResults.unshift({
      success,
      message,
      timestamp: new Date()
    });
    
    // Mantener solo los últimos 10 resultados
    if (this.testResults.length > 10) {
      this.testResults = this.testResults.slice(0, 10);
    }

    if (success) {
      // Para notificaciones push exitosas, mostrar un snackbar diferente y posicionado arriba
      this.snackBar.open(
        '✅ Push notification enviada - Revisa tu pantalla',
        'Cerrar',
        {
          duration: 5000,
          panelClass: 'push-success-snackbar',
          verticalPosition: 'top',
          horizontalPosition: 'right'
        }
      );
    } else {
      // Para errores, usar el snackbar normal
      this.snackBar.open(
        'Error en la operación',
        'Cerrar',
        {
          duration: 3000,
          panelClass: 'error-snackbar'
        }
      );
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  clearResults() {
    this.testResults = [];
  }

  generateTestTokens() {
    // Generar algunos tokens de prueba con formato FCM válido
    this.generatedTokens = [
      this.generateFCMToken('android'),
      this.generateFCMToken('ios'),
      this.generateFCMToken('web'),
      this.generateFCMToken('android'),
      this.generateFCMToken('ios')
    ];
  }

  generateFCMToken(platform: string = 'android'): string {
    // Los tokens FCM tienen diferentes formatos según la plataforma
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let token = '';
    
    // Tokens de Android suelen ser más largos (152+ caracteres)
    // Tokens de iOS son similares pero con variaciones
    // Tokens web tienen un formato ligeramente diferente
    
    const lengths = {
      android: 152,
      ios: 64,
      web: 163
    };
    
    const length = lengths[platform as keyof typeof lengths] || 152;
    
    for (let i = 0; i < length; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return token;
  }

  useGeneratedToken(token: string) {
    this.deviceTokenForm.patchValue({ deviceToken: token });
    this.pushForm.patchValue({ deviceToken: token });
    this.addTestResult(true, `Token generado seleccionado: ${token.substring(0, 20)}...`, true);
  }

  generateNewToken() {
    const newToken = this.generateFCMToken('android');
    this.generatedTokens.unshift(newToken);
    
    // Mantener solo los últimos 10 tokens generados
    if (this.generatedTokens.length > 10) {
      this.generatedTokens = this.generatedTokens.slice(0, 10);
    }
    
    this.useGeneratedToken(newToken);
  }

  copyTokenToClipboard(token: string) {
    navigator.clipboard.writeText(token).then(() => {
      this.addTestResult(true, 'Token copiado al portapapeles');
    }).catch(() => {
      this.addTestResult(false, 'Error copiando token al portapapeles');
    });
  }

  // Nuevos métodos para Web Push Notifications
  initializeWebPush() {
    this.webPushSupported = this.firebaseService.isSupported();
    if (this.webPushSupported) {
      this.addTestResult(true, 'Web Push Notifications soportado en este navegador', true);
      // Configurar listener para notificaciones en primer plano
      this.firebaseService.onMessage((payload) => {
        console.log('Foreground message received:', payload);
        // Agregar al historial sin snackbar para evitar duplicados
        this.addTestResult(true, `📱 Notificación recibida en primer plano: ${payload.notification?.title}`, true);
        
        // Mostrar snackbar especial para notificaciones recibidas
        this.snackBar.open(
          `📱 Notificación recibida: ${payload.notification?.title}`,
          'Ver',
          {
            duration: 7000,
            panelClass: 'received-notification-snackbar',
            verticalPosition: 'top',
            horizontalPosition: 'left'
          }
        );
      });
    } else {
      this.addTestResult(false, 'Web Push Notifications no soportado en este navegador');
    }
  }

  async generateRealToken() {
    this.isLoading.deviceToken = true;
    try {
      const token = await this.firebaseService.getDeviceToken();
      if (token) {
        this.realTokens.unshift(token);
        // Mantener solo los últimos 5 tokens reales
        if (this.realTokens.length > 5) {
          this.realTokens = this.realTokens.slice(0, 5);
        }
        this.useRealToken(token);
        this.addTestResult(true, `Token FCM real generado exitosamente: ${token.substring(0, 20)}...`);
      } else {
        this.addTestResult(false, 'Error generando token FCM real - permiso de notificaciones denegado');
      }
    } catch (error: any) {
      this.addTestResult(false, `Error generando token FCM real: ${error.message}`);
    } finally {
      this.isLoading.deviceToken = false;
    }
  }

  useRealToken(token: string) {
    this.deviceTokenForm.patchValue({ deviceToken: token });
    this.pushForm.patchValue({ deviceToken: token });
    this.addTestResult(true, `Token FCM real seleccionado: ${token.substring(0, 20)}...`, true);
  }

  async testWebPushNotification() {
    if (!this.webPushSupported) {
      this.addTestResult(false, 'Web Push Notifications no soportado');
      return;
    }

    // Generar token si no hay uno disponible
    if (this.realTokens.length === 0) {
      await this.generateRealToken();
    }

    // Proceder con el test normal si hay token
    if (this.realTokens.length > 0) {
      this.testPush();
    }
  }
} 