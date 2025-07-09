import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, timer, of } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

import {
  User,
  LoginRequest,
  UserRegistrationRequest,
  AuthResponse,
  RefreshTokenRequest,
  PasswordResetRequest,
  PasswordResetConfirmRequest,
  JwtPayload
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/api/auth';
  private readonly TOKEN_KEY = 'recitapp_token';
  private readonly REFRESH_TOKEN_KEY = 'recitapp_refresh_token';
  private readonly USER_KEY = 'recitapp_user';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private refreshTokenTimer?: any;

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.initializeAuth();
  }

  /**
   * Verificar si estamos en el navegador
   */
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Inicializar autenticación al cargar la aplicación
   */
  private initializeAuth(): void {
    if (!this.isBrowser()) {
      console.log('🌐 [AuthService] Not in browser, skipping auth initialization');
      return;
    }

    const token = this.getToken();
    const refreshToken = this.getRefreshToken();
    const user = this.getStoredUser();

    console.log('🔑 [AuthService] Initializing auth - Token:', !!token, 'RefreshToken:', !!refreshToken, 'User:', !!user);

    if (token && user && this.isTokenValid(token)) {
      console.log('✅ [AuthService] Valid token found, setting authenticated state');
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
      this.scheduleTokenRefresh();
    } else if (refreshToken && user) {
      console.log('🔄 [AuthService] Token expired, attempting refresh');
      // Si el token expiró pero tenemos refresh token, intentar renovar
      this.refreshToken().subscribe({
        next: () => {
          console.log('✅ [AuthService] Token refreshed successfully');
        },
        error: () => {
          console.log('❌ [AuthService] Token refresh failed, clearing data');
          this.clearAuthData();
        }
      });
    } else {
      console.log('🚫 [AuthService] No valid tokens, clearing auth data');
      // No hay tokens válidos, limpiar datos
      this.clearAuthData();
    }
  }

  /**
   * Iniciar sesión
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError(this.handleError)
      );
  }

  /**
   * Registrar nuevo usuario
   */
  register(userData: UserRegistrationRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, userData)
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError(this.handleError)
      );
  }

  /**
   * Cerrar sesión
   */
  logout(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    
    if (refreshToken) {
      return this.http.post(`${this.API_URL}/logout`, { refreshToken })
        .pipe(
          tap(() => this.handleLogout()),
          catchError(() => {
            this.handleLogout();
            return of(null);
          })
        );
    } else {
      this.handleLogout();
      return of(null);
    }
  }

  /**
   * Renovar token de acceso
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      this.handleLogout();
      return throwError(() => new Error('No refresh token available'));
    }

    const request: RefreshTokenRequest = { refreshToken };
    
    return this.http.post<AuthResponse>(`${this.API_URL}/refresh`, request)
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError(error => {
          this.handleLogout();
          return throwError(() => error);
        })
      );
  }

  /**
   * Solicitar recuperación de contraseña
   */
  forgotPassword(email: string): Observable<any> {
    const request: PasswordResetRequest = { email };
    return this.http.post(`${this.API_URL}/forgot-password`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Confirmar nueva contraseña
   */
  resetPassword(resetData: PasswordResetConfirmRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/reset-password`, resetData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Validar token de recuperación
   */
  validateResetToken(token: string): Observable<boolean> {
    return this.http.get<any>(`${this.API_URL}/validate-reset-token?token=${token}`)
      .pipe(
        map(response => response.valid || false),
        catchError(this.handleError)
      );
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Actualizar usuario actual
   */
  updateCurrentUser(updatedUser: User): void {
    if (!this.isBrowser()) {
      return;
    }
    
    // Update localStorage
    localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
    
    // Update BehaviorSubject
    this.currentUserSubject.next(updatedUser);
  }

  /**
   * Obtener ID del usuario actual
   */
  getCurrentUserId(): number | null {
    const user = this.getCurrentUser();
    return user?.id || null;
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role?.name === role;
  }

  /**
   * Verificar si el usuario tiene alguno de los roles especificados
   */
  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user?.role ? roles.includes(user.role.name) : false;
  }

  /**
   * Obtener token de acceso
   */
  getToken(): string | null {
    if (!this.isBrowser()) {
      return null;
    }
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtener refresh token
   */
  getRefreshToken(): string | null {
    if (!this.isBrowser()) {
      return null;
    }
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Obtener headers de autorización
   */
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Manejar respuesta exitosa de autenticación
   */
  private handleAuthSuccess(response: AuthResponse): void {
    if (!this.isBrowser()) {
      return;
    }

    // Guardar tokens
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);

    // Crear objeto usuario
    const user: User = {
      id: response.userId,
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
      active: true,
      role: {
        id: 0, // Se podría obtener del backend si es necesario
        name: response.role,
        description: ''
      }
    };

    // Guardar usuario
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));

    // Actualizar subjects
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);

    // Programar renovación de token
    this.scheduleTokenRefresh();
  }

  /**
   * Manejar cierre de sesión
   */
  private handleLogout(): void {
    this.clearAuthData();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.clearTokenRefreshTimer();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Limpiar datos de autenticación
   */
  private clearAuthData(): void {
    if (!this.isBrowser()) {
      return;
    }
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Obtener usuario almacenado
   */
  private getStoredUser(): User | null {
    if (!this.isBrowser()) {
      return null;
    }
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Verificar si el token es válido
   */
  private isTokenValid(token: string): boolean {
    try {
      const decoded: JwtPayload = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  }

  /**
   * Programar renovación automática de token
   */
  private scheduleTokenRefresh(): void {
    if (!this.isBrowser()) {
      return;
    }

    const token = this.getToken();
    if (!token) return;

    try {
      const decoded: JwtPayload = jwtDecode(token);
      const expirationTime = decoded.exp * 1000;
      const currentTime = Date.now();
      const refreshTime = expirationTime - currentTime - (5 * 60 * 1000); // 5 minutos antes

      if (refreshTime > 0) {
        this.refreshTokenTimer = timer(refreshTime).subscribe(() => {
          this.refreshToken().subscribe({
            error: () => this.handleLogout()
          });
        });
      }
    } catch {
      this.handleLogout();
    }
  }

  /**
   * Limpiar timer de renovación
   */
  private clearTokenRefreshTimer(): void {
    if (this.refreshTokenTimer) {
      this.refreshTokenTimer.unsubscribe();
      this.refreshTokenTimer = null;
    }
  }

  /**
   * Manejar errores HTTP
   */
  private handleError = (error: any): Observable<never> => {
    let errorMessage = 'Ha ocurrido un error inesperado';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status) {
      switch (error.status) {
        case 401:
          errorMessage = 'Credenciales inválidas';
          break;
        case 403:
          errorMessage = 'No tienes permisos para realizar esta acción';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado';
          break;
        case 500:
          errorMessage = 'Error interno del servidor';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.statusText}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  };
} 