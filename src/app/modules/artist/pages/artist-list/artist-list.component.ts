import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ArtistService } from '../../services/artist.service';
import { Artist } from '../../models/artist';
import { MusicGenre } from '../../models/music-genre';
import { ArtistCardComponent } from '../../components/artist-card/artist-card.component';
import { HttpClientModule } from '@angular/common/http';
import { SessionService } from '../../../../core/services/session.service';
import { SimpleDropdownDirective } from '../../../../shared/directives/simple-dropdown.directive';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ListFiltersComponent } from '../../../../shared/components/list-filters/list-filters.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-artist-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ArtistCardComponent,
    HttpClientModule,
    SimpleDropdownDirective,
    PageHeaderComponent,
    ListFiltersComponent,
    PaginationComponent,
  ],
  templateUrl: './artist-list.component.html',
  styleUrls: ['./artist-list.component.scss'],
})
export class ArtistListComponent implements OnInit {
  artists: Artist[] = [];
  genres: MusicGenre[] = [];
  searchTerm: string = '';
  selectedGenreId: number | null = null;
  showInactive: boolean = false;
  loading: boolean = false;
  error: string = '';
  isAdmin: boolean = false;
  isModerador: boolean = false;
  isEventRegistrar: boolean = false;
  isComprador: boolean = false;
  currentUser: any = null;

  // Exponer Math para el template
  Math = Math;

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 12;
  totalItems: number = 0;

  constructor(
    private artistService: ArtistService, 
    private router: Router,
    private sessionService: SessionService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // Only load data if running in browser (not during server-side rendering)
    if (isPlatformBrowser(this.platformId)) {
      this.initializeUserRole();
      // Check if user is admin
      const currentUser = this.sessionService.getCurrentUser();
      this.isAdmin = currentUser?.role?.name === 'ADMIN';
      
      this.loadGenres();
      this.loadArtists();
    }
  }

  private initializeUserRole(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser && this.currentUser.role) {
      const userRole = this.currentUser.role.name;
      this.isAdmin = userRole === 'ADMIN';
      this.isModerador = userRole === 'MODERADOR';
      this.isEventRegistrar = userRole === 'REGISTRADOR_EVENTO';
      this.isComprador = userRole === 'COMPRADOR';
    }
  }

  loadGenres(): void {
    this.artistService.getAllGenres().subscribe({
      next: (genres) => {
        this.genres = genres;
      },
      error: (err) => {
        this.error = 'Error al cargar géneros musicales';
        console.error('Error loading genres:', err);
      },
    });
  }

  /**
   * Formatear nombre de género para mostrar de forma legible
   */
  formatGenreName(genreName: string): string {
    return genreName
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  loadArtists(): void {
    this.loading = true;
    this.error = '';

    // If searching by name
    if (this.searchTerm) {
      this.artistService
        .searchArtistsByName(this.searchTerm, !this.showInactive)
        .subscribe({
          next: this.handleArtistsResponse.bind(this),
          error: this.handleError.bind(this),
        });
    }
    // If filtering by genre
    else if (this.selectedGenreId) {
      this.artistService
        .getArtistsByGenre(this.selectedGenreId, !this.showInactive)
        .subscribe({
          next: this.handleArtistsResponse.bind(this),
          error: this.handleError.bind(this),
        });
    }
    // Default load all artists
    else {
      this.artistService.getAllArtists(!this.showInactive).subscribe({
        next: this.handleArtistsResponse.bind(this),
        error: this.handleError.bind(this),
      });
    }
  }

  handleArtistsResponse(artists: Artist[]): void {
    this.artists = artists;
    this.totalItems = artists.length;
    this.loading = false;
  }

  handleError(err: any): void {
    this.error = 'Error al cargar artistas';
    console.error('Error loading artists:', err);
    this.loading = false;
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadArtists();
  }

  onGenreChange(): void {
    this.currentPage = 1;
    this.searchTerm = '';
    this.loadArtists();
  }

  toggleShowInactive(): void {
    this.currentPage = 1;
    this.loadArtists();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedGenreId = null;
    this.currentPage = 1;
    this.loadArtists();
  }

  get paginatedArtists(): Artist[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.artists.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  onPageSizeChange(size: number): void {
    this.itemsPerPage = size;
    this.currentPage = 1; // Reset to first page
    // No need to reload data since we're using client-side pagination
  }

  navigateToArtist(artistId: number): void {
    this.router.navigate(['/artists', artistId]);
  }
}
