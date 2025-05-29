import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { User } from '../../../user/models/user';
import { AVAILABLE_ROLES } from '../../../user/models/role';
import { UserAdminService } from '../../services/user-admin.service';

export interface UserDetailDialogData {
  user: User;
}

@Component({
  selector: 'app-user-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatTabsModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './user-detail-dialog.component.html',
  styleUrls: ['./user-detail-dialog.component.scss']
})
export class UserDetailDialogComponent implements OnInit {
  user: User;
  availableRoles = AVAILABLE_ROLES;
  
  // Data for tabs
  purchases: any[] = [];
  followedArtists: any[] = [];
  followedVenues: any[] = [];
  notificationPreferences: any = null;
  
  // Loading states
  loadingPurchases = false;
  loadingArtists = false;
  loadingVenues = false;
  loadingPreferences = false;

  constructor(
    private userAdminService: UserAdminService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<UserDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserDetailDialogData
  ) {
    this.user = data.user;
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  private loadUserData(): void {
    if (!this.user.id) return;

    // Load purchases
    this.loadPurchases();
    
    // Load followed artists
    this.loadFollowedArtists();
    
    // Load followed venues
    this.loadFollowedVenues();
    
    // Load notification preferences
    this.loadNotificationPreferences();
  }

  private loadPurchases(): void {
    if (!this.user.id) return;
    
    this.loadingPurchases = true;
    this.userAdminService.getUserPurchases(this.user.id).subscribe({
      next: (purchases) => {
        this.purchases = purchases;
        this.loadingPurchases = false;
      },
      error: (error) => {
        console.error('Error loading purchases:', error);
        this.loadingPurchases = false;
      }
    });
  }

  private loadFollowedArtists(): void {
    if (!this.user.id) return;
    
    this.loadingArtists = true;
    this.userAdminService.getUserFollowedArtists(this.user.id).subscribe({
      next: (artists) => {
        this.followedArtists = artists;
        this.loadingArtists = false;
      },
      error: (error) => {
        console.error('Error loading followed artists:', error);
        this.loadingArtists = false;
      }
    });
  }

  private loadFollowedVenues(): void {
    if (!this.user.id) return;
    
    this.loadingVenues = true;
    this.userAdminService.getUserFollowedVenues(this.user.id).subscribe({
      next: (venues) => {
        this.followedVenues = venues;
        this.loadingVenues = false;
      },
      error: (error) => {
        console.error('Error loading followed venues:', error);
        this.loadingVenues = false;
      }
    });
  }

  private loadNotificationPreferences(): void {
    if (!this.user.id) return;
    
    this.loadingPreferences = true;
    this.userAdminService.getUserNotificationPreferences(this.user.id).subscribe({
      next: (preferences) => {
        this.notificationPreferences = preferences;
        this.loadingPreferences = false;
      },
      error: (error) => {
        console.error('Error loading notification preferences:', error);
        this.loadingPreferences = false;
      }
    });
  }

  getRoleLabel(roleName: string): string {
    const role = this.availableRoles.find(r => r.value === roleName);
    return role ? role.label : roleName;
  }

  getRoleColor(roleName: string): string {
    switch (roleName) {
      case 'ADMIN': return 'primary';
      case 'MODERADOR': return 'accent';
      case 'REGISTRADOR_EVENTO': return 'warn';
      case 'COMPRADOR': return '';
      default: return '';
    }
  }

  // Función para convertir el valor active a boolean
  isUserActive(user: User): boolean {
    return user.active === 1 || user.active === true;
  }

  // Función para obtener el texto del estado
  getStatusText(user: User): string {
    return this.isUserActive(user) ? 'Activo' : 'Inactivo';
  }

  // Función para obtener el ícono del estado
  getStatusIcon(user: User): string {
    return this.isUserActive(user) ? 'check_circle' : 'cancel';
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'No disponible';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number | undefined): string {
    if (amount === undefined || amount === null) return '$0.00';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  }

  onClose(): void {
    this.dialogRef.close();
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.snackBar.open('Copiado al portapapeles', 'Cerrar', {
        duration: 2000
      });
    });
  }
} 