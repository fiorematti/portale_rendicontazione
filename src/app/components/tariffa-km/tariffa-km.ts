import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TariffaKmService } from './tariffa-km.service';
import { AuthService } from '../../auth/auth.service';

interface Acquirente {
	id: number;
	marca: string;
	modello: string;
	targa: string;
	tariffaKm: number;
	cilindrata: number;
}

@Component({
	selector: 'app-tariffa-km',
	standalone: true,
	imports: [CommonModule, FormsModule],
	templateUrl: './tariffa-km.html',
	styleUrls: ['./tariffa-km.css'],
})
export class TariffaKmComponent implements OnInit {
	listaAcquirenti: Acquirente[] = [];

	filtroTesto = '';
	isModalOpen = false;
	isEditMode = false;
	mostraErrore = false;
	acquirenteSelezionato: Acquirente = this.creaAcquirenteVuoto();
	isDettaglioOpen = false;
	acquirenteDettaglio: Acquirente | null = null;

	constructor(private readonly tariffaKmService: TariffaKmService, private readonly authService: AuthService) {}

	ngOnInit(): void {
		this.caricaAutomobili();
	}

	private caricaAutomobili(): void {
		this.tariffaKmService.getAllAutomobiliAdmin().subscribe({
			next: (res) => {
				const first = res?.[0];
				const autos = first?.automobili || [];
				this.listaAcquirenti = autos.map((a) => ({
					id: a.idauto,
					marca: a.marca,
					modello: a.modello,
					targa: a.targa,
					tariffaKm: a.tariffaChilometrica,
					cilindrata: a.cilindrata,
				}));
			},
			error: (err: unknown) => {
				console.error('Errore caricamento automobili admin', err);
			},
		});
	}

	get acquirentiFiltrati(): Acquirente[] {
		const filtro = this.filtroTesto.trim().toLowerCase();
		if (!filtro) return this.listaAcquirenti;
		return this.listaAcquirenti.filter((item) =>
			item.marca.toLowerCase().includes(filtro) ||
			item.modello.toLowerCase().includes(filtro) ||
			item.targa.toLowerCase().includes(filtro)
		);
	}

	apriModal(acquirente?: Acquirente): void {
		if (acquirente) {
			this.isEditMode = true;
			this.acquirenteSelezionato = { ...acquirente };
		} else {
			this.isEditMode = false;
			this.acquirenteSelezionato = this.creaAcquirenteVuoto();
		}
		this.mostraErrore = false;
		this.isModalOpen = true;
	}

	chiudiModal(): void {
		this.isModalOpen = false;
		this.mostraErrore = false;
	}

	salvaAcquirente(): void {
		const { marca, modello, targa, tariffaKm, id, cilindrata } = this.acquirenteSelezionato;
		const tariffaValida = !Number.isNaN(Number(tariffaKm));
		const cilindrataValida = !Number.isNaN(Number(cilindrata));
		const campiValidi = Boolean(marca.trim() && modello.trim() && targa.trim() && tariffaValida && cilindrataValida);

		if (!campiValidi) {
			this.mostraErrore = true;
			setTimeout(() => (this.mostraErrore = false), 3000);
			return;
		}

		if (this.isEditMode) {
			this.listaAcquirenti = this.listaAcquirenti.map((item) =>
				item.id === id ? { ...this.acquirenteSelezionato, tariffaKm: Number(tariffaKm) } : item
			);
			this.chiudiModal();
			return;
		}

		const idUtente = this.getIdUtente();
		if (!idUtente) {
			console.error('Impossibile recuperare l\'idUtente per creare l\'automobile');
			this.mostraErrore = true;
			return;
		}

		this.tariffaKmService
			.addAutomobile({
				marca: marca.trim(),
				modello: modello.trim(),
				targa: targa.trim(),
				tariffaChilometrica: Number(tariffaKm),
				cilindrata: Number(cilindrata),
				idUtente,
			})
			.subscribe({
				next: () => {
					this.chiudiModal();
					this.caricaAutomobili();
				},
				error: (err) => {
					console.error('Errore nel salvataggio della nuova automobile', err);
					this.mostraErrore = true;
				},
			});
	}

	private getIdUtente(): number | null {
		const id = this.authService.userSnapshot()?.id;
		if (!id) return null;
		const parsed = Number(id);
		return Number.isNaN(parsed) ? null : parsed;
	}

	modifica(acquirente: Acquirente): void {
		this.apriModal(acquirente);
	}

	modificaDaDettaglio(): void {
		if (!this.acquirenteDettaglio) return;
		const daModificare = { ...this.acquirenteDettaglio };
		this.chiudiDettaglio();
		this.apriModal(daModificare);
	}

	apriDettaglio(acquirente: Acquirente): void {
		this.acquirenteDettaglio = { ...acquirente };
		this.isDettaglioOpen = true;
	}

	chiudiDettaglio(): void {
		this.isDettaglioOpen = false;
		this.acquirenteDettaglio = null;
	}

	elimina(acquirente: Acquirente): void {
		const conferma = confirm('Sei sicuro di voler eliminare questo elemento?');
		if (!conferma) return;

		this.tariffaKmService.deleteAutomobile(acquirente.id).subscribe({
			next: (ok) => {
				if (ok === true) {
					this.listaAcquirenti = this.listaAcquirenti.filter((item) => item.id !== acquirente.id);
				}
			},
			error: (err) => {
				console.error('Errore eliminazione automobile', err);
			}
		});
	}

	private creaAcquirenteVuoto(): Acquirente {
		return { id: 0, marca: '', modello: '', targa: '', tariffaKm: 0, cilindrata: 0 };
	}

	private generaId(): number {
		if (this.listaAcquirenti.length === 0) return 1;
		return Math.max(...this.listaAcquirenti.map((item) => item.id)) + 1;
	}
}
