// src/app/modules/artist/pages/artist-form/artist-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ArtistService } from '../../services/artist.service';
import { Artist } from '../../models/artist';
import { MusicGenre } from '../../models/music-genre';
import { GenreNameFormatterPipe } from '../../../../shared/pipes/genre-name-formatter.pipe';
import { FileUploadComponent } from '../../../../shared/components/file-upload/file-upload.component';

@Component({
  selector: 'app-artist-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, HttpClientModule, GenreNameFormatterPipe, FileUploadComponent],
  templateUrl: './artist-form.component.html',
  styleUrls: ['./artist-form.component.scss'],
})
export class ArtistFormComponent implements OnInit {
  artistForm!: FormGroup;
  artistId: number | null = null;
  isEditMode = false;
  genres: MusicGenre[] = [];

  loading = {
    form: false,
    submit: false,
    genres: false,
  };

  error = {
    form: '',
    submit: '',
    genres: '',
  };

  success = false;
  defaultImage = 'assets/images/default-artist.jpg';
  imagePreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private artistService: ArtistService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadGenres();

    // Check if we're in edit mode or create mode
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id && id !== 'new') {
        this.artistId = +id;
        this.isEditMode = true;
        this.loadArtist(this.artistId);
      } else {
        // We're in create mode
        this.isEditMode = false;
        this.artistId = null;
        // Initialize form with default values for creation
        this.artistForm.patchValue({
          active: true,
          genreIds: []
        });
      }
    });
  }

  initForm(): void {
    this.artistForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      biography: ['', [Validators.maxLength(2000)]],
      profileImage: [''],
      spotifyUrl: ['', [this.validateUrl]],
      youtubeUrl: ['', [this.validateUrl]],
      soundcloudUrl: ['', [this.validateUrl]],
      instagramUrl: ['', [this.validateUrl]],
      bandcampUrl: ['', [this.validateUrl]],
      active: [true],
      genreIds: [[]],
    });
  }

  loadGenres(): void {
    this.loading.genres = true;
    this.error.genres = '';

    // Try to use the MusicGenreService first, fall back to ArtistService if needed
    this.artistService.getAllGenres().subscribe({
      next: (genres) => {
        this.genres = genres;
        this.loading.genres = false;
      },
      error: (err) => {
        console.error('Error loading genres:', err);
        
        // Provide a user-friendly error message
        if (err.status === 404) {
          this.error.genres = 'No se encontraron géneros musicales. Contacta al administrador.';
        } else if (err.status === 500) {
          this.error.genres = 'Error del servidor al cargar géneros musicales.';
        } else {
          this.error.genres = 'Error al cargar géneros musicales. Inténtalo de nuevo.';
        }
        
        this.loading.genres = false;
        
        // Set empty genres array as fallback
        this.genres = [];
      },
    });
  }

  loadArtist(id: number): void {
    this.loading.form = true;
    this.error.form = '';

    this.artistService.getArtistDetail(id).subscribe({
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
          active: artist.active,
          genreIds: artist.genres.map((g) => g.id),
        });

        if (artist.profileImage) {
          this.imagePreview = artist.profileImage;
        }

        this.loading.form = false;
      },
      error: (err) => {
        this.error.form = 'Error al cargar los datos del artista';
        console.error('Error loading artist:', err);
        this.loading.form = false;
      },
    });
  }

  onSubmit(): void {
    if (this.artistForm.invalid) {
      this.markFormGroupTouched(this.artistForm);
      return;
    }

    this.loading.submit = true;
    this.error.submit = '';
    this.success = false;

    const artistData: Artist = this.artistForm.value;

    if (this.isEditMode && this.artistId) {
      this.artistService.updateArtist(this.artistId, artistData).subscribe({
        next: this.handleSuccess.bind(this),
        error: this.handleError.bind(this),
      });
    } else {
      this.artistService.createArtist(artistData).subscribe({
        next: this.handleSuccess.bind(this),
        error: this.handleError.bind(this),
      });
    }
  }

  handleSuccess(artist: Artist): void {
    this.success = true;
    this.loading.submit = false;

    setTimeout(() => {
      this.router.navigate(['/artists', artist.id]);
    }, 1500);
  }

  handleError(err: any): void {
    console.error('Error saving artist:', err);
    
    // Provide specific error messages based on the error type
    if (err.status === 400) {
      this.error.submit = err.error?.message || 'Datos inválidos. Verifica la información ingresada.';
    } else if (err.status === 409) {
      this.error.submit = 'Ya existe un artista con este nombre.';
    } else if (err.status === 500) {
      this.error.submit = 'Error del servidor. Inténtalo de nuevo más tarde.';
    } else if (err.status === 0) {
      this.error.submit = 'Error de conexión. Verifica tu conexión a internet.';
    } else {
      this.error.submit = err.error?.message || 'Error al guardar el artista. Inténtalo de nuevo.';
    }
    
    this.loading.submit = false;
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  onImagePreview(event: any): void {
    // No longer needed for URL-based images
  }

  onImageRemove(): void {
    // No longer needed for URL-based images
  }

  // Métodos para manejar errores y carga de imágenes URL
  onImageError(event: any): void {
    // Si hay error cargando la imagen URL, ocultar la vista previa
    event.target.style.display = 'none';
  }

  onImageLoad(event: any): void {
    // Si la imagen URL se carga correctamente, mostrarla
    event.target.style.display = 'block';
  }

  // Métodos para manejar la subida de archivos
  onProfileImageUploaded(fileUrl: string): void {
    this.artistForm.patchValue({ profileImage: fileUrl });
    this.imagePreview = fileUrl;
    console.log('Profile image uploaded:', fileUrl);
  }

  onProfileImageRemoved(): void {
    this.artistForm.patchValue({ profileImage: null });
    this.imagePreview = null;
    console.log('Profile image removed');
  }

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

  // Additional method for platform-specific URL validation (could be used in the future)
  validatePlatformUrl(platform: string) {
    return (control: any): { [key: string]: any } | null => {
    const value = control.value;
    if (!value) {
      return null;
    }

      let platformPattern: RegExp;
      switch (platform) {
        case 'spotify':
          platformPattern = /^https?:\/\/(open\.)?spotify\.com\/.+$/;
          break;
        case 'youtube':
          platformPattern = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+$/;
          break;
        case 'soundcloud':
          platformPattern = /^https?:\/\/(www\.)?soundcloud\.com\/.+$/;
          break;
        case 'instagram':
          platformPattern = /^https?:\/\/(www\.)?instagram\.com\/.+$/;
          break;
        case 'bandcamp':
          platformPattern = /^https?:\/\/.*\.?bandcamp\.com\/.+$/;
          break;
        default:
          return this.validateUrl(control);
      }

      return platformPattern.test(value) ? null : { invalidPlatformUrl: true };
    };
  }

  updateGenres(event: any, genreId: number): void {
    const genreIds = this.artistForm.get('genreIds')?.value || [];

    if (event.target.checked) {
      // Add genre to the list if not already present
      if (!genreIds.includes(genreId)) {
        this.artistForm.patchValue({
          genreIds: [...genreIds, genreId],
        });
      }
    } else {
      // Remove genre from the list
      this.artistForm.patchValue({
        genreIds: genreIds.filter((id: number) => id !== genreId),
      });
    }
  }

  onCancel(): void {
    if (this.isEditMode && this.artistId) {
      this.router.navigate(['/artists', this.artistId]);
    } else {
      this.router.navigate(['/artists']);
    }
  }
}
