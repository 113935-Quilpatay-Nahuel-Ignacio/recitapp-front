import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <div class="header">
        <h1>🎭 RecitApp Dashboard</h1>
        <p class="subtitle">Bienvenido a tu panel de control</p>
      </div>

      <div class="features-grid">
        
        <!-- Recomendaciones de Eventos -->
        <div class="feature-card">
          <div class="card-icon">🎯</div>
          <div class="card-content">
            <h3>Recomendaciones de Eventos</h3>
            <p>Descubre eventos personalizados basados en tus artistas favoritos</p>
            <a routerLink="/user/recommendations" class="btn btn-primary">
              Ver Recomendaciones
            </a>
          </div>
        </div>

        <!-- Calendario de Eventos -->
        <div class="feature-card">
          <div class="card-icon">📅</div>
          <div class="card-content">
            <h3>Calendario de Eventos</h3>
            <p>Explora eventos próximos en una vista de calendario mensual</p>
            <a routerLink="/events/calendar" class="btn btn-primary">
              Ver Calendario
            </a>
          </div>
        </div>

        <!-- Gestión de Entradas Vencidas (Solo Admin) -->
        <div class="feature-card admin-only">
          <div class="card-icon">🎫</div>
          <div class="card-content">
            <h3>Gestión de Entradas Vencidas</h3>
            <p>Administrar entradas de eventos pasados (Solo Administradores)</p>
            <a routerLink="/admin/expired-tickets" class="btn btn-danger">
              Gestionar Entradas
            </a>
          </div>
        </div>

        <!-- Enlaces Rápidos -->
        <div class="feature-card">
          <div class="card-icon">🔗</div>
          <div class="card-content">
            <h3>Enlaces Rápidos</h3>
            <div class="quick-links">
              <a routerLink="/events" class="quick-link">📋 Todos los Eventos</a>
              <a routerLink="/artists" class="quick-link">🎤 Artistas</a>
              <a routerLink="/user/profile" class="quick-link">👤 Mi Perfil</a>
              <a routerLink="/tickets" class="quick-link">🎟️ Mis Entradas</a>
            </div>
          </div>
        </div>

      </div>

      <div class="info-section">
        <h2>🚀 Nuevas Funcionalidades</h2>
        <div class="info-cards">
          <div class="info-card">
            <h4>✨ Recomendaciones Inteligentes</h4>
            <p>Algoritmo que combina tus artistas seguidos con eventos similares para sugerirte los mejores eventos.</p>
          </div>
          <div class="info-card">
            <h4>📆 Vista de Calendario</h4>
            <p>Navega fácilmente por los eventos del mes con una interfaz intuitiva y moderna.</p>
          </div>
          <div class="info-card">
            <h4>⚡ Gestión Administrativa</h4>
            <p>Herramientas para administradores para gestionar entradas vencidas de forma eficiente.</p>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #1A1A1A;
      min-height: 100vh;
      color: white;
    }

    .header {
      text-align: center;
      margin-bottom: 40px;
    }

    .header h1 {
      color: #22C55E;
      font-size: 3rem;
      margin-bottom: 10px;
      font-weight: bold;
    }

    .subtitle {
      color: #9CA3AF;
      font-size: 1.2rem;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 25px;
      margin-bottom: 40px;
    }

    .feature-card {
      background: #2D2D2D;
      border-radius: 15px;
      padding: 30px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      border: 2px solid #374151;
    }

    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 30px rgba(34, 197, 94, 0.2);
      border-color: #22C55E;
    }

    .feature-card.admin-only {
      border-color: #EF4444;
      background: #2D2D2D;
    }

    .card-icon {
      font-size: 3rem;
      text-align: center;
      margin-bottom: 20px;
    }

    .card-content h3 {
      color: white;
      margin-bottom: 15px;
      font-size: 1.4rem;
      font-weight: bold;
    }

    .card-content p {
      color: #9CA3AF;
      margin-bottom: 20px;
      line-height: 1.6;
    }

    .btn {
      display: inline-block;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      text-align: center;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
    }

    .btn-primary {
      background: #22C55E;
      color: #1A1A1A;
    }

    .btn-primary:hover {
      background: #16A34A;
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(34, 197, 94, 0.4);
    }

    .btn-danger {
      background: #EF4444;
      color: white;
    }

    .btn-danger:hover {
      background: #DC2626;
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
    }

    .quick-links {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .quick-link {
      color: #22C55E;
      text-decoration: none;
      padding: 8px 12px;
      border-radius: 5px;
      transition: all 0.3s ease;
    }

    .quick-link:hover {
      background-color: rgba(34, 197, 94, 0.1);
      color: #16A34A;
    }

    .info-section {
      margin-top: 50px;
    }

    .info-section h2 {
      color: #22C55E;
      text-align: center;
      margin-bottom: 30px;
      font-size: 2rem;
      font-weight: bold;
    }

    .info-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .info-card {
      background: #2D2D2D;
      padding: 20px;
      border-radius: 10px;
      border-left: 4px solid #22C55E;
      border: 1px solid #374151;
    }

    .info-card h4 {
      color: white;
      margin-bottom: 10px;
      font-weight: bold;
    }

    .info-card p {
      color: #9CA3AF;
      line-height: 1.5;
      margin: 0;
    }

    @media (max-width: 768px) {
      .features-grid {
        grid-template-columns: 1fr;
      }
      
      .header h1 {
        font-size: 2rem;
      }
      
      .info-cards {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent {
  constructor() {}
} 