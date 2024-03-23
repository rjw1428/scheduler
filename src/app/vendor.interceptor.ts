import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';

export const vendorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService)
  const updatedRequest = req.clone({
    params: req.params.append('vendorId', authService.vendorId)
  })
  return next(updatedRequest);
};
