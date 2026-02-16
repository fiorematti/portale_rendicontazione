import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TariffaKmService } from './tariffa-km.service';
import { AutomobileDto } from '../../dto/automobile.dto';

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

	constructor(private readonly tariffaKmService: TariffaKmService) {}

	ngOnInit(): void {
		this.caricaAutomobili();
	}

	caricaAutomobili(): void {
		this.tariffaKmService.getAllAutomobili().subscribe({
			next: (data: AutomobileDto[]) => {
				this.listaAcquirenti = data.map((auto) => ({
					id: auto.idauto,
					marca: auto.marca,
					modello: auto.modello,
					targa: auto.targa,
					tariffaKm: auto.tariffaChilometrica,
					cilindrata: auto.cilindrata,
				}));
			},
			error: (err) => {
				console.error('Errore nel caricamento delle automobili', err);
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
		const { marca, modello, targa, tariffaKm, id } = this.acquirenteSelezionato;
		const tariffaValida = !Number.isNaN(Number(tariffaKm));
		const campiValidi = Boolean(marca.trim() && modello.trim() && targa.trim() && tariffaValida);

		if (!campiValidi) {
			this.mostraErrore = true;
			setTimeout(() => (this.mostraErrore = false), 3000);
			return;
		}

		if (this.isEditMode) {
			this.listaAcquirenti = this.listaAcquirenti.map((item) =>
				item.id === id ? { ...this.acquirenteSelezionato, tariffaKm: Number(tariffaKm) } : item
			);
		} else {
			const nuovoId = this.generaId();
			this.listaAcquirenti = [
				...this.listaAcquirenti,
				{ ...this.acquirenteSelezionato, id: nuovoId, tariffaKm: Number(tariffaKm) },
			];
		}

		this.chiudiModal();
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
		this.listaAcquirenti = this.listaAcquirenti.filter((item) => item.id !== acquirente.id);
	}

	private creaAcquirenteVuoto(): Acquirente {
		return { id: 0, marca: '', modello: '', targa: '', tariffaKm: 0, cilindrata: 0 };
	}

	private generaId(): number {
		if (this.listaAcquirenti.length === 0) return 1;
		return Math.max(...this.listaAcquirenti.map((item) => item.id)) + 1;
	}
}
