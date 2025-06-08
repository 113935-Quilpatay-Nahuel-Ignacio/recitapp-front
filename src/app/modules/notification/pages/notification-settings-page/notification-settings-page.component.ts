import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationSettingsComponent } from '../../components/notification-settings/notification-settings.component';

@Component({
  selector: 'app-notification-settings-page',
  standalone: true,
  imports: [
    CommonModule,
    NotificationSettingsComponent
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Configuración de Notificaciones</h1>
        <p>Personaliza cómo y cuándo quieres recibir notificaciones de RecitApp</p>
      </div>
      
      <app-notification-settings></app-notification-settings>
    </div>
  `,
  styles: [`
    .page-container {
      min-height: 100vh;
      background-color: #f5f5f5;
      padding: 20px 0;
    }

    .page-header {
      text-align: center;
      margin-bottom: 30px;
      padding: 0 20px;
    }

    .page-header h1 {
      color: #1976d2;
      margin-bottom: 10px;
      font-size: 2.5rem;
      font-weight: 300;
    }

    .page-header p {
      color: #666;
      font-size: 1.1rem;
      max-width: 600px;
      margin: 0 auto;
    }

    @media (max-width: 600px) {
      .page-header h1 {
        font-size: 2rem;
      }
      
      .page-header p {
        font-size: 1rem;
      }
    }
  `]
})
export class NotificationSettingsPageComponent {
  constructor() { }
} 