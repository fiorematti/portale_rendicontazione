import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
	selector: 'app-login',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './login.html',
	styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
	status = '';

	constructor(private readonly auth: AuthService, private readonly router: Router) {}

	// Inizializza il componente e verifica lo stato di autenticazione
	async ngOnInit(): Promise<void> {
		await this.auth.initialize();
		if (this.auth.isAuthenticated()) {
			this.status = 'Sei già autenticato con Microsoft Entra. Recupero sessione...';
			await this.auth.acquireToken();
		}
	}

	login(): void {
		this.status = 'Reindirizzamento a Microsoft...';
		this.auth.login();
	}

	logout(): void {
		this.status = 'Disconnessione in corso...';
		this.auth.logout();
	}

	async goToApp(): Promise<void> {
		await this.router.navigate(['/attivita']);
	}

	get isAuthenticated(): boolean {
		return this.auth.isAuthenticated();
	}
}
