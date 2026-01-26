import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registro-note',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro-note.html',
  styleUrl: './registro-note.css',
})
export class RegistroNoteComponent implements OnInit {
  filtroTesto: string = '';
  filtroData: string = '';
  mostraModal: boolean = false;
  mostraCalendario: boolean = false;
  mostraErrore: boolean = false;
  calendarContext: 'filter' | 'form' = 'filter';
  isDettaglioOpen: boolean = false;
  notaDettaglio: any = null;

  showExportPopup = false;
  exportMese: string = 'AUG';
  exportUtente: string = '';
  formatoSelezionato: 'PDF' | 'EXCEL' | null = null;

  isModifica: boolean = false;
  indiceInModifica: number = -1;

  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  calendarDays: (number | null)[] = [];
  monthNames = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];

  nuovaNota = {
    id: '',
    data: '',
    codiceOrdine: '',
    totalePagato: '',
    totaleValidato: '',
    pagato: false
  };

  elencoNote = [
    { id: '1', data: '14/01/2026', codiceOrdine: 'AAAA/xxxx', totalePagato: '215,00€', totaleValidato: '190,00€', pagato: true },
    { id: '2', data: '15/01/2026', codiceOrdine: 'BBBB/yyyy', totalePagato: '120,00€', totaleValidato: '120,00€', pagato: false },
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

  selectDate(day: number | null, context: 'filter' | 'form' = 'form'): void {
    if (!day) return;
    const d = day.toString().padStart(2, '0');
    const m = (this.currentMonth + 1).toString().padStart(2, '0');
    const selectedDate = `${d}/${m}/${this.currentYear}`;
    if (context === 'filter') {
      this.filtroData = selectedDate;
    } else {
      this.nuovaNota.data = selectedDate;
    }
    this.mostraCalendario = false;
  }

  isSelected(day: number | null): boolean {
    if (!day) return false;
    const dateStr = `${day.toString().padStart(2, '0')}/${(this.currentMonth + 1).toString().padStart(2, '0')}/${this.currentYear}`;
    return this.nuovaNota.data === dateStr;
  }
  
  formattaDataNota(event: any): void {
    let v = event.target.value.replace(/\D/g, '');
    if (v.length > 8) v = v.substring(0, 8);
    let final = '';
    if (v.length > 0) final += v.substring(0, 2);
    if (v.length > 2) final += '/' + v.substring(2, 4);
    if (v.length > 4) final += '/' + v.substring(4, 8);
    this.nuovaNota.data = final;
  }

  formattaDataFiltro(event: any): void {
    let v = event.target.value.replace(/\D/g, '');
    if (v.length > 8) v = v.substring(0, 8);
    let final = '';
    if (v.length > 0) final += v.substring(0, 2);
    if (v.length > 2) final += '/' + v.substring(2, 4);
    if (v.length > 4) final += '/' + v.substring(4, 8);
    this.filtroData = final;
  }

  nuovaNotaFn(): void {
    this.isModifica = false;
    this.mostraErrore = false;
    this.resetForm();
    this.mostraModal = true;
  }

  toggleExportPopup(): void {
    this.showExportPopup = !this.showExportPopup;
    if (!this.showExportPopup) this.formatoSelezionato = null;
  }

  selezionaFormato(f: 'PDF' | 'EXCEL'): void {
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

  modificaNota(nota: any): void {
    this.isModifica = true;
    this.indiceInModifica = this.elencoNote.findIndex(n => n.id === nota.id);
    this.nuovaNota = { ...nota };
    this.mostraModal = true;
  }

  openDettaglio(nota: any): void {
    this.notaDettaglio = { ...nota };
    this.isDettaglioOpen = true;
  }

  closeDettaglio(): void {
    this.isDettaglioOpen = false;
    this.notaDettaglio = null;
  }

  passaAModificaDaDettaglio(): void {
    if (!this.notaDettaglio) return;
    this.modificaNota(this.notaDettaglio);
    this.closeDettaglio();
  }

  chiudiModal(): void {
    this.mostraModal = false;
    this.isModifica = false;
    this.indiceInModifica = -1;
    this.resetForm();
    this.mostraCalendario = false;
    this.mostraErrore = false;
  }

  confermaNota(): void {
    const { data, codiceOrdine, totalePagato, totaleValidato } = this.nuovaNota;
    const campiValidi = data.trim() && codiceOrdine.trim() && totalePagato.trim() && totaleValidato.trim();

    if (!campiValidi) {
      this.mostraErrore = true;
      setTimeout(() => (this.mostraErrore = false), 4000);
      return;
    }

    if (this.isModifica) {
      this.elencoNote[this.indiceInModifica] = { ...this.nuovaNota };
    } else {
      const newId = (this.elencoNote.length + 1).toString();
      this.elencoNote.unshift({ ...this.nuovaNota, id: newId });
    }
    this.chiudiModal();
  }

  eliminaNota(nota: any): void {
    if (confirm('Sei sicuro di voler eliminare questa nota?')) {
      const index = this.elencoNote.findIndex(n => n.id === nota.id);
      if (index !== -1) {
        this.elencoNote.splice(index, 1);
      }
    }
  }

  resetForm(): void {
    this.nuovaNota = {
      id: '',
      data: '',
      codiceOrdine: '',
      totalePagato: '',
      totaleValidato: '',
      pagato: false
    };
  }

  get noteFiltrate() {
    return this.elencoNote.filter(n =>
      (n.codiceOrdine + n.totalePagato).toLowerCase().includes(this.filtroTesto.toLowerCase()) &&
      n.data.includes(this.filtroData)
    );
  }
}
