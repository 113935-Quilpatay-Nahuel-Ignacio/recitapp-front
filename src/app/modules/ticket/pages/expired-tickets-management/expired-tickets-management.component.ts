import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-expired-tickets-management',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>🎫 Gestión de Entradas Vencidas</h1>
      <p>Panel administrativo para gestionar entradas de eventos pasados</p>
      
      <div class="card">
        <h2>Funcionalidad en desarrollo</h2>
        <p>Esta funcionalidad permite cambiar el estado de entradas de VENDIDA a VENCIDA para eventos que ya pasaron.</p>
        <p>Solo disponible para usuarios con rol ADMIN.</p>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .card {
      background: white;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin: 20px 0;
    }
    
    h1 {
      color: #2c3e50;
      text-align: center;
    }
    
    h2 {
      color: #34495e;
    }
  `]
})
export class ExpiredTicketsManagementComponent implements OnInit {
  
  constructor() {}

  ngOnInit() {
    console.log('ExpiredTicketsManagementComponent initialized');
  }
} 