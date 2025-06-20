import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserRecommendationService, EventRecommendation, EnhancedEventRecommendation } from '../../../../services/user-recommendation.service';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-event-recommendations',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="recommendations-container">
      <div class="header">
        <h1>Recomendaciones de Eventos</h1>
        <p class="subtitle">Eventos personalizados basados en tus gustos musicales</p>
        <button (click)="refresh()" class="refresh-btn" [disabled]="isAnyLoading()">
          <i class="bi bi-arrow-clockwise me-2" *ngIf="!isAnyLoading()"></i>
          <i class="bi bi-hourglass-split me-2" *ngIf="isAnyLoading()"></i>
          {{ isAnyLoading() ? 'Cargando...' : 'Actualizar' }}
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="isAnyLoading() && !hasAnyRecommendations()" class="loading">
        <div class="spinner"></div>
        <p>Generando recomendaciones personalizadas...</p>
      </div>

      <!-- No Recommendations State -->
      <div *ngIf="!isAnyLoading() && !hasAnyRecommendations()" class="no-recommendations">
        <div class="empty-state">
          <div class="empty-icon"><i class="bi bi-emoji-smile" style="font-size: 4rem;"></i></div>
          <h3>No hay recomendaciones disponibles</h3>
          <p>Sigue algunos artistas para recibir recomendaciones personalizadas</p>
          <a routerLink="/artists" class="btn btn-primary">Explorar Artistas</a>
        </div>
      </div>

      <!-- Personalized Recommendations -->
      <div *ngIf="personalizedRecommendations.length > 0" class="recommendations-section">
        <div class="section-header">
          <h2>Recomendaciones Personalizadas</h2>
          <p class="section-description">Eventos seleccionados especialmente para ti</p>
        </div>

        <div class="events-grid">
          <div *ngFor="let event of personalizedRecommendations" class="event-card personalized">
            <div class="event-image">
              <img *ngIf="event.flyerImage && !hasImageError(event.id)" 
                   [src]="event.flyerImage" 
                   [alt]="event.name"
                   (error)="onImageError(event.id)">
              <div *ngIf="!event.flyerImage || hasImageError(event.id)" 
                   class="image-placeholder">
                <i class="bi bi-calendar-event"></i>
              </div>

            </div>
            
            <div class="event-content">
              <h3 class="event-title">{{ event.name }}</h3>
              <p class="event-description">{{ event.description }}</p>
              
              <div class="event-meta">
                <div class="meta-item">
                  <span class="icon"><i class="bi bi-calendar"></i></span>
                  <span>{{ formatDate(event.startDateTime) }}</span>
                </div>
                <div class="meta-item">
                  <span class="icon"><i class="bi bi-mic"></i></span>
                  <span>{{ event.mainArtistName || 'Varios Artistas' }}</span>
                </div>
                <div class="meta-item">
                  <span class="icon"><i class="bi bi-geo-alt"></i></span>
                  <span>{{ event.venueName || 'Recinto por confirmar' }}</span>
                </div>
              </div>

              <div class="recommendation-reason">
                <span class="reason-label">Por qué te recomendamos esto:</span>
                <span class="reason-text">{{ getRecommendationReason(event) }}</span>
              </div>

              <div class="event-actions">
                <a [routerLink]="['/events', event.id]" class="btn btn-primary">
                  Ver Detalles
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error Messages -->
      <div *ngIf="error.personalized" class="error-message">
        <h3><i class="bi bi-exclamation-triangle me-2"></i>Error en Recomendaciones Personalizadas</h3>
        <p>{{ error.personalized }}</p>
      </div>

    </div>
  `,
  styles: [`
    .recommendations-container {
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
      margin-bottom: 10px;
      font-size: 2.5rem;
      font-weight: bold;
    }

    .subtitle {
      color: #9CA3AF;
      font-size: 1.1rem;
      margin-bottom: 20px;
    }

    .refresh-btn {
      background: #22C55E;
      color: #1A1A1A;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 auto;
    }

    .refresh-btn:hover:not(:disabled) {
      background: #16A34A;
      transform: translateY(-2px);
    }

    .loading {
      text-align: center;
      padding: 60px 20px;
    }

    .spinner {
      border: 4px solid #2D2D2D;
      border-top: 4px solid #22C55E;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .no-recommendations {
      text-align: center;
      padding: 60px 20px;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 20px;
    }

    .recommendations-section {
      margin-bottom: 50px;
    }

    .section-header {
      margin-bottom: 30px;
      text-align: center;
    }

    .section-header h2 {
      color: #22C55E;
      margin-bottom: 10px;
      font-size: 1.8rem;
      font-weight: bold;
    }

    .section-description {
      color: #9CA3AF;
    }

    .events-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 25px;
    }

    .event-card {
      background: #2D2D2D;
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      transition: all 0.3s ease;
      border: 1px solid #374151;
    }

    .event-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 30px rgba(34, 197, 94, 0.2);
      border-color: #22C55E;
    }

    .event-image {
      position: relative;
      height: 200px;
      overflow: hidden;
    }

    .event-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .image-placeholder {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #2D2D2D, #1A1A1A);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .image-placeholder i {
      font-size: 3rem;
      color: #9CA3AF;
    }



    .event-content {
      padding: 20px;
    }

    .event-title {
      color: white;
      margin: 0 0 10px 0;
      font-size: 1.3rem;
      font-weight: bold;
    }

    .event-description {
      color: #9CA3AF;
      margin: 0 0 15px 0;
      line-height: 1.5;
    }

    .event-meta {
      margin-bottom: 15px;
    }

    .meta-item {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      font-size: 0.9rem;
      color: #D1D5DB;
    }

    .meta-item .icon {
      margin-right: 8px;
      width: 20px;
      color: #22C55E;
    }

    .recommendation-reason {
      background: #374151;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 0.9rem;
      border-left: 3px solid #22C55E;
    }

    .reason-label {
      font-weight: bold;
      color: #22C55E;
      display: block;
      margin-bottom: 5px;
    }

    .reason-text {
      color: #D1D5DB;
      font-style: italic;
    }

    .event-actions {
      display: flex;
      justify-content: center;
    }

    .btn {
      display: inline-block;
      padding: 10px 20px;
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
    }

    .btn-secondary {
      background: transparent;
      color: #22C55E;
      border: 2px solid #22C55E;
    }

    .btn-secondary:hover {
      background: #22C55E;
      color: #1A1A1A;
    }

    .error-message {
      background: #2D2D2D;
      border-radius: 10px;
      padding: 20px;
      margin: 20px 0;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      text-align: center;
      border-left: 5px solid #EF4444;
      color: white;
    }

    .error-message h3 {
      color: #EF4444;
    }

    .error-message p {
      color: #9CA3AF;
    }
  `]
})
export class EventRecommendationsComponent implements OnInit {
  personalizedRecommendations: EnhancedEventRecommendation[] = [];
  currentUser: User | null = null;

  loading = {
    personalized: false,
    followedArtists: false,
    similar: false
  };

  error = {
    personalized: '',
    followedArtists: '',
    similar: ''
  };

  // Track image errors to prevent infinite loops
  imageErrors = new Set<number>();

  constructor(
    private userRecommendationService: UserRecommendationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Suscribirse al usuario actual
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadAllRecommendations();
      } else {
        this.error.personalized = 'Debes iniciar sesión para ver recomendaciones personalizadas';
      }
    });
  }

  loadAllRecommendations(): void {
    this.loadPersonalizedRecommendations();
  }

  loadPersonalizedRecommendations(): void {
    if (!this.currentUser) {
      this.error.personalized = 'Usuario no autenticado';
      return;
    }

    this.loading.personalized = true;
    this.error.personalized = '';
    
    // Clear previous image errors
    this.imageErrors.clear();

    this.userRecommendationService.getEnhancedPersonalizedRecommendations(this.currentUser.id).subscribe({
      next: (recommendations) => {
        this.personalizedRecommendations = recommendations;
        this.loading.personalized = false;
      },
      error: (err) => {
        console.error('Error loading personalized recommendations:', err);
        this.error.personalized = 'Error al cargar recomendaciones personalizadas';
        this.loading.personalized = false;
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }



  refresh(): void {
    this.loadAllRecommendations();
  }

  hasAnyRecommendations(): boolean {
    return this.personalizedRecommendations.length > 0;
  }

  isAnyLoading(): boolean {
    return this.loading.personalized;
  }

  onImageError(eventId: number): void {
    this.imageErrors.add(eventId);
  }

  hasImageError(eventId: number): boolean {
    return this.imageErrors.has(eventId);
  }

  getRecommendationReason(event: EnhancedEventRecommendation): string {
    // Use the enhanced recommendation reason directly
    if (event.recommendationReason) {
      return event.recommendationReason;
    }
    
    // Fallback logic based on recommendation type and data
    switch (event.recommendationType) {
      case 'FOLLOWED_ARTIST':
        if (event.followedArtistNames.length > 0) {
          return event.followedArtistNames.length === 1 
            ? `Sigues al artista: ${event.followedArtistNames[0]}`
            : `Sigues a los artistas: ${event.followedArtistNames.join(', ')}`;
        }
        return event.mainArtistName ? `Sigues al artista: ${event.mainArtistName}` : 'Artista que sigues';
        
      case 'FOLLOWED_VENUE':
        if (event.followedVenueNames.length > 0) {
          return event.followedVenueNames.length === 1 
            ? `Sigues el recinto: ${event.followedVenueNames[0]}`
            : `Sigues los recintos: ${event.followedVenueNames.join(', ')}`;
        }
        return event.venueName ? `Sigues el recinto: ${event.venueName}` : 'Recinto que sigues';
        
      case 'SIMILAR_GENRE':
        if (event.matchingGenres.length > 0) {
          return `Basado en tus gustos: ${event.matchingGenres.join(', ')}`;
        }
        return 'Basado en tus gustos musicales y eventos similares';
        
      case 'POPULAR':
        return 'Evento popular recomendado para ti';
        
      default:
        return 'Recomendado especialmente para ti';
    }
  }
} 