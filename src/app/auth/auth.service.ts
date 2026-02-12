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

@Injectable({ providedIn: 'root' })
export class AuthService {
	private readonly scopes = environment.msal.scopes;
	private readonly token$ = new BehaviorSubject<string | null>(null);
	private readonly user$ = new BehaviorSubject<User | null>(null);
	private initPromise: Promise<void> | null = null;
	private initialized = false;
	private microsoftLoginPromise: Promise<User> | null = null;

	constructor(
		private readonly msal: MsalService,
		private readonly router: Router,
		private readonly http: HttpClient
	) {
		this.initialize();
	}

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

	login(): void {
		this.msal.loginRedirect({ scopes: this.scopes, redirectUri: environment.msal.redirectUri });
	}

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

	async fetchMicrosoftLogin(): Promise<User> {
		const dto = await firstValueFrom(this.http.get<AuthResponse>('/api/Auth/microsoft-login'));
		const user = mapAuthResponseToUser(dto);
		this.user$.next(user);
		return user;
	}

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
