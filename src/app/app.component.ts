import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="container-fluid py-4">
      <router-outlet></router-outlet>
    </div>
    <footer class="bg-light py-3 border-top text-center text-muted small">
      <div class="container">
        <p class="mb-0">© 2025 Recitapp - Todos los derechos reservados</p>
      </div>
    </footer>
  `,
})
export class AppComponent {
  title = 'Recitapp';
}
