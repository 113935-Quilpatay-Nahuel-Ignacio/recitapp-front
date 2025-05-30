import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { SessionService } from '../../../../core/services/session.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-follow-artist-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="btn"
      [ngClass]="isFollowing ? 'btn-danger' : 'btn-primary'"
      [disabled]="loading || !userId"
      (click)="toggleFollow()"
    >
      <span
        *ngIf="loading"
        class="spinner-border spinner-border-sm me-2"
      ></span>
      {{ isFollowing ? 'Dejar de seguir' : 'Seguir' }}
    </button>
    <div *ngIf="error" class="text-danger small mt-1">
      {{ error }}
    </div>
  `,
  styles: [`
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class FollowArtistButtonComponent implements OnInit, OnDestroy {
  @Input() artistId!: number;
  @Output() followStatusChanged = new EventEmitter<boolean>();

  userId: number | null = null;
  isFollowing = false;
  loading = false;
  error = '';
  
  private userSubscription?: Subscription;

  constructor(
    private userService: UserService,
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    // Subscribe to user changes
    this.userSubscription = this.sessionService.currentUserId$.subscribe(userId => {
      this.userId = userId;
      if (this.userId && this.artistId) {
        this.checkIfFollowing();
      }
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }

  checkIfFollowing(): void {
    if (!this.userId) {
      this.error = 'Usuario no autenticado';
      return;
    }

    this.loading = true;
    this.userService.isFollowingArtist(this.userId, this.artistId).subscribe({
      next: (isFollowing) => {
        this.isFollowing = isFollowing;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error checking follow status:', err);
        this.loading = false;
        this.error = 'Error al verificar estado de seguimiento';
      },
    });
  }

  toggleFollow(): void {
    if (!this.userId) {
      this.error = 'Usuario no autenticado';
      return;
    }

    this.loading = true;
    this.error = '';

    if (this.isFollowing) {
      this.userService.unfollowArtist(this.userId, this.artistId).subscribe({
        next: () => {
          this.isFollowing = false;
          this.loading = false;
          this.followStatusChanged.emit(false);
        },
        error: (err) => {
          console.error('Error unfollowing artist:', err);
          this.loading = false;
          this.error = 'Error al dejar de seguir';
        },
      });
    } else {
      this.userService.followArtist(this.userId, this.artistId).subscribe({
        next: () => {
          this.isFollowing = true;
          this.loading = false;
          this.followStatusChanged.emit(true);
        },
        error: (err) => {
          console.error('Error following artist:', err);
          this.loading = false;
          this.error = 'Error al seguir';
        },
      });
    }
  }
}
