import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type FormatoExport = 'PDF' | 'EXCEL';
type StatoConvalidaFiltro = '' | 'convalidato' | 'da-convalidare';

interface Attivita {
  nome: string;
  cognome: string;
  data: string; // yyyy-mm-dd
  location: 'In sede' | 'Trasferta';
  convalidato: boolean;
}

@Component({
  selector: 'app-registro-attivita',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro-attivita.html',
  styleUrl: './registro-attivita.css',
})
export class RegistroAttivitaComponent {
  elencoAttivita: Attivita[] = [
    { nome: 'Giovanni', cognome: 'Bianchi', data: '2025-09-14', location: 'In sede', convalidato: false },
    { nome: 'Lorenzo', cognome: 'Ostuni', data: '2025-09-14', location: 'Trasferta', convalidato: false },
    { nome: 'Luca', cognome: 'Gini', data: '2025-09-14', location: 'In sede', convalidato: false },
    { nome: 'Giulia', cognome: 'Lilla', data: '2025-09-14', location: 'Trasferta', convalidato: false },
  ];

  filtroTesto: string = '';
  filtroData: string = '';
  filtroConvalida: StatoConvalidaFiltro = '';
  filtroLocation: string = '';

  showExportPopup = false;
  exportMese: string = 'AUG';
  exportUtente: string = '';
  formatoSelezionato: FormatoExport | null = null;

  showCalendar = false;
  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  calendarDays: (number | null)[] = [];
  monthNames = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];

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

  get attivitaFiltrate() {
    const testo = this.filtroTesto.toLowerCase();
    const dataFiltro = this.filtroData;
    return this.elencoAttivita.filter(a => {
      const matchTesto = (a.nome + ' ' + a.cognome).toLowerCase().includes(testo);
      const matchData = this.formatData(a.data).includes(dataFiltro);
      const matchConvalida = this.matchesConvalida(a.convalidato, this.filtroConvalida);
      const matchLocation = this.filtroLocation === '' || a.location === this.filtroLocation;
      return matchTesto && matchData && matchConvalida && matchLocation;
    });
  }

  onDataInput(event: any): void {
    this.filtroData = this.sanitizeDate(event.target.value);
  }

  toggleCalendar(): void {
    this.showCalendar = !this.showCalendar;
    if (this.showCalendar) this.generateCalendar();
  }

  generateCalendar(): void {
    this.calendarDays = [];
    const firstDayIndex = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    const offset = (firstDayIndex === 0) ? 6 : firstDayIndex - 1;
    for (let i = 0; i < offset; i++) this.calendarDays.push(null);
    for (let i = 1; i <= daysInMonth; i++) this.calendarDays.push(i);
  }

  prevMonth(event: Event): void {
    event.stopPropagation();
    this.currentMonth--;
    if (this.currentMonth < 0) { this.currentMonth = 11; this.currentYear--; }
    this.generateCalendar();
  }

  nextMonth(event: Event): void {
    event.stopPropagation();
    this.currentMonth++;
    if (this.currentMonth > 11) { this.currentMonth = 0; this.currentYear++; }
    this.generateCalendar();
  }

  selectDate(day: number | null): void {
    if (!day) return;
    const d = day.toString().padStart(2, '0');
    const m = (this.currentMonth + 1).toString().padStart(2, '0');
    this.filtroData = `${d}/${m}/${this.currentYear}`;
    this.showCalendar = false;
  }

  isSelected(day: number | null): boolean {
    if (!day) return false;
    const dateStr = `${day.toString().padStart(2, '0')}/${(this.currentMonth + 1).toString().padStart(2, '0')}/${this.currentYear}`;
    return this.filtroData === dateStr;
  }

  toggleAll(event: any): void {
    const isChecked = event.target.checked;
    this.attivitaFiltrate.forEach(a => a.convalidato = isChecked);
  }

  confermaConvalide(): void {
    const count = this.countSelezionati;
    if (count > 0) {
      alert(`Hai convalidato con successo ${count} attività.`);
    }
  }

  private sanitizeDate(raw: string): string {
    let v = raw.replace(/\D/g, '');
    if (v.length > 8) v = v.substring(0, 8);
    if (v.length > 4) return `${v.substring(0, 2)}/${v.substring(2, 4)}/${v.substring(4)}`;
    if (v.length > 2) return `${v.substring(0, 2)}/${v.substring(2)}`;
    return v;
  }

  private formatData(dateIso: string): string {
    const d = new Date(dateIso);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  }

  private matchesConvalida(value: boolean, filtro: StatoConvalidaFiltro): boolean {
    if (filtro === 'convalidato') return value === true;
    if (filtro === 'da-convalidare') return value === false;
    return true;
  }
}