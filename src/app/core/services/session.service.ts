import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private currentUserIdSubject = new BehaviorSubject<number | null>(null);
  public currentUserId$ = this.currentUserIdSubject.asObservable();

  constructor(private authService: AuthService) {
    // Subscribe to auth service current user changes
    this.authService.currentUser$.subscribe(user => {
      this.currentUserIdSubject.next(user?.id || null);
    });
  }

  /**
   * Obtener el ID del usuario actual
   */
  getCurrentUserId(): number | null {
    const user = this.authService.getCurrentUser();
    return user?.id || null;
  }

  /**
   * Obtener el ID del usuario actual como Observable
   */
  getCurrentUserIdObservable(): Observable<number | null> {
    return this.currentUserId$;
  }

  /**
   * Verificar si hay un usuario logueado
   */
  isUserLoggedIn(): boolean {
    return this.getCurrentUserId() !== null;
  }

  /**
   * Obtener el ID del usuario o lanzar error si no está logueado
   */
  requireUserId(): number {
    const userId = this.getCurrentUserId();
    if (userId === null) {
      throw new Error('Usuario no autenticado');
    }
    return userId;
  }

  /**
   * Obtener el usuario completo actual
   */
  getCurrentUser() {
    return this.authService.getCurrentUser();
  }
} 