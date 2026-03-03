import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { generateCalendarDays, navigateMonth, formatSelectedDay, isDaySelected, MONTH_NAMES_IT } from '../../shared/utils/calendar.utils';
import { sanitizeDateInput, formatDateIt } from '../../shared/utils/date.utils';

type FormatoExport = 'PDF' | 'EXCEL';
type StatoConvalidaFiltro = '' | 'convalidato' | 'da-convalidare';

/** Rappresenta un'attività nel registro convalide (admin). */
interface Attivita {
  nome: string;
  cognome: string;
  /** Data dell'attività in formato ISO (yyyy-MM-dd). */
  data: string;
  location: 'In sede' | 'Trasferta';
  convalidato: boolean;
}

/**
 * Componente per il registro delle attività (sezione admin/convalida).
 * Permette di filtrare, convalidare ed esportare le attività degli utenti.
 */
@Component({
  selector: 'app-registro-attivita',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro-attivita.html',
  styleUrl: './registro-attivita.css',
})
export class RegistroAttivitaComponent {
  // ── Dati attività ──────────────────────────────────────────────
  elencoAttivita: Attivita[] = [
    { nome: 'Giovanni', cognome: 'Bianchi', data: '2025-09-14', location: 'In sede', convalidato: false },
    { nome: 'Lorenzo', cognome: 'Ostuni', data: '2025-09-14', location: 'Trasferta', convalidato: false },
    { nome: 'Luca', cognome: 'Gini', data: '2025-09-14', location: 'In sede', convalidato: false },
    { nome: 'Giulia', cognome: 'Lilla', data: '2025-09-14', location: 'Trasferta', convalidato: false },
  ];

  // ── Filtri ─────────────────────────────────────────────────────
  filtroTesto: string = '';
  filtroData: string = '';
  filtroConvalida: StatoConvalidaFiltro = '';
  filtroLocation: string = '';

  // ── Esportazione ───────────────────────────────────────────────
  showExportPopup = false;
  exportMese: string = 'AUG';
  exportUtente: string = '';
  formatoSelezionato: FormatoExport | null = null;

  // ── Calendario ─────────────────────────────────────────────────
  showCalendar = false;
  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  calendarDays: (number | null)[] = [];
  monthNames = MONTH_NAMES_IT;

  constructor() {
    this.generateCalendar();
  }

  toggleExportPopup(): void {
    this.showExportPopup = !this.showExportPopup;
    if (!this.showExportPopup) this.formatoSelezionato = null;
  }

  selezionaFormato(f: FormatoExport): void {
    this.formatoSelezionato = f;
  }

  esportaDati(): void {
    if (!this.formatoSelezionato) {
      alert("Seleziona PDF o EXCEL");
      return;
    }
    alert("Esportazione avviata!");
    this.showExportPopup = false;
  }

  get countSelezionati(): number {
    return this.elencoAttivita.filter(a => a.convalidato).length;
  }

  /** Lista delle attività filtrate in base ai criteri attivi (testo, data, convalida, location). */
  get attivitaFiltrate() {
    const testo = this.filtroTesto.toLowerCase();
    return this.elencoAttivita.filter(a => {
      const matchTesto = (a.nome + ' ' + a.cognome).toLowerCase().includes(testo);
      const matchData = formatDateIt(a.data).includes(this.filtroData);
      const matchConvalida = this.matchesConvalida(a.convalidato, this.filtroConvalida);
      const matchLocation = this.filtroLocation === '' || a.location === this.filtroLocation;
      return matchTesto && matchData && matchConvalida && matchLocation;
    });
  }

  onDataInput(event: any): void {
    this.filtroData = sanitizeDateInput(event.target.value);
  }

  toggleCalendar(): void {
    this.showCalendar = !this.showCalendar;
    if (this.showCalendar) this.generateCalendar();
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

  selectDate(day: number | null): void {
    if (!day) return;
    this.filtroData = formatSelectedDay(day, this.currentMonth, this.currentYear);
    this.showCalendar = false;
  }

  isSelected(day: number | null): boolean {
    return isDaySelected(day, this.filtroData, this.currentMonth, this.currentYear);
  }

  toggleAll(event: any): void {
    const isChecked = event.target.checked;
    this.attivitaFiltrate.forEach(a => a.convalidato = isChecked);
  }

  /** Convalida in blocco tutte le attività selezionate. */
  confermaConvalide(): void {
    const count = this.countSelezionati;
    if (count > 0) {
      alert(`Hai convalidato con successo ${count} attività.`);
    }
  }

  private matchesConvalida(value: boolean, filtro: StatoConvalidaFiltro): boolean {
    if (filtro === 'convalidato') return value === true;
    if (filtro === 'da-convalidare') return value === false;
    return true;
  }
}