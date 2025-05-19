// Main module for administrative features
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ReservationManagerComponent usa ngModel
// HttpClientModule ya debería estar disponible globalmente si los servicios lo usan con providedIn: 'root'
// Si no, import { HttpClientModule } from '@angular/common/http';

import { AdminRoutingModule } from './admin-routing.module';
// ReservationManagerComponent es standalone, se importará en el routing directamente.

@NgModule({
  imports: [
    CommonModule,
    FormsModule, // Aunque el componente es standalone, si el módulo es para organizar y potencialmente tener otros componentes no-standalone, podría ser útil.
    // HttpClientModule, // Solo si no es global y el servicio no es providedIn:root
    AdminRoutingModule
  ]
})
export class AdminModule { } 