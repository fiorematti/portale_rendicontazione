import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { generateCalendarDays, navigateMonth, formatSelectedDay, isDaySelected, MONTH_NAMES_IT } from '../../shared/utils/calendar.utils';
import { creaIntervalloAnni, sanitizeDateInput } from '../../shared/utils/date.utils';
import { setBodyScrollLock } from '../../shared/utils/dom.utils';

interface Nota {
  id: string;
  data: string;
  totaleAnnullato: string;
  totaleComplessivo: string;
  totaleNonValidato: string;
  pagato: boolean;
  utente?: string;
}

type CalendarContext = 'filter' | 'form';

interface UtenteApi {
  idUtente: number;
  nome: string;
  cognome: string;
  email: string | null;
  ruolo: string;
  stato: boolean;
}

@Component({
  selector: 'app-registro-note',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './registro-note.html',
  styleUrl: './registro-note.css',
})
export class RegistroNoteComponent implements OnInit, OnDestroy {
  filtroTesto: string = '';
  filtroData: string = '';
  mostraModal: boolean = false;
  mostraCalendario: boolean = false;
  mostraErrore: boolean = false;
  calendarContext: CalendarContext = 'filter';
  isDettaglioOpen: boolean = false;
  notaDettaglio: Nota | null = null;

  showExportPopup = false;
  exportMese = new Date().getMonth();
  exportAnno = new Date().getFullYear();
  exportUtente: string = 'Tutti';
  readonly listaMesi = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  listaAnni: number[] = [];

  isModifica: boolean = false;
  indiceInModifica: number = -1;

  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  calendarDays: (number | null)[] = [];
  monthNames = MONTH_NAMES_IT;

  nuovaNota: Nota = this.buildNota();

  utentiExportOptions: string[] = ['Tutti'];
  isUtentiLoading = false;
  utentiLoaded = false;
  utentiLoadError: string | null = null;

  elencoNote: Nota[] = [
    { id: '1', data: '14/01/2026', totaleAnnullato: '25,00€', totaleComplessivo: '215,00€', totaleNonValidato: '190,00€', pagato: true, utente: 'Mario Rossi' },
    { id: '2', data: '15/01/2026', totaleAnnullato: '0,00€', totaleComplessivo: '120,00€', totaleNonValidato: '120,00€', pagato: false, utente: 'Lucia Bianchi' },
  ];

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    this.listaAnni = creaIntervalloAnni(2020, new Date().getFullYear() + 5);
    this.generateCalendar();
  }

  ngOnDestroy(): void {
    setBodyScrollLock(false);
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

  selectDate(day: number | null, context: CalendarContext = 'form'): void {
    if (!day) return;
    const selectedDate = formatSelectedDay(day, this.currentMonth, this.currentYear);
    if (context === 'filter') {
      this.filtroData = selectedDate;
    } else {
      this.nuovaNota.data = selectedDate;
    }
    this.mostraCalendario = false;
  }

  isSelected(day: number | null, context: CalendarContext = 'form'): boolean {
    const dateToCheck = context === 'form' ? this.nuovaNota.data : this.filtroData;
    return isDaySelected(day, dateToCheck, this.currentMonth, this.currentYear);
  }
  
  formattaDataNota(event: any): void {
    this.nuovaNota.data = sanitizeDateInput(event.target.value);
  }

  formattaDataFiltro(event: any): void {
    this.filtroData = sanitizeDateInput(event.target.value);
  }

  nuovaNotaFn(): void {
    this.apriModal('aggiungi');
  }

  toggleExportPopup(): void {
    this.showExportPopup = !this.showExportPopup;
    setBodyScrollLock(this.showExportPopup);
  }

  esportaDati(): void {
    console.log('[RegistroNote] export richiesta', {
      meseIndex: this.exportMese,
      anno: this.exportAnno,
      utente: this.exportUtente,
    });
    this.showExportPopup = false;
    setBodyScrollLock(false);
  }

  onUtentiDropdownOpen(): void {
    if (this.utentiLoaded || this.isUtentiLoading) return;
    this.isUtentiLoading = true;
    this.utentiLoadError = null;

    this.http.get<UtenteApi[]>('/api/Utente/admin/getAllUtenti').subscribe({
      next: (res) => {
        const names = res
          .map(u => `${u.nome ?? ''} ${u.cognome ?? ''}`.trim())
          .filter(Boolean);
        const uniqueNames = Array.from(new Set(names)).sort();
        this.utentiExportOptions = ['Tutti', ...uniqueNames];
        this.utentiLoaded = true;
      },
      error: (err) => {
        console.error('[RegistroNote] getAllUtenti error', err);
        this.utentiLoadError = 'Non è stato possibile caricare gli utenti.';
      },
      complete: () => {
        this.isUtentiLoading = false;
      }
    });
  }

  modificaNota(nota: Nota): void {
    this.isModifica = true;
    this.indiceInModifica = this.elencoNote.findIndex(n => n.id === nota.id);
    this.nuovaNota = { ...nota };
    this.mostraErrore = false;
    this.mostraModal = true;
  }

  openDettaglio(nota: Nota): void {
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
    if (!this.isNotaValida(this.nuovaNota)) {
      this.mostraErrore = true;
      setTimeout(() => (this.mostraErrore = false), 4000);
      return;
    }

    if (this.isModifica && this.indiceInModifica > -1) {
      this.elencoNote[this.indiceInModifica] = { ...this.nuovaNota };
    } else {
      this.elencoNote.unshift({ ...this.nuovaNota, id: this.nextId() });
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
    this.nuovaNota = this.buildNota();
  }


  get noteFiltrate() {
    return this.elencoNote.filter(n =>
      (n.totaleAnnullato + n.totaleComplessivo).toLowerCase().includes(this.filtroTesto.toLowerCase()) &&
      n.data.includes(this.filtroData)
    );
  }

  private apriModal(mode: 'aggiungi' | 'modifica'): void {
    this.isModifica = mode === 'modifica';
    this.mostraErrore = false;
    if (!this.isModifica) {
      this.resetForm();
      this.indiceInModifica = -1;
    }
    this.mostraModal = true;
  }

  private buildNota(): Nota {
    return {
      id: '',
      data: '',
      totaleAnnullato: '',
      totaleComplessivo: '',
      totaleNonValidato: '',
      pagato: false,
    };
  }

  private isNotaValida(nota: Nota): boolean {
    const { data, totaleAnnullato, totaleComplessivo, totaleNonValidato } = nota;
    return Boolean(data.trim() && totaleAnnullato.trim() && totaleComplessivo.trim() && totaleNonValidato.trim());
  }

  private nextId(): string {
    const maxId = this.elencoNote.reduce((acc, n) => Math.max(acc, Number(n.id) || 0), 0);
    return String(maxId + 1);
  }
}
