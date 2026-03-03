import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { AuthService } from './auth.service';
import { environment } from '../config/env';

/**
 * Interceptor HTTP che aggiunge automaticamente il token Bearer alle richieste API.
 * Per gli URL relativi, antepone il base URL configurato in `environment.apiBaseUrl`.
 */
@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private readonly auth: AuthService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return from(this.auth.acquireToken()).pipe(
      switchMap((token) => {
        // Antepone il base URL agli URL relativi (es. /api/...)
        const isRelative = !/^https?:\/\//i.test(req.url);
        const url = isRelative ? `${this.baseUrl}${req.url}` : req.url;

        if (token) {
          const authReq = req.clone({
            url,
            setHeaders: { Authorization: `Bearer ${token}` }
          });
          return next.handle(authReq);
        }

        const forwardedReq = isRelative ? req.clone({ url }) : req;
        return next.handle(forwardedReq);
      })
    );
  }
}
