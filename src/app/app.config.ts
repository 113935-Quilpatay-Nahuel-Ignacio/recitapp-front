import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeEsAR from '@angular/common/locales/es-AR';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { authInterceptor } from './core/interceptors/auth.interceptor';

// Register the locale data for 'es-AR'
registerLocaleData(localeEsAR);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),
    { provide: LOCALE_ID, useValue: 'es-AR' }
    // TODO: Firebase providers will be added after resolving compatibility issues
    // See FIREBASE_SETUP.md for configuration instructions
  ],
};
