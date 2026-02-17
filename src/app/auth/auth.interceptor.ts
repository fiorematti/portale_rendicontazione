import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { AuthService } from './auth.service';
import { environment } from '../config/env';

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly debug = true; // set false to silence logs

  constructor(private readonly auth: AuthService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return from(this.auth.acquireToken()).pipe(
      switchMap((token) => {
        const isRelative = !/^https?:\/\//i.test(req.url);
        const url = isRelative ? `${this.baseUrl}${req.url}` : req.url;

        if (this.debug) {
          console.log('[AuthTokenInterceptor] request', req.method, url);
          console.log('[AuthTokenInterceptor] token', token ?? 'null');
        }

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
