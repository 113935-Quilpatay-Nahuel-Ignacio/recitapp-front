import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MusicGenreService } from '../../services/music-genre.service';
import { MusicGenre } from '../../models/music-genre';

@Component({
  selector: 'app-music-genre-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
  ],
  templateUrl: './music-genre-admin.component.html',
})
export class MusicGenreAdminComponent implements OnInit {
  genres: MusicGenre[] = [];
  genreForm!: FormGroup;
  searchTerm: string = '';

  selectedGenre: MusicGenre | null = null;
  isEditMode = false;

  loading = {
    list: false,
    form: false,
  };

  error = {
    list: '',
    form: '',
  };

  success = '';

  constructor(
    private fb: FormBuilder,
    private genreService: MusicGenreService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadGenres();
  }

  initForm(): void {
    this.genreForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      description: [''],
    });
  }

  loadGenres(): void {
    this.loading.list = true;
    this.error.list = '';

    // If searching
    if (this.searchTerm) {
      this.genreService.searchGenresByName(this.searchTerm).subscribe({
        next: this.handleGenresResponse.bind(this),
        error: this.handleListError.bind(this),
      });
    }
    // Default load all genres
    else {
      this.genreService.getAllGenres().subscribe({
        next: this.handleGenresResponse.bind(this),
        error: this.handleListError.bind(this),
      });
    }
  }

  handleGenresResponse(genres: MusicGenre[]): void {
    this.genres = genres;
    this.loading.list = false;
  }

  handleListError(err: any): void {
    this.error.list = 'Error al cargar los géneros musicales';
    console.error('Error loading genres:', err);
    this.loading.list = false;
  }

  onSearch(): void {
    this.loadGenres();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.loadGenres();
  }

  selectGenre(genre: MusicGenre): void {
    this.selectedGenre = genre;
    this.isEditMode = true;

    this.genreForm.patchValue({
      name: genre.name,
      description: genre.description,
    });
  }

  newGenre(): void {
    this.selectedGenre = null;
    this.isEditMode = false;
    this.genreForm.reset();
  }

  saveGenre(): void {
    if (this.genreForm.invalid) {
      this.markFormGroupTouched(this.genreForm);
      return;
    }

    this.loading.form = true;
    this.error.form = '';
    this.success = '';

    const genreData: MusicGenre = this.genreForm.value;

    if (this.isEditMode && this.selectedGenre) {
      this.genreService
        .updateGenre(this.selectedGenre.id, genreData)
        .subscribe({
          next: this.handleSuccess.bind(this, 'actualizado'),
          error: this.handleFormError.bind(this),
        });
    } else {
      this.genreService.createGenre(genreData).subscribe({
        next: this.handleSuccess.bind(this, 'creado'),
        error: this.handleFormError.bind(this),
      });
    }
  }

  deleteGenre(genre: MusicGenre): void {
    if (
      confirm(`¿Estás seguro de que deseas eliminar el género ${genre.name}?`)
    ) {
      this.genreService.deleteGenre(genre.id).subscribe({
        next: () => {
          this.success = `Género ${genre.name} eliminado correctamente`;
          this.loadGenres();

          if (this.selectedGenre && this.selectedGenre.id === genre.id) {
            this.newGenre();
          }

          setTimeout(() => {
            this.success = '';
          }, 3000);
        },
        error: (err) => {
          this.error.list = err.error?.message || 'Error al eliminar el género';
          console.error('Error deleting genre:', err);
        },
      });
    }
  }

  handleSuccess(action: string, genre: MusicGenre): void {
    this.success = `Género ${genre.name} ${action} correctamente`;
    this.loading.form = false;
    this.loadGenres();

    if (!this.isEditMode) {
      this.genreForm.reset();
    }

    setTimeout(() => {
      this.success = '';
    }, 3000);
  }

  handleFormError(err: any): void {
    this.error.form = err.error?.message || 'Error al guardar el género';
    console.error('Error saving genre:', err);
    this.loading.form = false;
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  cancelEdit(): void {
    this.newGenre();
  }
}
