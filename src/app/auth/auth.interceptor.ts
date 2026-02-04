import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { AuthService } from './auth.service';

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
  private readonly baseUrl = 'http://localhost:5000';

  constructor(private readonly auth: AuthService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> { //tutte le richieste passano da qui
    // Acquisisci il token in modo silenzioso e e lo aggiunge alle richieste in uscita senza esporlo nell'interfaccia utente.
    return from(this.auth.acquireToken()).pipe(
      switchMap((token) => { //prende il token e ritorna all Observable che gestisce la richiesta HTTP
        const isRelative = !/^https?:\/\//i.test(req.url);
        const url = isRelative ? `${this.baseUrl}${req.url}` : req.url;

        if (token) {
          const authReq = req.clone({ //req.clone  non modifica la richiesta originale ma ne cre una nuova con l'header di autorizzazione
            url,
            setHeaders: { Authorization: `Bearer ${token}` }
          });
          return next.handle(authReq);
        }

        const forwardedReq = isRelative ? req.clone({ url }) : req;
        return next.handle(forwardedReq); //se il token non è disponibile inoltra la richiesta originale senza l'header di autorizzazione
      })
    );
  }
}
