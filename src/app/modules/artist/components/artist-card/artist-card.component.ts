import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Artist } from '../../models/artist';

@Component({
  selector: 'app-artist-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './artist-card.component.html',
  styleUrls: ['./artist-card.component.scss'],
})
export class ArtistCardComponent implements OnInit {
  @Input() artist!: Artist;
  imageError = false;

  constructor() {}

  ngOnInit(): void {}

  onImageError(event: any): void {
    this.imageError = true;
  }

  hasImageError(): boolean {
    return this.imageError;
  }
}
