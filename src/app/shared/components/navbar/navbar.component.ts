import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
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
  isAuthenticated: boolean = false;
  isAdmin: boolean = false;
  isEventRegistrar: boolean = false;
  isModerator: boolean = false;
  isComprador: boolean = false;
  isVerificadorEntradas: boolean = false;
  currentUser: User | null = null;
  userDisplayName: string = '';
  
  private destroy$ = new Subject<void>();

  constructor(
    public authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Subscribe to authentication state
    this.authService.isAuthenticated$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(isAuth => {
      this.isAuthenticated = isAuth;
      this.updateUserInfo();
    });

    // Subscribe to current user changes
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.currentUser = user;
      this.updateUserInfo();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateUserInfo(): void {
    if (this.currentUser) {
      this.userDisplayName = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
      const userRole = this.currentUser.role?.name;
      
      // Reset all role flags
      this.isAdmin = false;
      this.isEventRegistrar = false;
      this.isModerator = false;
      this.isComprador = false;
      this.isVerificadorEntradas = false;
      
      // Set role flags based on user role
      switch (userRole) {
        case 'ADMIN':
          this.isAdmin = true;
          break;
        case 'MODERADOR':
          this.isModerator = true;
          break;
        case 'REGISTRADOR_EVENTO':
          this.isEventRegistrar = true;
          break;
        case 'COMPRADOR':
          this.isComprador = true;
          break;
        case 'VERIFICADOR_ENTRADAS':
          this.isVerificadorEntradas = true;
          console.log('🎫 VERIFICADOR_ENTRADAS role detected in navbar');
          console.log('🔍 User should see Admin menu with QR validation option');
          break;
      }
      
      // Additional logging for debugging
      console.log('👤 User role updated:', {
        userRole,
        isAdmin: this.isAdmin,
        isVerificadorEntradas: this.isVerificadorEntradas,
        userDisplayName: this.userDisplayName
      });
    } else {
      this.userDisplayName = '';
      this.isAdmin = false;
      this.isEventRegistrar = false;
      this.isModerator = false;
      this.isComprador = false;
      this.isVerificadorEntradas = false;
    }
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/auth/login']);
    });
  }
}
