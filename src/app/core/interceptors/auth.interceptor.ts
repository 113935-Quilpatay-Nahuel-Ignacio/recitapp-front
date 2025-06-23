import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { throwError, BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const platformId = inject(PLATFORM_ID);

  // Lista de URLs que no necesitan autenticación
  const publicUrls = [
    '/auth/login',
    '/auth/register', 
    '/auth/refresh',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/validate-reset-token',
    '/api/payments/',
    '/payments/'
  ];

  // Verificar si la URL es pública
  const isPublicUrl = publicUrls.some(publicUrl => req.url.includes(publicUrl));

  // Log para debugging only in browser
  if (isPlatformBrowser(platformId)) {
    console.log('=== AUTH INTERCEPTOR ===');
    console.log('URL:', req.url);
    console.log('Method:', req.method);
    console.log('Is Public URL:', isPublicUrl);
  }

  // No agregar token a las rutas públicas
  if (isPublicUrl) {
    if (isPlatformBrowser(platformId)) {
      console.log('Skipping authentication for public URL');
    }
    return next(req);
  }

  // Agregar token si está disponible
  const token = authService.getToken();
  if (token) {
    if (isPlatformBrowser(platformId)) {
      console.log('Adding Authorization header');
    }
    req = addTokenHeader(req, token);
  } else {
    if (isPlatformBrowser(platformId)) {
      console.log('No token available');
    }
  }

  return next(req).pipe(
    catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handle401Error(req, next, authService);
      }
      return throwError(() => error);
    })
  );
};

function addTokenHeader(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return request.clone({
    headers: request.headers.set('Authorization', `Bearer ${token}`)
  });
}

function handle401Error(request: HttpRequest<unknown>, next: HttpHandlerFn, authService: AuthService): Observable<any> {
  const refreshToken = authService.getRefreshToken();
  
  // Si no hay refresh token, no intentar renovar, simplemente hacer logout silencioso
  if (!refreshToken) {
    isRefreshing = false;
    authService.logout().subscribe(); // Logout silencioso
    return throwError(() => new Error('Authentication required'));
  }

  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);
    
    return authService.refreshToken().pipe(
      switchMap((response: any) => {
        isRefreshing = false;
        refreshTokenSubject.next(response.token);
        return next(addTokenHeader(request, response.token));
      }),
      catchError((error) => {
        isRefreshing = false;
        authService.logout().subscribe(); // Logout silencioso
        return throwError(() => error);
      })
    );
  }

  return refreshTokenSubject.pipe(
    filter(token => token !== null),
    take(1),
    switchMap((token) => next(addTokenHeader(request, token)))
  );
} 