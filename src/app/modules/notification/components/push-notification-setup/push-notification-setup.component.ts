import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseMessagingService } from '../../services/firebase-messaging.service';
import { SessionService } from '../../../../core/services/session.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-push-notification-setup',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="showSetupPrompt" class="notification-setup-banner">
      <div class="alert alert-info d-flex justify-content-between align-items-center">
        <div>
          <i class="bi bi-bell me-2"></i>
          <strong>¿Recibir notificaciones?</strong>
          <span class="ms-2">Mantente informado sobre nuevos eventos y promociones.</span>
        </div>
        <div>
          <button class="btn btn-primary btn-sm me-2" (click)="enableNotifications()">
            <i class="bi bi-check-lg me-1"></i>
            Activar
          </button>
          <button class="btn btn-outline-secondary btn-sm" (click)="dismissSetup()">
            <i class="bi bi-x-lg me-1"></i>
            Ahora no
          </button>
        </div>
      </div>
    </div>

    <div *ngIf="showPermissionError" class="notification-error-banner">
      <div class="alert alert-warning d-flex justify-content-between align-items-center">
        <div>
          <i class="bi bi-exclamation-triangle me-2"></i>
          <strong>Notificaciones bloqueadas</strong>
          <span class="ms-2">Para recibir notificaciones, permite el acceso en la configuración del navegador.</span>
        </div>
        <button class="btn btn-outline-warning btn-sm" (click)="showPermissionHelp()">
          <i class="bi bi-question-circle me-1"></i>
          Ayuda
        </button>
      </div>
    </div>
  `,
  styles: [`
    .notification-setup-banner {
      position: fixed;
      top: 20px;
      right: 20px;
      max-width: 400px;
      z-index: 1050;
      animation: slideIn 0.3s ease-out;
    }

    .notification-error-banner {
      position: fixed;
      top: 20px;
      right: 20px;
      max-width: 400px;
      z-index: 1050;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .alert {
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      border: none;
    }
  `]
})
export class PushNotificationSetupComponent implements OnInit, OnDestroy {
  showSetupPrompt = false;
  showPermissionError = false;
  private destroy$ = new Subject<void>();

  constructor(
    private firebaseMessaging: FirebaseMessagingService,
    private sessionService: SessionService
  ) {}

  ngOnInit() {
    // Solo ejecutar en el navegador, no durante SSR
    if (typeof window !== 'undefined') {
      // Solo mostrar el prompt si el usuario está logueado
      if (this.sessionService.isUserLoggedIn()) {
        this.checkNotificationStatus();
      }
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkNotificationStatus() {
    // Verificar si las notificaciones están soportadas
    if (!this.firebaseMessaging.isPushNotificationSupported()) {
      console.log('Push notifications not supported');
      return;
    }

    const permission = this.firebaseMessaging.getPermissionStatus();
    
    switch (permission) {
      case 'default':
        // Mostrar prompt después de un delay
        setTimeout(() => {
          this.showSetupPrompt = true;
        }, 3000);
        break;
      
      case 'granted':
        // Inicializar automáticamente si ya tiene permisos
        this.initializeNotifications();
        break;
      
      case 'denied':
        // Mostrar mensaje de error
        this.showPermissionError = true;
        break;
    }
  }

  async enableNotifications() {
    this.showSetupPrompt = false;
    
    try {
      const success = await this.firebaseMessaging.initializePushNotifications();
      
      if (success) {
        // Mostrar mensaje de éxito (opcional)
        this.showSuccessMessage();
      } else {
        this.showPermissionError = true;
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      this.showPermissionError = true;
    }
  }

  dismissSetup() {
    this.showSetupPrompt = false;
    
    // Guardar en localStorage que el usuario rechazó (opcional)
    localStorage.setItem('pushNotificationPromptDismissed', 'true');
  }

  showPermissionHelp() {
    // Mostrar modal o redirigir a página de ayuda
    const helpText = `
Para habilitar las notificaciones:

Chrome:
1. Haz clic en el ícono del candado en la barra de direcciones
2. Selecciona "Notificaciones" > "Permitir"
3. Recarga la página

Firefox:
1. Haz clic en el ícono del escudo en la barra de direcciones
2. Selecciona "Permitir notificaciones"
3. Recarga la página

Safari:
1. Ve a Preferencias > Sitios web > Notificaciones
2. Busca el sitio y selecciona "Permitir"
3. Recarga la página
    `;
    
    alert(helpText);
  }

  private async initializeNotifications() {
    try {
      await this.firebaseMessaging.initializePushNotifications();
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  private showSuccessMessage() {
    // Crear un toast o notificación de éxito temporal
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success position-fixed';
    successDiv.style.cssText = 'top: 20px; right: 20px; z-index: 1060; max-width: 300px;';
    successDiv.innerHTML = `
      <i class="bi bi-check-circle me-2"></i>
      <strong>¡Notificaciones activadas!</strong>
      <br>
      <small>Ahora recibirás actualizaciones importantes.</small>
    `;
    
    document.body.appendChild(successDiv);
    
    // Remover después de 4 segundos
    setTimeout(() => {
      if (successDiv.parentNode) {
        successDiv.parentNode.removeChild(successDiv);
      }
    }, 4000);
  }
} 