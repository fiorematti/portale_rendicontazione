import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AccountInfo } from '@azure/msal-browser';
import { MsalService } from '@azure/msal-angular';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { mapAuthResponseToUser } from '../mappers/authmapper';
import { AuthResponse } from '../dto/authresponsdto';
import { User } from '../dto/userdto';
import { environment } from '../config/env';

/**
 * Service centrale per l'autenticazione tramite Microsoft Entra (Azure AD).
 * Gestisce l'inizializzazione MSAL, l'acquisizione dei token,
 * il login/logout e il recupero dei dati utente dal backend.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
	private readonly scopes = environment.msal.scopes;
	/** Stream reattivo del token di accesso corrente */
	private readonly token$ = new BehaviorSubject<string | null>(null);
	/** Stream reattivo dei dati dell'utente autenticato */
	private readonly user$ = new BehaviorSubject<User | null>(null);
	private initPromise: Promise<void> | null = null;
	private initialized = false;
	/** Promessa singola per evitare chiamate multiple a microsoft-login */
	private microsoftLoginPromise: Promise<User> | null = null;

	constructor(
		private readonly msal: MsalService,
		private readonly router: Router,
		private readonly http: HttpClient
	) {
		this.initialize();
	}

	/**
	 * Inizializza MSAL e gestisce il redirect post-login.
	 * Idempotente: chiamate successive restituiscono la stessa promessa.
	 */
	async initialize(): Promise<void> { 
		if (this.initPromise) return this.initPromise;

		this.initPromise = (async () => {
			await this.msal.instance.initialize();
			const result = await this.msal.instance.handleRedirectPromise();
			this.initialized = true;
			if (result?.account) {
				this.msal.instance.setActiveAccount(result.account);
				if (result.accessToken) {
					this.token$.next(result.accessToken);
				}
				try {
					this.router.navigate(['/attivita']);
				} catch (e) {
					// ignore navigation errors during init
				}
			} else {
				const account = this.getAccount();
				if (account) this.msal.instance.setActiveAccount(account);
			}
		})();

		this.initPromise.catch(() => {
			this.initialized = false;
			this.initPromise = null;
		});

		return this.initPromise;
	}

	/** Avvia il flusso di login redirect verso Microsoft Entra */
	login(): void {
		this.msal.loginRedirect({ scopes: this.scopes, redirectUri: environment.msal.redirectUri });
	}

	/**
	 * Acquisisce un token silenziosamente e avvia il recupero dati utente dal backend.
	 * @returns Il token di accesso o null se non autenticato
	 */
	async acquireToken(): Promise<string | null> { 
		await this.initialize();
		const account = this.getAccount();
		if (!account) return null;

		try {
			const result = await firstValueFrom(
				this.msal.acquireTokenSilent({ account, scopes: this.scopes })
			);
			this.token$.next(result.accessToken);
		
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

	/** Effettua il logout e reindirizza alla pagina di post-logout */
	logout(): void {
		this.token$.next(null);
		this.msal.logoutRedirect({ postLogoutRedirectUri: environment.msal.postLogoutRedirectUri });
	}

	isAuthenticated(): boolean {
		return Boolean(this.getAccount());
	}

	tokenSnapshot(): string | null {
		return this.token$.value;
	}

	userSnapshot(): User | null {
		return this.user$.value;
	}

	userChanges() {
		return this.user$.asObservable();
	}

	/** Chiama l'endpoint backend per registrare/recuperare l'utente autenticato */
	async fetchMicrosoftLogin(): Promise<User> {
		const dto = await firstValueFrom(this.http.get<AuthResponse>('/api/Auth/microsoft-login'));
		const user = mapAuthResponseToUser(dto);
		this.user$.next(user);
		return user;
	}

	/** Imposta l'account attivo e lo restituisce se presente */
	ensureActiveAccount(): AccountInfo | null {
		const account = this.getAccount();
		if (account) this.msal.instance.setActiveAccount(account);
		return account;
	}

	private getAccount(): AccountInfo | null {
		if (!this.initialized) return null;
		return this.msal.instance.getActiveAccount() ?? this.msal.instance.getAllAccounts()[0] ?? null;
	}
}
