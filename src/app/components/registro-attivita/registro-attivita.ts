import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { generateCalendarDays, navigateMonth, formatSelectedDay, isDaySelected, MONTH_NAMES_IT } from '../../shared/utils/calendar.utils';
import { sanitizeDateInput, formatDateIt } from '../../shared/utils/date.utils';

type FormatoExport = 'PDF' | 'EXCEL';
type StatoConvalidaFiltro = '' | 'convalidato' | 'da-convalidare';

interface AttivitaApi {
  idAttivita: number;
  name: string;
  codiceOrdine: string;
  nominativoCliente: string;
  stato_Approvazione: string;
  location: string;
  ore: number;
  dataAttivita: string;
}

interface Attivita {
  id: number;
  nome: string;
  cognome: string;
  codiceOrdine: string;
  cliente: string;
  statoApprovazione: string;
  location: string;
  ore: number;
  data: string; // yyyy-mm-dd
  convalidato: boolean;
}

interface UtenteExport {
  id: number;
  nome: string;
  cognome: string;
}

@Component({
  selector: 'app-registro-attivita',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './registro-attivita.html',
  styleUrl: './registro-attivita.css',
})
export class RegistroAttivitaComponent implements OnInit {
  elencoAttivita: Attivita[] = [];

  filtroTesto: string = '';
  filtroData: string = '';
  filtroConvalida: StatoConvalidaFiltro = '';
  filtroLocation: string = '';

  showExportPopup = false;
  exportMese: string = this.buildMonthValue(new Date().getMonth());
  exportUtente: number | null = null;
  formatoSelezionato: FormatoExport | null = null;
  utentiExport: UtenteExport[] = [];
  utentiLoaded = false;
  readonly exportMonths = [
    { label: 'Gen', value: '01' },
    { label: 'Feb', value: '02' },
    { label: 'Mar', value: '03' },
    { label: 'Apr', value: '04' },
    { label: 'Mag', value: '05' },
    { label: 'Giu', value: '06' },
    { label: 'Lug', value: '07' },
    { label: 'Ago', value: '08' },
    { label: 'Set', value: '09' },
    { label: 'Ott', value: '10' },
    { label: 'Nov', value: '11' },
    { label: 'Dic', value: '12' },
  ];

  showCalendar = false;
  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  calendarDays: (number | null)[] = [];
  monthNames = MONTH_NAMES_IT;

  isLoading = false;
  loadError: string | null = null;
  isValidating = false;
  validaError: string | null = null;
  isRejecting = false;
  rejectError: string | null = null;

  constructor(private readonly http: HttpClient) {
    this.generateCalendar();
  }

  ngOnInit(): void {
    this.loadAttivita();
  }

  toggleExportPopup(): void {
    this.showExportPopup = !this.showExportPopup;
    if (!this.showExportPopup) this.formatoSelezionato = null;
  }

  loadUtentiExport(): void {
    if (this.utentiLoaded) return;
    this.http.get<any[]>('/api/Utente/admin/getAllUtenti').subscribe({
      next: (res) => {
        this.utentiExport = (res || []).map(u => ({
          id: u.idUtente,
          nome: u.nome,
          cognome: u.cognome,
        }));
        this.utentiLoaded = true;
      },
      error: (err: HttpErrorResponse) => {
        console.error('[RegistroAttivita] getAllUtenti error', err);
      }
    });
  }

  selezionaFormato(f: FormatoExport): void {
    this.formatoSelezionato = f;
  }

  esportaDati(): void {
    if (!this.formatoSelezionato) {
      alert('Seleziona PDF o EXCEL');
      return;
    }

    const userId = Number(this.exportUtente || 0);
    if (!userId) {
      alert('Seleziona un utente per esportare.');
      return;
    }

    const year = this.currentYear || new Date().getFullYear();
    const monthParam = this.exportMese || this.buildMonthValue(new Date().getMonth());
    const endpoint = this.formatoSelezionato === 'PDF'
      ? '/api/Attivita/admin/pdfMensile'
      : '/api/Attivita/admin/excelMensile';
    const estensione = this.formatoSelezionato === 'PDF' ? 'pdf' : 'xlsx';

    this.http.get(endpoint, {
      params: {
        userId: userId.toString(),
        year: year.toString(),
        month: monthParam,
      },
      responseType: 'blob'
    }).subscribe({
      next: (blob: Blob) => {
        const filename = `Riepilogo_${userId}_${year}_${monthParam}.${estensione}`;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        this.showExportPopup = false;
        this.formatoSelezionato = null;
      },
      error: (err: HttpErrorResponse) => {
        console.error('[RegistroAttivita] export error', err);
        alert('Errore durante l\'export.');
      }
    });
  }

