import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Acquirente {
	id: number;
	utente: string;
	auto: string;
	tariffaKm: number;
}

@Component({
	selector: 'app-tariffa-km',
	standalone: true,
	imports: [CommonModule, FormsModule],
	templateUrl: './tariffa-km.html',
	styleUrls: ['./tariffa-km.css'],
})
export class TariffaKmComponent {
	listaAcquirenti: Acquirente[] = [
		{ id: 1, utente: 'Mario Neri', auto: 'Modello A', tariffaKm: 0.1234 },
		{ id: 2, utente: 'Andrea Bianchi', auto: 'Modello B', tariffaKm: 0.1234 },
		{ id: 3, utente: 'Luca Rossi', auto: 'Modello C', tariffaKm: 0.1234 },
	];

	filtroTesto = '';
	isModalOpen = false;
	isEditMode = false;
	mostraErrore = false;
	acquirenteSelezionato: Acquirente = this.creaAcquirenteVuoto();
	isDettaglioOpen = false;
	acquirenteDettaglio: Acquirente | null = null;

	get acquirentiFiltrati(): Acquirente[] {
		const filtro = this.filtroTesto.trim().toLowerCase();
		if (!filtro) return this.listaAcquirenti;
		return this.listaAcquirenti.filter((item) =>
			item.utente.toLowerCase().includes(filtro) || item.auto.toLowerCase().includes(filtro)
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
		const { utente, auto, tariffaKm, id } = this.acquirenteSelezionato;
		const tariffaValida = !Number.isNaN(Number(tariffaKm));
		const campiValidi = Boolean(utente.trim() && auto.trim() && tariffaValida);

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
		return { id: 0, utente: '', auto: '', tariffaKm: 0 };
	}

	private generaId(): number {
		if (this.listaAcquirenti.length === 0) return 1;
		return Math.max(...this.listaAcquirenti.map((item) => item.id)) + 1;
	}
}
