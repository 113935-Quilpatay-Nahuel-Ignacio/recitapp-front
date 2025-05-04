import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ArtistService } from '../../services/artist.service';
import { Artist } from '../../models/artist';

@Component({
  selector: 'app-artist-platforms',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './artist-platforms.component.html',
  styleUrls: ['./artist-platforms.component.scss'],
})
export class ArtistPlatformsComponent implements OnInit {
  artistId!: number;
  artist: Artist | null = null;
  platformsForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  success = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private artistService: ArtistService
  ) {}

  ngOnInit(): void {
    this.artistId = +this.route.snapshot.paramMap.get('id')!;

    this.platformsForm = this.formBuilder.group({
      spotifyUrl: [''],
      youtubeUrl: [''],
      soundcloudUrl: [''],
      instagramUrl: [''],
      bandcampUrl: [''],
    });

    this.loadArtistDetails();
  }

  get f() {
    return this.platformsForm.controls;
  }

  loadArtistDetails(): void {
    this.loading = true;
    this.artistService.getArtistById(this.artistId).subscribe({
      next: (artist) => {
        this.artist = artist;

        // Populate form with current platform links
        this.platformsForm.patchValue({
          spotifyUrl: artist.spotifyUrl || '',
          youtubeUrl: artist.youtubeUrl || '',
          soundcloudUrl: artist.soundcloudUrl || '',
          instagramUrl: artist.instagramUrl || '',
          bandcampUrl: artist.bandcampUrl || '',
        });

        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al cargar datos del artista';
        this.loading = false;
      },
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.loading = true;
    this.error = '';
    this.success = false;

    const platformData = {
      spotifyUrl: this.f['spotifyUrl'].value,
      youtubeUrl: this.f['youtubeUrl'].value,
      soundcloudUrl: this.f['soundcloudUrl'].value,
      instagramUrl: this.f['instagramUrl'].value,
      bandcampUrl: this.f['bandcampUrl'].value,
    };

    this.artistService
      .updateArtistPlatforms(this.artistId, platformData)
      .subscribe({
        next: (updatedArtist) => {
          this.artist = updatedArtist;
          this.success = true;
          this.loading = false;

          setTimeout(() => {
            this.success = false;
          }, 3000);
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al actualizar plataformas';
          this.loading = false;
        },
      });
  }

  validateUrl(url: string): boolean {
    if (!url) return true; // Empty URL is valid

    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }

  getUrlError(controlName: string): string {
    const control = this.f[controlName];
    if (control && control.value && !this.validateUrl(control.value)) {
      return 'URL inválida';
    }
    return '';
  }
}
