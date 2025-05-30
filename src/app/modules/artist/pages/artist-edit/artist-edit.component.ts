import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ArtistService } from '../../services/artist.service';
import { Artist } from '../../models/artist';

@Component({
  selector: 'app-artist-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './artist-edit.component.html',
  styleUrls: ['./artist-edit.component.scss'],
})
export class ArtistEditComponent implements OnInit {
  artistForm!: FormGroup;
  artistId!: number;
  loading = false;
  submitted = false;
  error = '';
  success = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private artistService: ArtistService
  ) {}

  ngOnInit(): void {
    this.artistId = +this.route.snapshot.paramMap.get('id')!;

    this.artistForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      biography: ['', [Validators.maxLength(2000)]],
      profileImage: [''],
      spotifyUrl: ['', [this.validateUrl]],
      youtubeUrl: ['', [this.validateUrl]],
      soundcloudUrl: ['', [this.validateUrl]],
      instagramUrl: ['', [this.validateUrl]],
      bandcampUrl: ['', [this.validateUrl]],
    });

    this.loadArtistDetails();
  }

  // Convenience getter for easy access to form fields
  get f() {
    return this.artistForm.controls;
  }

  loadArtistDetails(): void {
    this.loading = true;
    this.artistService.getArtistById(this.artistId).subscribe({
      next: (artist) => {
        this.artistForm.patchValue({
          name: artist.name,
          biography: artist.biography,
          profileImage: artist.profileImage,
          spotifyUrl: artist.spotifyUrl,
          youtubeUrl: artist.youtubeUrl,
          soundcloudUrl: artist.soundcloudUrl,
          instagramUrl: artist.instagramUrl,
          bandcampUrl: artist.bandcampUrl,
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

    // Stop here if form is invalid
    if (this.artistForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    const artistData: Artist = {
      id: this.artistId,
      name: this.f['name'].value,
      biography: this.f['biography'].value,
      profileImage: this.f['profileImage'].value,
      spotifyUrl: this.f['spotifyUrl'].value,
      youtubeUrl: this.f['youtubeUrl'].value,
      soundcloudUrl: this.f['soundcloudUrl'].value,
      instagramUrl: this.f['instagramUrl'].value,
      bandcampUrl: this.f['bandcampUrl'].value,
    };

    this.artistService.updateArtist(this.artistId, artistData).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;

        // Navigate back to artist details after a short delay
        setTimeout(() => {
          this.router.navigate(['/artists', this.artistId]);
        }, 2000);
      },
      error: (err) => {
        console.error('Error updating artist:', err);
        
        // Provide specific error messages based on the error type
        if (err.status === 400) {
          this.error = err.error?.message || 'Datos inválidos. Verifica la información ingresada.';
        } else if (err.status === 409) {
          this.error = 'Ya existe un artista con este nombre.';
        } else if (err.status === 404) {
          this.error = 'Artista no encontrado.';
        } else if (err.status === 500) {
          this.error = 'Error del servidor. Inténtalo de nuevo más tarde.';
        } else if (err.status === 0) {
          this.error = 'Error de conexión. Verifica tu conexión a internet.';
        } else {
          this.error = err.error?.message || 'Error al actualizar el artista. Inténtalo de nuevo.';
        }
        
        this.loading = false;
      },
    });
  }

  // URL validation method
  validateUrl(control: any): { [key: string]: any } | null {
    const value = control.value;
    if (!value) {
      return null; // Empty values are allowed
    }

    // Basic URL pattern validation
    const urlPattern = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
    
    if (!urlPattern.test(value)) {
      return { invalidUrl: true };
    }

    return null;
  }
}
