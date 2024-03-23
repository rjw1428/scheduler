import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { vendorInterceptor } from './vendor.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        vendorInterceptor,
        // (req, next) => next(req) // INLINE INTERCEPTOR FN
      ])
    ),
  ]
};
