import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError, BehaviorSubject, Observable } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // No agregar token a las rutas de autenticación
  if (isAuthUrl(req.url)) {
    return next(req);
  }

  // Agregar token si está disponible
  const token = authService.getToken();
  if (token) {
    req = addTokenHeader(req, token);
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

function isAuthUrl(url: string): boolean {
  return url.includes('/auth/login') || 
         url.includes('/auth/register') || 
         url.includes('/auth/refresh') ||
         url.includes('/auth/forgot-password') ||
         url.includes('/auth/reset-password') ||
         url.includes('/auth/validate-reset-token');
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