import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

export interface ConfirmDialogData {
  title: string;
  message: string;
  details?: string[];
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'danger';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatListModule
  ],
  template: `
    <div class="confirm-dialog" [class]="'confirm-dialog--' + (data.type || 'info')">
      <div mat-dialog-title class="dialog-header">
        <mat-icon [class]="'icon--' + (data.type || 'info')">
          {{ getIcon() }}
        </mat-icon>
        <h2>{{ data.title }}</h2>
      </div>

      <div mat-dialog-content class="dialog-content">
        <p class="message">{{ data.message }}</p>
        
        <div *ngIf="data.details && data.details.length > 0" class="details">
          <h4>Detalles importantes:</h4>
          <mat-list>
            <mat-list-item *ngFor="let detail of data.details">
              <mat-icon matListItemIcon>warning</mat-icon>
              <div matListItemTitle>{{ detail }}</div>
            </mat-list-item>
          </mat-list>
        </div>
      </div>

      <div mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()">
          {{ data.cancelText || 'Cancelar' }}
        </button>
        <button 
          mat-raised-button 
          [color]="getButtonColor()"
          (click)="onConfirm()">
          {{ data.confirmText || 'Confirmar' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      .dialog-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 24px 24px 16px 24px;
        border-bottom: 1px solid #e0e0e0;

        mat-icon {
          font-size: 1.5rem;
          width: 1.5rem;
          height: 1.5rem;

          &.icon--info {
            color: #2196f3;
          }

          &.icon--warning {
            color: #ff9800;
          }

          &.icon--danger {
            color: #f44336;
          }
        }

        h2 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 500;
        }
      }

      .dialog-content {
        padding: 24px;

        .message {
          margin: 0 0 16px 0;
          color: #333;
          line-height: 1.5;
        }

        .details {
          h4 {
            margin: 0 0 12px 0;
            color: #666;
            font-size: 0.875rem;
            font-weight: 500;
          }

          mat-list {
            .mat-mdc-list-item {
              padding-left: 0;

              mat-icon {
                color: #ff9800;
                font-size: 1rem;
                width: 1rem;
                height: 1rem;
              }
            }
          }
        }
      }

      .dialog-actions {
        padding: 16px 24px 24px 24px;
        border-top: 1px solid #e0e0e0;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }

      &.confirm-dialog--danger {
        .dialog-header {
          background-color: #ffebee;
          border-bottom-color: #ffcdd2;
        }
      }

      &.confirm-dialog--warning {
        .dialog-header {
          background-color: #fff8e1;
          border-bottom-color: #ffecb3;
        }
      }
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getIcon(): string {
    switch (this.data.type) {
      case 'warning':
        return 'warning';
      case 'danger':
        return 'error';
      default:
        return 'info';
    }
  }

  getButtonColor(): string {
    switch (this.data.type) {
      case 'danger':
        return 'warn';
      case 'warning':
        return 'accent';
      default:
        return 'primary';
    }
  }
} 