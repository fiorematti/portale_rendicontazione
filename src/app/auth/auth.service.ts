import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AccountInfo } from '@azure/msal-browser'; //Rappresenta un account Microsoft autenticato
import { MsalService } from '@azure/msal-angular'; // è una libreria MSAL Microsoft Authentication Library per Angular che facilita l'integrazione dell'autenticazione Microsoft nelle applicazioni Angular
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { mapAuthResponseToUser } from '../mappers/authmapper';
import { AuthResponse } from '../dto/authresponsdto';
import { User } from '../dto/userdto';

@Injectable({ providedIn: 'root' })
export class AuthService {
	// Permessi scope richiesti dall app
	private readonly scopes = ['api://37bdcadd-4948-4dff-9c60-a3d119fa4ab5/user_impersonation'];
	// Snapshot (copia) del token di accesso memorizzato in cache
	private readonly token$ = new BehaviorSubject<string | null>(null); //mantiene l'ultimo acceess token valido inizialmente null aggiornato quando arriva un token valido BehaviorSubject permette di avere uno stato osservabile e aggiornabile
	// garantisce che l'inizializzazione avvenga una sola volta
	private initPromise: Promise<void> | null = null; //serve per evitare che initialize() venga eseguito più volte contemporaneamente
	private initialized = false; // evita accessi a MSAL prima che abbia terminato l'init
	private microsoftLoginPromise: Promise<User> | null = null;

	constructor(
		private readonly msal: MsalService,
		private readonly router: Router,
		private readonly http: HttpClient
	) { //Angular inietta MsalService e Router e avvia subito l'inizializzazione del sistema di autenticazione
		this.initialize();
	}

	//serve per preparare MSAL e gestire eventuali redirect login
	async initialize(): Promise<void> { 
		if (this.initPromise) return this.initPromise;

		this.initPromise = (async () => {
			await this.msal.instance.initialize(); // richiesto da msal-browser 3.x prima di leggere la cache
			const result = await this.msal.instance.handleRedirectPromise();
			this.initialized = true; // da qui in poi le letture cache sono sicure
			if (result?.account) { // imposta l'account attivo e salva il token in memoria
				this.msal.instance.setActiveAccount(result.account);
				if (result.accessToken) {
					this.token$.next(result.accessToken);
					console.log('MSAL redirect access token', result.accessToken);
				}
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
		})();

		this.initPromise.catch(() => {
			this.initialized = false;
			this.initPromise = null; // consente un nuovo tentativo se l'init fallisce
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
			console.log('MSAL silent access token', result.accessToken);
		
			// Dopo aver ottenuto il token, lancia automaticamente il login backend se non è già in corso
			if (!this.microsoftLoginPromise) {
				this.microsoftLoginPromise = this.fetchMicrosoftLogin().catch((err) => {
					this.microsoftLoginPromise = null;
					throw err;
				});
			}

			return result.accessToken;
		} catch (error) {
			return null;
		}
	}

	// caneclla il token locale, avvia il logout tramite redirect e ritorna all'app
	logout(): void {
		this.token$.next(null);
		this.msal.logoutRedirect({ postLogoutRedirectUri: 'http://localhost:4200/login' });
	}

	// Fa un check se l'utente è autenticato
	isAuthenticated(): boolean {
		return Boolean(this.getAccount());
	}

	// Restituisce l'ultimo token salvato in memoria
	tokenSnapshot(): string | null {
		return this.token$.value;
	}

	// Chiamata di login Microsoft: ritorna l'entità User mappata dal DTO API
	async fetchMicrosoftLogin(): Promise<User> {
		const dto = await firstValueFrom(this.http.get<AuthResponse>('/api/Auth/microsoft-login'));
		return mapAuthResponseToUser(dto);
	}

	// Recupera e imposta l'account attivo
	ensureActiveAccount(): AccountInfo | null {
		const account = this.getAccount();
		if (account) this.msal.instance.setActiveAccount(account);
		return account;
	}

	// Recupera l'account attivo o utilizza il primo disponibile
	private getAccount(): AccountInfo | null {
		if (!this.initialized) return null;
		return this.msal.instance.getActiveAccount() ?? this.msal.instance.getAllAccounts()[0] ?? null;
	}
}
