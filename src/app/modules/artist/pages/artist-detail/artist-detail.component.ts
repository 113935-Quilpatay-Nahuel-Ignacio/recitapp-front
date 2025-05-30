import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ArtistService } from '../../services/artist.service';
import { UserService } from '../../../user/services/user.service';
import { ArtistDetailDTO } from '../../models/artist-detail';
import { FollowArtistButtonComponent } from '../../../user/components/follow-artist-button/follow-artist-button.component';

@Component({
  selector: 'app-artist-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FollowArtistButtonComponent],
  templateUrl: './artist-detail.component.html',
  styleUrls: ['./artist-detail.component.scss'],
})
export class ArtistDetailComponent implements OnInit {
  artistId!: number;
  artist: ArtistDetailDTO | null = null;
  loading = false;
  error = '';
  userId = 4; // Hardcoded to 4 as per request
  isAdmin = false; // Set to false for regular users - change to true when testing admin features

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private artistService: ArtistService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.artistId = +id;
        this.loadArtistDetails();
      }
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

  hasExternalLinks(): boolean {
    return !!(
      this.artist?.spotifyUrl ||
      this.artist?.youtubeUrl ||
      this.artist?.soundcloudUrl ||
      this.artist?.instagramUrl ||
      this.artist?.bandcampUrl
    );
  }
}
