import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router'; //CanActive è una guardia delle rotte serve a decidere se un utente può entrare oppure np in una pagina
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async () => { // creo una guard di tipo  CanActive è async perchè al suo intero uso await questa funzione  viene chiamata ogni volt ache si vuole accedere a una rotta protetta
  const auth = inject(AuthService); //Angular inietts AuthService

  await auth.initialize(); // inizializza il sistema di autentificazione es. MSAL, token, sessione, localStorage, refresh token è await perche controlla e recupera token
  const account = auth.ensureActiveAccount(); // controlla se un account è attivo

  if (account) { // se l'utente è autenticato true angular permtette l'accesso alla rotta protetta
    return true;
  }

  auth.login(); // accesso negato avvia il login angular blocca la navigazione
  return false;
};
