import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ArtistService } from '../../services/artist.service';
import { UserService } from '../../../user/services/user.service';
import { ArtistDetailDTO } from '../../models/artist-detail';
import { FollowArtistButtonComponent } from '../../../user/components/follow-artist-button/follow-artist-button.component';
import { SessionService } from '../../../../core/services/session.service';
import { DropdownDirective } from '../../../../shared/directives/dropdown.directive';

@Component({
  selector: 'app-artist-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FollowArtistButtonComponent, DropdownDirective],
  templateUrl: './artist-detail.component.html',
  styleUrls: ['./artist-detail.component.scss'],
})
export class ArtistDetailComponent implements OnInit {
  artistId!: number;
  artist: ArtistDetailDTO | null = null;
  loading = false;
  error = '';
  userId: number | null = null;
  isAdmin = false; // Set to false for regular users - change to true when testing admin features
  defaultImage = 'assets/images/default-artist-avatar.svg'; // Default artist avatar

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private artistService: ArtistService,
    private userService: UserService,
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    this.userId = this.sessionService.getCurrentUserId();
    const currentUser = this.sessionService.getCurrentUser();
    this.isAdmin = currentUser?.role?.name === 'ADMIN';
    
    this.route.params.subscribe((params) => {
      this.artistId = +params['id'];
      this.loadArtistDetails();
    });
  }

  loadArtistDetails(): void {
    this.loading = true;
    this.artistService.getArtistDetail(this.artistId).subscribe({
      next: (artist) => {
        this.artist = artist;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al cargar datos del artista';
        this.loading = false;
      },
    });
  }

  onFollowStatusChanged(following: boolean): void {
    this.loadArtistDetails();
  }

  confirmDeactivate(): void {
    if (
      confirm(`¿Estás seguro de que deseas desactivar a ${this.artist?.name}?`)
    ) {
      this.deactivateArtist();
    }
  }

  deactivateArtist(): void {
    this.loading = true;
    this.error = '';

    this.artistService.deactivateArtist(this.artistId).subscribe({
      next: () => {
        this.loading = false;
        this.loadArtistDetails();
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al desactivar el artista';
        this.loading = false;
      },
    });
  }

  activateArtist(): void {
    this.loading = true;
    this.error = '';

    // Si no existe activateArtist, podríamos usar updateArtist con active: true
    // Por ahora comentamos esta funcionalidad hasta verificar el servicio
    this.loading = false;
    alert('Funcionalidad de activar artista en desarrollo');
    
    // this.artistService.activateArtist(this.artistId).subscribe({
    //   next: () => {
    //     this.loading = false;
    //     this.loadArtistDetails();
    //   },
    //   error: (err: any) => {
    //     this.error = err.error?.message || 'Error al activar el artista';
    //     this.loading = false;
    //   },
    // });
  }

  hasExternalLinks(): boolean {
    return !!(
      this.artist?.spotifyUrl ||
      this.artist?.youtubeUrl ||
      this.artist?.soundcloudUrl ||
      this.artist?.instagramUrl ||
      this.artist?.bandcampUrl
    );
  }

  onImageError(event: any): void {
    event.target.src = this.defaultImage;
  }
}
