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
  defaultImage = 'assets/images/default-artist-avatar.svg';

  constructor() {}

  ngOnInit(): void {}

  onImageError(event: any): void {
    event.target.src = this.defaultImage;
  }
}
