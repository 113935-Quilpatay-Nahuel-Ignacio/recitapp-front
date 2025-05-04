import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  // Aquí puedes añadir lógica para controlar si el usuario está autenticado, su rol, etc.
  isLoggedIn = true; // Ejemplo, debería conectarse a tu servicio de autenticación
  isAdmin = true; // Ejemplo, debería verificar el rol del usuario

  constructor() {}

  logout(): void {
    // Implementar la lógica de cierre de sesión
    console.log('Cerrando sesión...');
    // Ejemplo: this.authService.logout();
  }
}