  get countSelezionati(): number {
    return this.elencoAttivita.filter(a => a.convalidato).length;
  }

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
    this.loadAttivita();
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
    this.loadAttivita();
  }

  isSelected(day: number | null): boolean {
    return isDaySelected(day, this.filtroData, this.currentMonth, this.currentYear);
  }

  toggleAll(event: any): void {
    const isChecked = event.target.checked;
    this.attivitaFiltrate.forEach(a => a.convalidato = isChecked);
  }

  confermaConvalide(): void {
    const ids = this.elencoAttivita.filter(a => a.convalidato).map(a => a.id);
    if (!ids.length || this.isValidating) return;

    this.isValidating = true;
    this.validaError = null;

    this.http.put('/api/Attivita/admin/validaAttivita', ids, { observe: 'response' }).subscribe({
      next: (res) => {
        const ok = res.status >= 200 && res.status < 300;
        if (ok) {
          this.loadAttivita();
        } else {
          this.validaError = 'Validazione non riuscita.';
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('[RegistroAttivita] validaAttivita error', err);
        this.validaError = 'Errore durante la validazione.';
      },
      complete: () => {
        this.isValidating = false;
      }
    });
  }

  respingiConvalide(): void {
    const ids = this.elencoAttivita.filter(a => a.convalidato).map(a => a.id);
    if (!ids.length || this.isRejecting) return;

    this.isRejecting = true;
    this.rejectError = null;

    this.http.put('/api/Attivita/admin/rifiutaAttivita', ids, { observe: 'response' }).subscribe({
      next: (res) => {
        const ok = res.status >= 200 && res.status < 300;
        if (ok) {
          this.loadAttivita();
        } else {
          this.rejectError = 'Rifiuto non riuscito.';
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('[RegistroAttivita] rifiutaAttivita error', err);
        this.rejectError = 'Errore durante il rifiuto delle attività.';
      },
      complete: () => {
        this.isRejecting = false;
      }
    });
  }

  loadAttivita(): void {
    this.isLoading = true;
    this.loadError = null;
    const dataParam = this.buildDateParam(this.filtroData);

    this.http.get<AttivitaApi[]>('/api/Attivita/admin/getAllAttivita', {
      params: { data: dataParam }
    }).subscribe({
      next: (res) => {
        this.elencoAttivita = (res || []).map(a => this.mapApiToAttivita(a));
      },
      error: (err: HttpErrorResponse) => {
        console.error('[RegistroAttivita] loadAttivita error', err);
        this.loadError = 'Errore nel caricamento delle attività.';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  private mapApiToAttivita(api: AttivitaApi): Attivita {
    const fullName = (api.name || '').trim();
    const [nome, ...rest] = fullName.split(' ');
    const cognome = rest.join(' ').trim();
    const stato = api.stato_Approvazione || '';
    const convalidato = stato.toLowerCase().includes('valid');

    return {
      id: api.idAttivita,
      nome: nome || fullName,
      cognome,
      codiceOrdine: api.codiceOrdine,
      cliente: api.nominativoCliente,
      statoApprovazione: stato,
      location: api.location,
      ore: api.ore,
      data: api.dataAttivita,
      convalidato,
    };
  }

  private buildDateParam(value: string): string {
    const todayIso = new Date().toISOString().split('T')[0];
    if (!value) return todayIso;
    const parts = value.split('/');
    if (parts.length === 3) {
      const [d, m, y] = parts;
      return `${y}-${m}-${d}`;
    }
    return todayIso;
  }

  private matchesConvalida(value: boolean, filtro: StatoConvalidaFiltro): boolean {
    if (filtro === 'convalidato') return value === true;
    if (filtro === 'da-convalidare') return value === false;
    return true;
  }

  private buildMonthValue(index: number): string {
    const m = index + 1;
    return m < 10 ? `0${m}` : `${m}`;
  }
}