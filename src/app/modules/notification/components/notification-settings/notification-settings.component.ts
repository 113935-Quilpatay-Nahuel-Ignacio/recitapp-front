import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

import { NotificationService } from '../../services/notification.service';
import { FirebaseMessagingService } from '../../services/firebase-messaging.service';
import { NotificationPreferences, NotificationType, NotificationChannel } from '../../models/notification.models';

@Component({
  selector: 'app-notification-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  template: `
    <div class="notification-settings-container">
      <mat-card class="settings-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>notifications</mat-icon>
            Configuración de Notificaciones
          </mat-card-title>
          <mat-card-subtitle>
            Personaliza cómo y cuándo quieres recibir notificaciones
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <div *ngIf="loading" class="loading-container">
            <mat-spinner diameter="40"></mat-spinner>
            <p>Cargando configuración...</p>
          </div>

          <div *ngIf="!loading" class="settings-content">
            <!-- Push Notifications Setup -->
            <section class="settings-section">
              <h3>
                <mat-icon>push_pin</mat-icon>
                Notificaciones Push
              </h3>
              <p class="section-description">
                Recibe notificaciones instantáneas en tu navegador
              </p>
              
              <div class="permission-status" [ngClass]="pushPermissionStatus">
                <mat-icon>{{ getPushStatusIcon() }}</mat-icon>
                <span>{{ getPushStatusText() }}</span>
              </div>

              <div class="setting-item">
                <mat-slide-toggle 
                  [(ngModel)]="preferences.channels.PUSH"
                  [disabled]="pushPermissionStatus !== 'granted'"
                  (change)="onChannelToggle('PUSH', $event.checked)">
                  Habilitar notificaciones push
                </mat-slide-toggle>
                <button 
                  mat-stroked-button 
                  *ngIf="pushPermissionStatus === 'default'"
                  (click)="requestPushPermission()"
                  class="permission-button">
                  <mat-icon>notification_add</mat-icon>
                  Solicitar Permisos
                </button>
              </div>
            </section>

            <mat-divider></mat-divider>

            <!-- Email Notifications -->
            <section class="settings-section">
              <h3>
                <mat-icon>email</mat-icon>
                Notificaciones por Email
              </h3>
              <p class="section-description">
                Recibe notificaciones detalladas en tu correo electrónico
              </p>
              
              <div class="setting-item">
                <mat-slide-toggle 
                  [(ngModel)]="preferences.channels.EMAIL"
                  (change)="onChannelToggle('EMAIL', $event.checked)">
                  Habilitar notificaciones por email
                </mat-slide-toggle>
              </div>
            </section>

            <mat-divider></mat-divider>

            <!-- SMS Notifications -->
            <section class="settings-section">
              <h3>
                <mat-icon>sms</mat-icon>
                Notificaciones por SMS
              </h3>
              <p class="section-description">
                Recibe notificaciones importantes por mensaje de texto
              </p>
              
              <div class="setting-item">
                <mat-slide-toggle 
                  [(ngModel)]="preferences.channels.SMS"
                  (change)="onChannelToggle('SMS', $event.checked)">
                  Habilitar notificaciones por SMS
                </mat-slide-toggle>
              </div>
            </section>

            <mat-divider></mat-divider>

            <!-- Notification Types -->
            <section class="settings-section">
              <h3>
                <mat-icon>category</mat-icon>
                Tipos de Notificaciones
              </h3>
              <p class="section-description">
                Selecciona qué tipos de notificaciones quieres recibir
              </p>

              <div class="notification-types">
                <div class="setting-item" *ngFor="let type of notificationTypes">
                  <mat-slide-toggle 
                    [(ngModel)]="preferences.types[type.key]"
                    (change)="onTypeToggle(type.key, $event.checked)">
                    <div class="type-info">
                      <mat-icon>{{ type.icon }}</mat-icon>
                      <div>
                        <strong>{{ type.name }}</strong>
                        <p>{{ type.description }}</p>
                      </div>
                    </div>
                  </mat-slide-toggle>
                </div>
              </div>
            </section>

            <mat-divider></mat-divider>

            <!-- Test Notifications -->
            <section class="settings-section">
              <h3>
                <mat-icon>bug_report</mat-icon>
                Probar Notificaciones
              </h3>
              <p class="section-description">
                Envía notificaciones de prueba para verificar tu configuración
              </p>

              <div class="test-buttons">
                <button 
                  mat-raised-button 
                  color="primary"
                  [disabled]="!preferences.channels.PUSH || testing"
                  (click)="testPushNotification()">
                  <mat-icon>push_pin</mat-icon>
                  Probar Push
                </button>

                <button 
                  mat-raised-button 
                  color="accent"
                  [disabled]="!preferences.channels.EMAIL || testing"
                  (click)="testEmailNotification()">
                  <mat-icon>email</mat-icon>
                  Probar Email
                </button>

                <button 
                  mat-raised-button 
                  [disabled]="!preferences.channels.SMS || testing"
                  (click)="testSmsNotification()">
                  <mat-icon>sms</mat-icon>
                  Probar SMS
                </button>
              </div>
            </section>
          </div>
        </mat-card-content>

        <mat-card-actions>
          <button 
            mat-raised-button 
            color="primary"
            [disabled]="saving"
            (click)="savePreferences()">
            <mat-icon>save</mat-icon>
            {{ saving ? 'Guardando...' : 'Guardar Configuración' }}
          </button>
          
          <button 
            mat-button
            (click)="resetToDefaults()">
            <mat-icon>restore</mat-icon>
            Restaurar Valores por Defecto
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .notification-settings-container {
      max-width: 800px;
      margin: 20px auto;
      padding: 20px;
    }

    .settings-card {
      margin-bottom: 20px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;
      text-align: center;
    }

    .settings-content {
      padding: 20px 0;
    }

    .settings-section {
      margin: 30px 0;
    }

    .settings-section h3 {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
      color: #1976d2;
    }

    .section-description {
      color: #666;
      margin-bottom: 20px;
      font-size: 14px;
    }

    .setting-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 15px 0;
      padding: 10px 0;
    }

    .permission-status {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 15px;
      font-weight: 500;
    }

    .permission-status.granted {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .permission-status.denied {
      background-color: #ffebee;
      color: #c62828;
    }

    .permission-status.default {
      background-color: #fff3e0;
      color: #ef6c00;
    }

    .permission-button {
      margin-left: 10px;
    }

    .notification-types {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .type-info {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .type-info div {
      flex: 1;
    }

    .type-info p {
      margin: 5px 0 0 0;
      font-size: 12px;
      color: #666;
    }

    .test-buttons {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
    }

    .test-buttons button {
      min-width: 140px;
    }

    mat-card-actions {
      display: flex;
      gap: 15px;
      padding: 20px;
    }

    mat-divider {
      margin: 30px 0;
    }

    @media (max-width: 600px) {
      .notification-settings-container {
        margin: 10px;
        padding: 10px;
      }

      .test-buttons {
        flex-direction: column;
      }

      .test-buttons button {
        width: 100%;
      }

      mat-card-actions {
        flex-direction: column;
      }

      mat-card-actions button {
        width: 100%;
      }
    }
  `]
})
export class NotificationSettingsComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private firebaseMessaging = inject(FirebaseMessagingService);
  private snackBar = inject(MatSnackBar);

  loading = true;
  saving = false;
  testing = false;
  pushPermissionStatus: NotificationPermission = 'default';

  preferences: NotificationPreferences = {
    channels: {
      EMAIL: true,
      PUSH: false,
      SMS: false
    },
    types: {
      NUEVO_EVENTO: true,
      POCAS_ENTRADAS: true,
      CANCELACION: true,
      MODIFICACION: true,
      RECOMENDACION: true,
      RECORDATORIO: true
    }
  };

  notificationTypes = [
    {
      key: 'NUEVO_EVENTO' as NotificationType,
      name: 'Nuevos Eventos',
      description: 'Notificaciones cuando se publican nuevos eventos',
      icon: 'event'
    },
    {
      key: 'POCAS_ENTRADAS' as NotificationType,
      name: 'Pocas Entradas',
      description: 'Alertas cuando quedan pocas entradas disponibles',
      icon: 'warning'
    },
    {
      key: 'CANCELACION' as NotificationType,
      name: 'Cancelaciones',
      description: 'Notificaciones sobre eventos cancelados',
      icon: 'cancel'
    },
    {
      key: 'MODIFICACION' as NotificationType,
      name: 'Modificaciones',
      description: 'Cambios en eventos que tienes tickets',
      icon: 'edit'
    },
    {
      key: 'RECOMENDACION' as NotificationType,
      name: 'Recomendaciones',
      description: 'Eventos recomendados basados en tus gustos',
      icon: 'recommend'
    },
    {
      key: 'RECORDATORIO' as NotificationType,
      name: 'Recordatorios',
      description: 'Recordatorios antes de tus eventos',
      icon: 'schedule'
    }
  ];

  async ngOnInit() {
    await this.loadPreferences();
    await this.checkPushPermissionStatus();
    this.loading = false;
  }

  private async loadPreferences() {
    try {
      const prefs = await this.notificationService.getUserPreferences().toPromise();
      if (prefs) {
        this.preferences = prefs;
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      this.showMessage('Error al cargar las preferencias', 'error');
    }
  }

  private async checkPushPermissionStatus() {
    this.pushPermissionStatus = await this.firebaseMessaging.getPermissionStatus();
  }

  getPushStatusIcon(): string {
    switch (this.pushPermissionStatus) {
      case 'granted': return 'check_circle';
      case 'denied': return 'block';
      default: return 'help';
    }
  }

  getPushStatusText(): string {
    switch (this.pushPermissionStatus) {
      case 'granted': return 'Permisos concedidos';
      case 'denied': return 'Permisos denegados';
      default: return 'Permisos no solicitados';
    }
  }

  async requestPushPermission() {
    try {
      const permission = await this.firebaseMessaging.requestPermission();
      this.pushPermissionStatus = permission;
      
      if (permission === 'granted') {
        this.preferences.channels.PUSH = true;
        // Register the device token with the backend
        const token = await this.firebaseMessaging.getToken();
        if (token) {
          await this.registerDeviceToken(token);
        }
        this.showMessage('Permisos de notificación concedidos', 'success');
      } else {
        this.showMessage('Permisos de notificación denegados', 'warning');
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      this.showMessage('Error al solicitar permisos', 'error');
    }
  }

  private async registerDeviceToken(token: string) {
    try {
      await this.notificationService.registerDeviceToken(token, 'WEB', navigator.userAgent).toPromise();
      console.log('Device token registered successfully');
    } catch (error) {
      console.error('Error registering device token:', error);
    }
  }

  onChannelToggle(channel: NotificationChannel, enabled: boolean) {
    this.preferences.channels[channel] = enabled;
    
    if (channel === 'PUSH' && enabled && this.pushPermissionStatus !== 'granted') {
      this.requestPushPermission();
    }
  }

  onTypeToggle(type: NotificationType, enabled: boolean) {
    this.preferences.types[type] = enabled;
  }

  async savePreferences() {
    this.saving = true;
    try {
      await this.notificationService.updateUserPreferences(this.preferences).toPromise();
      this.showMessage('Configuración guardada correctamente', 'success');
    } catch (error) {
      console.error('Error saving preferences:', error);
      this.showMessage('Error al guardar la configuración', 'error');
    } finally {
      this.saving = false;
    }
  }

  resetToDefaults() {
    this.preferences = {
      channels: {
        EMAIL: true,
        PUSH: false,
        SMS: false
      },
      types: {
        NUEVO_EVENTO: true,
        POCAS_ENTRADAS: true,
        CANCELACION: true,
        MODIFICACION: true,
        RECOMENDACION: true,
        RECORDATORIO: true
      }
    };
    this.showMessage('Configuración restaurada a valores por defecto', 'info');
  }

  async testPushNotification() {
    if (!this.preferences.channels.PUSH) return;
    
    this.testing = true;
    try {
      await this.notificationService.testPushNotification().toPromise();
      this.showMessage('Notificación push enviada', 'success');
    } catch (error) {
      console.error('Error testing push notification:', error);
      this.showMessage('Error al enviar notificación push', 'error');
    } finally {
      this.testing = false;
    }
  }

  async testEmailNotification() {
    if (!this.preferences.channels.EMAIL) return;
    
    this.testing = true;
    try {
      await this.notificationService.testEmailNotification().toPromise();
      this.showMessage('Email de prueba enviado', 'success');
    } catch (error) {
      console.error('Error testing email notification:', error);
      this.showMessage('Error al enviar email de prueba', 'error');
    } finally {
      this.testing = false;
    }
  }

  async testSmsNotification() {
    if (!this.preferences.channels.SMS) return;
    
    this.testing = true;
    try {
      await this.notificationService.testSmsNotification().toPromise();
      this.showMessage('SMS de prueba enviado', 'success');
    } catch (error) {
      console.error('Error testing SMS notification:', error);
      this.showMessage('Error al enviar SMS de prueba', 'error');
    } finally {
      this.testing = false;
    }
  }

  private showMessage(message: string, type: 'success' | 'error' | 'warning' | 'info') {
    const config = {
      duration: 4000,
      panelClass: [`snackbar-${type}`]
    };
    
    this.snackBar.open(message, 'Cerrar', config);
  }
} 