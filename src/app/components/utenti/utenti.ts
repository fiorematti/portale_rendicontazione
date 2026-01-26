import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Utente {
  nome: string;
  cognome: string;
  ruolo: string;
  attivo: boolean;
  email: string;
}

@Component({
  selector: 'app-utenti',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './utenti.html',
  styleUrls: ['./utenti.css'],
})
export class UtentiComponent {
  utentiOriginali: Utente[] = [
    { nome: 'Giovanni', cognome: 'Bianchi', ruolo: 'Admin', attivo: true, email: 'giovanni@syncpoint.it' },
    { nome: 'Lorenzo', cognome: 'Ostuni', ruolo: 'Amministratore', attivo: true, email: 'lorenzo@syncpoint.it' },
    { nome: 'Luca', cognome: 'Gini', ruolo: 'Amministratore', attivo: true, email: 'luca@syncpoint.it' },
    { nome: 'Giulia', cognome: 'Lilla', ruolo: 'Admin', attivo: false, email: 'giulia@syncpoint.it' },
  ];

  isModalOpen = false;
  isEditMode = false;
  mostraErrore = false;
  utenteSelezionatoIndex: number | null = null;

  nuovoUtente: Utente = this.creaUtenteVuoto();

  filtroTesto = '';
  filtroRuolo = '';
  filtroStato = '';

  isDettaglioOpen = false;
  utenteDettaglio: Utente | null = null;

  openModal(utente?: Utente, index?: number): void {
    if (utente !== undefined && index !== undefined) {
      this.isEditMode = true;
      this.utenteSelezionatoIndex = index;
      this.nuovoUtente = { ...utente };
    } else {
      this.isEditMode = false;
      this.resetForm();
    }
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.mostraErrore = false;
    this.resetForm();
    this.utenteSelezionatoIndex = null;
  }

  resetForm(): void {
    this.nuovoUtente = this.creaUtenteVuoto();
  }

  salvaUtente(): void {
    if (!this.nuovoUtente.nome || !this.nuovoUtente.cognome || !this.nuovoUtente.email || !this.nuovoUtente.ruolo) {
      this.mostraErrore = true;
      setTimeout(() => this.mostraErrore = false, 4000);
      return;
    }

    if (this.isEditMode && this.utenteSelezionatoIndex !== null) {
      this.utentiOriginali[this.utenteSelezionatoIndex] = { ...this.nuovoUtente };
    } else {
      this.utentiOriginali.push({ ...this.nuovoUtente, attivo: true });
    }

    this.closeModal();
  }

  get utentiFiltrati(): Utente[] {
    return this.utentiOriginali.filter(utente => {
      const matchTesto = (utente.nome + ' ' + utente.cognome).toLowerCase().includes(this.filtroTesto.toLowerCase());
      const matchRuolo = this.filtroRuolo ? utente.ruolo === this.filtroRuolo : true;
      const matchStato = this.filtroStato === '' ? true : (this.filtroStato === 'attivo' ? utente.attivo : !utente.attivo);
      return matchTesto && matchRuolo && matchStato;
    });
  }

  eliminaUtente(index: number): void {
    const conferma = confirm("Sei sicuro di voler eliminare questo utente?");
    if (conferma) {
      this.utentiOriginali.splice(index, 1);
    }
  }

  openDettaglio(utente: Utente): void {
    this.utenteDettaglio = { ...utente };
    this.isDettaglioOpen = true;
  }

  closeDettaglio(): void {
    this.isDettaglioOpen = false;
    this.utenteDettaglio = null;
  }

  passaAModificaDaDettaglio(): void {
    const utenteDettaglio = this.utenteDettaglio;
    if (!utenteDettaglio) return;
    const index = this.utentiOriginali.findIndex(u => u.email === utenteDettaglio.email);
    if (index === -1) return;
    this.utenteSelezionatoIndex = index;
    this.openModal(this.utentiOriginali[index], index);
    this.closeDettaglio();
  }

  private creaUtenteVuoto(): Utente {
    return { nome: '', cognome: '', email: '', ruolo: '', attivo: true };
  }
}