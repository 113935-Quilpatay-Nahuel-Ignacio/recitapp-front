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

@Component({
  selector: 'app-artist-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, HttpClientModule],
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

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.artistId = +id;
        this.isEditMode = true;
        this.loadArtist(this.artistId);
      }
    });
  }

  initForm(): void {
    this.artistForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      biography: [''],
      profileImage: [''],
      spotifyUrl: [''],
      youtubeUrl: [''],
      soundcloudUrl: [''],
      instagramUrl: [''],
      bandcampUrl: [''],
      active: [true],
      genreIds: [[]],
    });
  }

  loadGenres(): void {
    this.loading.genres = true;
    this.error.genres = '';

    this.artistService.getAllGenres().subscribe({
      next: (genres) => {
        this.genres = genres;
        this.loading.genres = false;
      },
      error: (err) => {
        this.error.genres = 'Error al cargar géneros musicales';
        console.error('Error loading genres:', err);
        this.loading.genres = false;
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
    this.error.submit = err.error?.message || 'Error al guardar el artista';
    console.error('Error saving artist:', err);
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
    const file = event.target.files[0];
    if (file) {
      // Here you would typically upload the file to your server
      // For this example, we'll just create a data URL for preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.artistForm.patchValue({
          profileImage: this.imagePreview,
        });
      };
      reader.readAsDataURL(file);
    }
  }

  onImageRemove(): void {
    this.imagePreview = null;
    this.artistForm.patchValue({
      profileImage: '',
    });
  }

  validateUrl(control: any): { [key: string]: any } | null {
    const value = control.value;
    if (!value) {
      return null;
    }

    const urlPattern =
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    return urlPattern.test(value) ? null : { invalidUrl: true };
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
