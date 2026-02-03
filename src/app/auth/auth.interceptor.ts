import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { AuthService } from './auth.service';

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
  constructor(private readonly auth: AuthService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> { //tutte le richieste passano da qui
    // Acquisisci il token in modo silenzioso e e lo aggiunge alle richieste in uscita senza esporlo nell'interfaccia utente.
    return from(this.auth.acquireToken()).pipe(
      switchMap((token) => { //prende il token e ritorna all Observable che gestisce la richiesta HTTP
        if (token) {
          const authReq = req.clone({ //req.clone  non modifica la richiesta originale ma ne cre una nuova con l'header di autorizzazione
            setHeaders: { Authorization: `Bearer ${token}` }
          });
          return next.handle(authReq);
        }
        return next.handle(req); //se il token non è disponibile inoltra la richiesta originale senza l'header di autorizzazione
      })
    );
  }
}
