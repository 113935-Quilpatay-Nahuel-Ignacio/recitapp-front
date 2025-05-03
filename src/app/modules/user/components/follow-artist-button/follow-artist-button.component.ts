import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-follow-artist-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="btn"
      [ngClass]="isFollowing ? 'btn-danger' : 'btn-primary'"
      [disabled]="loading"
      (click)="toggleFollow()"
    >
      <span
        *ngIf="loading"
        class="spinner-border spinner-border-sm me-2"
      ></span>
      {{ isFollowing ? 'Dejar de seguir' : 'Seguir' }}
    </button>
  `,
})
export class FollowArtistButtonComponent implements OnInit {
  @Input() artistId!: number;
  @Input() userId: number = 1; // Mock user ID
  @Output() followStatusChanged = new EventEmitter<boolean>();

  isFollowing = false;
  loading = false;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.checkFollowStatus();
  }

  checkFollowStatus(): void {
    this.loading = true;
    this.userService.isFollowingArtist(this.userId, this.artistId).subscribe({
      next: (status) => {
        this.isFollowing = status;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  toggleFollow(): void {
    this.loading = true;

    if (this.isFollowing) {
      this.userService.unfollowArtist(this.userId, this.artistId).subscribe({
        next: () => {
          this.isFollowing = false;
          this.followStatusChanged.emit(false);
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
    } else {
      this.userService.followArtist(this.userId, this.artistId).subscribe({
        next: () => {
          this.isFollowing = true;
          this.followStatusChanged.emit(true);
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
    }
  }
}
