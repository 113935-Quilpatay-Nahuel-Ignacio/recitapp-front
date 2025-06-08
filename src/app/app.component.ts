import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { PushNotificationSetupComponent } from './modules/notification/components/push-notification-setup/push-notification-setup.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, PushNotificationSetupComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
    <app-push-notification-setup></app-push-notification-setup>
    <footer class="app-footer py-3 border-top text-center text-muted small">
      <div class="container">
        <p class="mb-0">© 2025 Recitapp - Todos los derechos reservados</p>
      </div>
    </footer>
  `,
  styles: [`
    .main-content {
      min-height: calc(100vh - 140px);
      background-color: var(--dark-bg, #1a1a1a);
      padding-top: 0;
    }
    
    .app-footer {
      background-color: var(--dark-card, #2c2c34);
      color: var(--dark-text, #e0e0e0);
      border-top: 1px solid var(--dark-border, #404040);
    }
  `]
})
export class AppComponent {
  title = 'Recitapp';
}
