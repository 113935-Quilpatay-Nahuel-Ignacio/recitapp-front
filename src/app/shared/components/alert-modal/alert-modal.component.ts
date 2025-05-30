import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface AlertModalData {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  buttonText: string;
}

@Component({
  selector: 'app-alert-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './alert-modal.component.html',
  styleUrls: ['./alert-modal.component.scss']
})
export class AlertModalComponent {
  constructor(
    public dialogRef: MatDialogRef<AlertModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AlertModalData
  ) {}

  onAccept(): void {
    this.dialogRef.close(true);
  }

  getIcon(): string {
    switch (this.data.type) {
      case 'success':
        return 'check_circle';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'info':
      default:
        return 'info';
    }
  }

  getButtonColor(): string {
    switch (this.data.type) {
      case 'success':
        return 'primary';
      case 'error':
        return 'warn';
      case 'warning':
        return 'accent';
      case 'info':
      default:
        return 'primary';
    }
  }
} 