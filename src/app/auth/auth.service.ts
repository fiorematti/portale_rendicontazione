import { Injectable } from '@angular/core';
import { AccountInfo } from '@azure/msal-browser'; //Rappresenta un account Microsoft autenticato
import { MsalService } from '@azure/msal-angular'; // è una libreria MSAL Microsoft Authentication Library per Angular che facilita l'integrazione dell'autenticazione Microsoft nelle applicazioni Angular
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
	// Permessi scope richiesti dall app
	private readonly scopes = ['User.Read'];
	// Snapshot (copia) del token di accesso memorizzato in cache
	private readonly token$ = new BehaviorSubject<string | null>(null); //mantiene l'ultimo acceess token valido inizialmente null aggiornato quando arriva un token valido BehaviorSubject permette di avere uno stato osservabile e aggiornabile
	// garantisce che l'inizializzazione avvenga una sola volta
	private initPromise: Promise<void> | null = null; //serve per evitare che initialize() venga eseguito più volte contemporaneamente

	constructor(private readonly msal: MsalService, private readonly router: Router) { //Angular inietta MsalService e Router e avvia subito l'inizializzazione del sistema di autenticazione
		this.initialize();
	}

	//serve per preparare MSAL e gestire eventuali redirect login
	initialize(): Promise<void> { 
		if (this.initPromise) return this.initPromise;

		this.initPromise = this.msal.instance //inizializza la libreria MSAL
			.initialize()
			.then(() => this.msal.instance.handleRedirectPromise())
			.then((result) => {
				if (result?.account) { // imposta l'account attivo e salva il token in memoria
					this.msal.instance.setActiveAccount(result.account);
					if (result.accessToken) this.token$.next(result.accessToken);
					// dopo un redirect di login, porta l'utente alla pagina principale
					try {
						this.router.navigate(['/attivita']);
					} catch (e) {
						// ignore navigation errors during init
					}
				} else { //recupera account gia presente nella cache msal
					const account = this.getAccount();
					if (account) this.msal.instance.setActiveAccount(account);
				}
			});

		return this.initPromise;
	}

	login(): void { //avvia il login interattivo tramite redirect
		this.msal.loginRedirect({ scopes: this.scopes, redirectUri: 'http://localhost:4200' }); //fa ritorno all app dopo l'autenticazione
	}

	// serve per ottenere un acess token valido in modo silenzioso
	async acquireToken(): Promise<string | null> { 
		await this.initialize(); //assicura che msal sia pronto
		const account = this.getAccount(); // se non ho l'account non ho un token
		if (!account) return null;

		try {
			const result = await firstValueFrom(
				this.msal.acquireTokenSilent({ account, scopes: this.scopes })
			);
			this.token$.next(result.accessToken);
			return result.accessToken;
		} catch (error) {
			return null;
		}
	}

	// caneclla il token locale, avvia il logout tramite redirect e ritorna all'app
	logout(): void {
		this.token$.next(null);
		this.msal.logoutRedirect({ postLogoutRedirectUri: 'http://localhost:4200' });
	}

	// Fa un check se l'utente è autenticato
	isAuthenticated(): boolean {
		return Boolean(this.getAccount());
	}

	// Restituisce l'ultimo token salvato in memoria
	tokenSnapshot(): string | null {
		return this.token$.value;
	}

	// Recupera e imposta l'account attivo
	ensureActiveAccount(): AccountInfo | null {
		const account = this.getAccount();
		if (account) this.msal.instance.setActiveAccount(account);
		return account;
	}

	// Recupera l'account attivo o utilizza il primo disponibile
	private getAccount(): AccountInfo | null {
		return this.msal.instance.getActiveAccount() ?? this.msal.instance.getAllAccounts()[0] ?? null;
	}
}
