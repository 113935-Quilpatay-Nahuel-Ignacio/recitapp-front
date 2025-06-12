import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ArtistService } from '../../services/artist.service';
import { Artist } from '../../models/artist';

@Component({
  selector: 'app-artist-management',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './artist-management.component.html',
  styleUrls: ['./artist-management.component.scss'],
})
export class ArtistManagementComponent implements OnInit {
  artists: Artist[] = [];
  filteredArtists: Artist[] = [];
  searchTerm: string = '';
  loading = false;
  error = '';
  success = '';
  showInactive = false;
  deleteModalVisible = false;
  artistToDelete: Artist | null = null;
  deactivateModalVisible = false;
  artistToDeactivate: Artist | null = null;

  constructor(private artistService: ArtistService) {}

  ngOnInit(): void {
    this.loadArtists();
  }

  loadArtists(): void {
    this.loading = true;
    this.artistService.getAllArtists(!this.showInactive).subscribe({
      next: (artists) => {
        this.artists = artists;
        this.filteredArtists = artists;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al cargar artistas';
        this.loading = false;
      },
    });
  }

  filterArtists(): void {
    if (!this.searchTerm.trim()) {
      this.filteredArtists = this.artists;
      return;
    }

    const term = this.searchTerm.toLowerCase().trim();
    this.filteredArtists = this.artists.filter((artist) =>
      artist.name.toLowerCase().includes(term)
    );
  }

  toggleActiveFilter(): void {
    this.loadArtists();
  }

  openDeactivateModal(artist: Artist): void {
    this.artistToDeactivate = artist;
    this.deactivateModalVisible = true;
  }

  closeDeactivateModal(): void {
    this.deactivateModalVisible = false;
    this.artistToDeactivate = null;
  }

  deactivateArtist(): void {
    if (!this.artistToDeactivate) return;

    this.loading = true;
    this.error = '';
    this.success = '';

    this.artistService.deactivateArtist(this.artistToDeactivate.id).subscribe({
      next: (updatedArtist) => {
        this.success = `Artista "${this.artistToDeactivate?.name}" desactivado correctamente`;
        this.loading = false;
        this.closeDeactivateModal();
        this.loadArtists();
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al desactivar el artista';
        this.loading = false;
        this.closeDeactivateModal();
      },
    });
  }

  openDeleteModal(artist: Artist): void {
    this.artistToDelete = artist;
    this.deleteModalVisible = true;
  }

  closeDeleteModal(): void {
    this.deleteModalVisible = false;
    this.artistToDelete = null;
  }

  deleteArtist(): void {
    if (!this.artistToDelete) return;

    this.loading = true;
    this.error = '';
    this.success = '';

    this.artistService.deleteArtist(this.artistToDelete.id).subscribe({
      next: () => {
        this.success = `Artista "${this.artistToDelete?.name}" eliminado permanentemente`;
        this.loading = false;
        this.closeDeleteModal();
        this.loadArtists();
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al eliminar el artista';
        this.loading = false;
        this.closeDeleteModal();
      },
    });
  }
}
