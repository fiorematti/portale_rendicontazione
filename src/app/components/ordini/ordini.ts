import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ordini',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ordini.html',
  styleUrl: './ordini.css',
})
export class OrdiniComponent implements OnInit {
  filtroTesto: string = '';
  filtroStato: string = '';
  mostraModal: boolean = false;
  mostraCalendario: boolean = false;
  mostraErrore: boolean = false;

  isModifica: boolean = false;
  indiceInModifica: number = -1;

  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  calendarDays: (number | null)[] = [];
  monthNames = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];

  nuovoOrdineDati = {
    id: '',
    cliente: '',
    dataInizio: '',
    stato: 'Ricevuto',
    codiceOfferta: ''
  };

  elencoOrdini = [
    { id: '1024', cliente: 'Azienda Alpha', dataInizio: '20/10/2025', codiceOfferta: '876702', stato: 'Fatto' },
    { id: '1025', cliente: 'Boutique Rossi', dataInizio: '30/09/2025', codiceOfferta: '213653', stato: 'Ricevuto' },
  ];

  ngOnInit(): void {
    this.generateCalendar();
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

  get nomeMeseAnno(): string {
    return `${this.monthNames[this.currentMonth]} ${this.currentYear}`;
  }

  selectDate(day: number | null): void {
    if (!day) return;
    const d = day.toString().padStart(2, '0');
    const m = (this.currentMonth + 1).toString().padStart(2, '0');
    this.nuovoOrdineDati.dataInizio = `${d}/${m}/${this.currentYear}`;
    this.mostraCalendario = false;
  }

  isSelected(day: number | null): boolean {
    if (!day) return false;
    const dateStr = `${day.toString().padStart(2, '0')}/${(this.currentMonth + 1).toString().padStart(2, '0')}/${this.currentYear}`;
    return this.nuovoOrdineDati.dataInizio === dateStr;
  }

  formattaData(event: any): void {
    let v = event.target.value.replace(/\D/g, '');
    if (v.length > 8) v = v.substring(0, 8);
    let final = '';
    if (v.length > 0) final += v.substring(0, 2);
    if (v.length > 2) final += '/' + v.substring(2, 4);
    if (v.length > 4) final += '/' + v.substring(4, 8);
    this.nuovoOrdineDati.dataInizio = final;
  }

  nuovoOrdine(): void {
    this.isModifica = false;
    this.mostraErrore = false;
    this.mostraModal = true;
  }

  modificaOrdine(ordine: any): void {
    this.isModifica = true;
    this.indiceInModifica = this.elencoOrdini.findIndex(o => o.id === ordine.id);
    this.nuovoOrdineDati = { ...ordine };
    this.mostraErrore = false;
    this.mostraModal = true;
  }

  chiudiModal(): void {
    this.mostraModal = false;
    this.isModifica = false;
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

  eliminaOrdine(ordine: any): void {
    if (confirm('Sei sicuro di voler eliminare questo ordine?')) {
      const index = this.elencoOrdini.findIndex(o => o.id === ordine.id);
      if (index !== -1) {
        this.elencoOrdini.splice(index, 1);
      }
    }
  }

  resetForm(): void {
    this.nuovoOrdineDati = {
      id: '',
      cliente: '',
      dataInizio: '',
      stato: 'Ricevuto',
      codiceOfferta: ''
    };
  }

  get ordiniFiltrati() {
    return this.elencoOrdini.filter(o =>
      (o.cliente + o.id).toLowerCase().includes(this.filtroTesto.toLowerCase()) &&
      (this.filtroStato === '' || o.stato === this.filtroStato)
    );
  }

  getBadgeClass(stato: string): string {
    return stato === 'Fatto' ? 'badge-success' : 'badge-warning';
  }
}