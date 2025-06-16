import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ArtistService } from '../../services/artist.service';
import { UserService } from '../../../user/services/user.service';
import { ArtistDetailDTO } from '../../models/artist-detail';
import { FollowArtistButtonComponent } from '../../../user/components/follow-artist-button/follow-artist-button.component';
import { SessionService } from '../../../../core/services/session.service';
import { SimpleDropdownDirective } from '../../../../shared/directives/simple-dropdown.directive';
import { ModalService } from '../../../../shared/services/modal.service';

@Component({
  selector: 'app-artist-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FollowArtistButtonComponent, SimpleDropdownDirective],
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
  imageError = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private artistService: ArtistService,
    private userService: UserService,
    private sessionService: SessionService,
    private modalService: ModalService
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
    this.imageError = false; // Reset image error flag
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
    this.modalService.showConfirm({
      title: 'Confirmar Desactivación',
      message: `¿Estás seguro de que deseas desactivar a ${this.artist?.name}?`,
      type: 'warning',
      confirmText: 'Sí, desactivar',
      cancelText: 'Cancelar',
      details: [
        'El artista no aparecerá en búsquedas públicas',
        'No se podrán crear nuevos eventos con este artista',
        'Los eventos existentes no se verán afectados'
      ]
    }).subscribe(confirmed => {
      if (confirmed) {
        this.deactivateArtist();
      }
    });
  }

  deactivateArtist(): void {
    this.loading = true;
    this.error = '';

    this.artistService.deactivateArtist(this.artistId).subscribe({
      next: () => {
        this.loading = false;
        this.loadArtistDetails();
        this.modalService.success(`Artista "${this.artist?.name}" desactivado correctamente.`);
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al desactivar el artista';
        this.loading = false;
        this.modalService.error(this.error, 'Error de Desactivación');
      },
    });
  }

  activateArtist(): void {
    this.loading = true;
    this.error = '';

    // Si no existe activateArtist, podríamos usar updateArtist con active: true
    // Por ahora comentamos esta funcionalidad hasta verificar el servicio
    this.loading = false;
    this.modalService.info('Funcionalidad de activar artista en desarrollo', 'Función No Disponible');
    
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

  toggleArtistStatus(): void {
    if (this.artist?.active) {
      this.deactivateArtist();
    } else {
      this.activateArtist();
    }
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
    this.imageError = true;
  }
}
