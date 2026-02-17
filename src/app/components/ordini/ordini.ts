import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { generateCalendarDays, navigateMonth, formatSelectedDay, isDaySelected, MONTH_NAMES_IT } from '../../shared/utils/calendar.utils';
import { sanitizeDateInput } from '../../shared/utils/date.utils';

interface Ordine {
  id: string;
  cliente: string;
  dataInizio: string;
  codiceOfferta: string;
  stato: 'Ricevuto' | 'Fatto' | string;
}

@Component({
  selector: 'app-ordini',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ordini.html',
  styleUrls: ['./ordini.css'],
})
export class OrdiniComponent implements OnInit {
  filtroTesto = '';
  filtroStato = '';
  mostraModal = false;
  mostraCalendario = false;
  mostraErrore = false;

  isModifica = false;
  isDettaglio = false;
  indiceInModifica = -1;

  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  calendarDays: (number | null)[] = [];

  nuovoOrdineDati: Ordine = this.creaOrdineVuoto();

  elencoOrdini: Ordine[] = [
    { id: '1024', cliente: 'Azienda Alpha', dataInizio: '20/10/2025', codiceOfferta: '876702', stato: 'Fatto' },
    { id: '1025', cliente: 'Boutique Rossi', dataInizio: '30/09/2025', codiceOfferta: '213653', stato: 'Ricevuto' },
  ];

  ngOnInit(): void {
    this.generateCalendar();
  }

  generateCalendar(): void {
    this.calendarDays = generateCalendarDays(this.currentYear, this.currentMonth);
  }

  prevMonth(event: Event): void {
    event.stopPropagation();
    const nav = navigateMonth(this.currentMonth, this.currentYear, -1);
    this.currentMonth = nav.month;
    this.currentYear = nav.year;
    this.generateCalendar();
  }

  nextMonth(event: Event): void {
    event.stopPropagation();
    const nav = navigateMonth(this.currentMonth, this.currentYear, 1);
    this.currentMonth = nav.month;
    this.currentYear = nav.year;
    this.generateCalendar();
  }

  get nomeMeseAnno(): string {
    return `${MONTH_NAMES_IT[this.currentMonth]} ${this.currentYear}`;
  }

  selectDate(day: number | null): void {
    if (!day) return;
    this.nuovoOrdineDati.dataInizio = formatSelectedDay(day, this.currentMonth, this.currentYear);
    this.mostraCalendario = false;
  }

  isSelected(day: number | null): boolean {
    return isDaySelected(day, this.nuovoOrdineDati.dataInizio, this.currentMonth, this.currentYear);
  }

  formattaData(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.nuovoOrdineDati.dataInizio = sanitizeDateInput(target.value);
  }

  visualizzaDettaglio(ordine: Ordine): void {
    this.isDettaglio = true;
    this.isModifica = false;
    this.nuovoOrdineDati = { ...ordine };
    this.mostraModal = true;
  }

  nuovoOrdine(): void {
    this.isDettaglio = false;
    this.isModifica = false;
    this.mostraErrore = false;
    this.mostraModal = true;
  }

  modificaOrdine(ordine: Ordine): void {
    this.isDettaglio = false;
    this.isModifica = true;
    this.indiceInModifica = this.elencoOrdini.findIndex(o => o.id === ordine.id);
    this.nuovoOrdineDati = { ...ordine };
    this.mostraErrore = false;
    this.mostraModal = true;
  }

  passaAModifica(): void {
    const ordineDaModificare = { ...this.nuovoOrdineDati };
    this.modificaOrdine(ordineDaModificare);
  }

  chiudiModal(): void {
    this.mostraModal = false;
    this.isModifica = false;
    this.isDettaglio = false;
    this.indiceInModifica = -1;
    this.resetForm();
    this.mostraCalendario = false;
    this.mostraErrore = false;
  }

  confermaOrdine(): void {
    const { id, cliente, dataInizio, codiceOfferta } = this.nuovoOrdineDati;
    const campiValidi = id.trim() && cliente.trim() && dataInizio.trim() && codiceOfferta.trim();

    if (!campiValidi) {
      this.mostraErrore = true;
      setTimeout(() => (this.mostraErrore = false), 4000);
      return;
    }

    if (this.isModifica) {
      this.elencoOrdini[this.indiceInModifica] = { ...this.nuovoOrdineDati };
    } else {
      this.elencoOrdini.unshift({ ...this.nuovoOrdineDati });
    }
    this.chiudiModal();
  }

  eliminaOrdine(ordine: Ordine): void {
    if (confirm('Sei sicuro di voler eliminare questo ordine?')) {
      const index = this.elencoOrdini.findIndex(o => o.id === ordine.id);
      if (index !== -1) {
        this.elencoOrdini.splice(index, 1);
      }
    }
  }

  resetForm(): void {
    this.nuovoOrdineDati = this.creaOrdineVuoto();
  }

  get ordiniFiltrati(): Ordine[] {
    return this.elencoOrdini.filter(o =>
      (o.cliente + o.id).toLowerCase().includes(this.filtroTesto.toLowerCase()) &&
      (this.filtroStato === '' || o.stato === this.filtroStato)
    );
  }

  getBadgeClass(stato: string): string {
    return stato === 'Fatto' ? 'badge-success' : 'badge-warning';
  }

  private creaOrdineVuoto(): Ordine {
    return { id: '', cliente: '', dataInizio: '', stato: 'Ricevuto', codiceOfferta: '' };
  }
}