import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { SimpleDropdownDirective } from '../../directives/simple-dropdown.directive';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, SimpleDropdownDirective],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  currentUser: User | null = null;
  isAuthenticated = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Inicializar valores inmediatamente para evitar parpadeo
    this.isAuthenticated = this.authService.isAuthenticated();
    this.currentUser = this.authService.getCurrentUser();

    // Suscribirse al estado de autenticación
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAuth => {
        this.isAuthenticated = isAuth;
        console.log('🔐 [Navbar] Authentication state changed:', isAuth);
      });

    // Suscribirse al usuario actual
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        console.log('👤 [Navbar] Current user changed:', user?.email || 'No user');
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  get isEventRegistrar(): boolean {
    return this.authService.hasAnyRole(['ADMIN', 'REGISTRADOR_EVENTO']);
  }

  get userDisplayName(): string {
    if (this.currentUser) {
      return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
    }
    return '';
  }

  logout(): void {
    console.log('🚪 [Navbar] Initiating logout...');
    this.authService.logout().subscribe({
      next: () => {
        console.log('✅ [Navbar] Logout successful');
        // El AuthService ya maneja la redirección y limpieza de estado
      },
      error: (error) => {
        console.error('❌ [Navbar] Logout error:', error);
        // Incluso si hay error en el servidor, limpiar localmente
      }
    });
  }
}
