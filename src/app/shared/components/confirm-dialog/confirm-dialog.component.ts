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
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
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
        return 'warn';
      default:
        return 'primary';
    }
  }

  getWarningClass(detail: string): string {
    const detailLower = detail.toLowerCase();
    
    if (detailLower.includes('rol privilegiado') || 
        detailLower.includes('admin') || 
        detailLower.includes('moderador') ||
        detailLower.includes('¡atención!')) {
      return 'warning-critical';
    }
    
    if (detailLower.includes('transacciones') || 
        detailLower.includes('tickets') ||
        detailLower.includes('historial')) {
      return 'warning-high';
    }
    
    return 'warning-normal';
  }
} 