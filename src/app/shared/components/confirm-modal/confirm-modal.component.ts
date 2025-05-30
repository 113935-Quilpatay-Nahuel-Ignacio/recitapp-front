import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmModalData {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'danger';
  confirmText: string;
  cancelText: string;
  details?: string[];
}

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss']
})
export class ConfirmModalComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmModalData
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
      case 'info':
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
      case 'info':
      default:
        return 'primary';
    }
  }

  getWarningClass(detail: string): string {
    const detailLower = detail.toLowerCase();
    
    if (detailLower.includes('permanentemente') || 
        detailLower.includes('no se puede deshacer') || 
        detailLower.includes('crítico') ||
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