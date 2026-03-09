import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpResponse } from '@angular/common/http';
import { generateCalendarDays, navigateMonth, formatSelectedDay, isDaySelected, MONTH_NAMES_IT } from '../../shared/utils/calendar.utils';
import { creaIntervalloAnni, sanitizeDateInput } from '../../shared/utils/date.utils';
import { setBodyScrollLock } from '../../shared/utils/dom.utils';

interface Nota {
  id: string;
  data: string;
  totaleAnnullato: string;
  totaleComplessivo: string;
  totaleNonValidato: string;
  totaleValidato?: string;
  pagato: boolean;
  utente?: string;
  codiceOrdine?: string;
  idUtente?: number;
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

interface UtenteOption {
  id: number;
  label: string;
}

interface SpesaNotaApi {
  idSpesa?: number;
  idUtente?: number;
  nomeUtente?: string;
  idCliente?: number;
  codiceOrdine?: string;
  dataNotificazione?: string;
  data?: string;
  dataNota?: string;
  dataSpesa?: string;
  totaleComplessivo?: number | string;
  totaleValidato?: number | string;
  totale?: string | number;
  totaleRichiesto?: string | number;
  totaleNonValidato?: number | string;
  totaleNonVal?: string | number;
  totaleAnnullato?: number | string;
  annullato?: number | string;
  statoPagamento?: boolean;
  pagato?: boolean;
  isPagato?: boolean;
  paid?: boolean;
  nome?: string;
  cognome?: string;
  utente?: string;
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
  exportUtenteId: number | 'Tutti' = 'Tutti';
  readonly listaMesi = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  listaAnni: number[] = [];

  filtroMese = new Date().getMonth();
  filtroAnno = new Date().getFullYear();
  isMeseDropdownOpen = false;
  isAnnoDropdownOpen = false;

  isModifica: boolean = false;
  indiceInModifica: number = -1;

  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  calendarDays: (number | null)[] = [];
  monthNames = MONTH_NAMES_IT;

  nuovaNota: Nota = this.buildNota();

  utentiExportOptions: UtenteOption[] = [];
  isUtentiLoading = false;
  utentiLoaded = false;
  utentiLoadError: string | null = null;
  isExporting = false;
  exportError: string | null = null;

  elencoNote: Nota[] = [];

  isTableLoading = false;
  tableError: string | null = null;

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    this.listaAnni = creaIntervalloAnni(2020, new Date().getFullYear() + 5);
    this.generateCalendar();
    this.loadRegistroNote(this.filtroAnno, this.filtroMese + 1);
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
    if (this.showExportPopup) {
      this.exportError = null;
      this.isExporting = false;
    }
    setBodyScrollLock(this.showExportPopup);
  }

  esportaDati(): void {
    if (this.isExporting) return;
    this.exportError = null;
    this.isExporting = true;

    const params: Record<string, any> = {
      mese: this.exportMese + 1,
      anno: this.exportAnno,
    };
    if (this.exportUtenteId !== 'Tutti') {
      params['userId'] = this.exportUtenteId;
    }

    this.http.get('/api/SpesaNota/pdf', {
      params,
      observe: 'response',
      responseType: 'blob'
    }).subscribe({
      next: (res: HttpResponse<Blob>) => {
        this.downloadBlob(res, `NotaSpese_${params['anno']}_${String(params['mese']).padStart(2, '0')}.pdf`);
        this.showExportPopup = false;
        setBodyScrollLock(false);
      },
      error: (err) => {
        console.error('[RegistroNote] export pdf error', err);
        this.exportError = 'Errore durante l\'esportazione. Riprova.';
      },
      complete: () => {
        this.isExporting = false;
      }
    });
  }

  loadRegistroNote(year: number, month: number): void {
    this.isTableLoading = true;
    this.tableError = null;

    this.http.get<SpesaNotaApi[]>('/api/SpesaNota/Admin/GetSpeseByYearAndMonth', {
      params: { year, month }
    }).subscribe({
      next: (res) => {
        this.elencoNote = (res || []).map((item, idx) => this.mapApiToNota(item, idx));
      },
      error: (err) => {
        console.error('[RegistroNote] loadRegistroNote error', err);
        this.tableError = 'Errore nel caricamento delle note.';
      },
      complete: () => {
        this.isTableLoading = false;
      }
    });
  }

  onFiltroPeriodoChange(): void {
    this.loadRegistroNote(this.filtroAnno, this.filtroMese + 1);
  }

  toggleMeseDropdown(): void {
    this.isMeseDropdownOpen = !this.isMeseDropdownOpen;
    if (this.isMeseDropdownOpen) this.isAnnoDropdownOpen = false;
  }

  toggleAnnoDropdown(): void {
    this.isAnnoDropdownOpen = !this.isAnnoDropdownOpen;
    if (this.isAnnoDropdownOpen) this.isMeseDropdownOpen = false;
  }

  selezionaMese(idx: number, event: MouseEvent): void {
    event.stopPropagation();
    this.filtroMese = idx;
    this.isMeseDropdownOpen = false;
    this.onFiltroPeriodoChange();
  }

  selezionaAnno(anno: number, event: MouseEvent): void {
    event.stopPropagation();
    this.filtroAnno = anno;
    this.isAnnoDropdownOpen = false;
    this.onFiltroPeriodoChange();
  }

  onUtentiDropdownOpen(): void {
    if (this.utentiLoaded || this.isUtentiLoading) return;
    this.isUtentiLoading = true;
    this.utentiLoadError = null;

    this.http.get<UtenteApi[]>('/api/Utente/admin/getAllUtenti').subscribe({
      next: (res) => {
        const map = new Map<number, string>();
        res.forEach(u => {
          const label = `${u.nome ?? ''} ${u.cognome ?? ''}`.trim() || u.email || `Utente ${u.idUtente}`;
          map.set(u.idUtente, label);
        });
        this.utentiExportOptions = Array.from(map.entries())
          .map(([id, label]) => ({ id, label }))
          .sort((a, b) => a.label.localeCompare(b.label));
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
      [
        n.totaleAnnullato,
        n.totaleComplessivo,
        n.totaleNonValidato,
        n.totaleValidato ?? '',
        n.codiceOrdine ?? '',
        n.utente ?? ''
      ].join(' ').toLowerCase().includes(this.filtroTesto.toLowerCase())
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

  private mapApiToNota(api: SpesaNotaApi, idx: number): Nota {
    const isoDate = api.dataNotificazione || api.data || api.dataNota || api.dataSpesa || '';
    const dataVal = this.formatIsoDate(isoDate);
    const totaleComp = api.totaleComplessivo ?? api.totale ?? api.totaleRichiesto ?? '';
    const totaleNonVal = api.totaleNonValidato ?? api.totaleNonVal ?? 0;
    const totaleAnn = api.totaleAnnullato ?? api.annullato ?? 0;
    const pagatoVal = api.statoPagamento ?? api.pagato ?? api.isPagato ?? api.paid ?? false;
    const labelUtente = api.nomeUtente || api.utente || `${api.nome ?? ''} ${api.cognome ?? ''}`.trim();

    return {
      id: String(api.idSpesa ?? idx + 1),
      data: dataVal,
      totaleAnnullato: this.formatAmount(totaleAnn),
      totaleComplessivo: this.formatAmount(totaleComp),
      totaleNonValidato: this.formatAmount(totaleNonVal),
      totaleValidato: this.formatAmount(api.totaleValidato ?? 0),
      pagato: Boolean(pagatoVal),
      utente: labelUtente || undefined,
      codiceOrdine: api.codiceOrdine,
      idUtente: api.idUtente,
    };
  }

  private formatIsoDate(isoDate: string): string {
    if (!isoDate) return '';
    const parts = isoDate.split('T')[0]?.split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${d}/${m}/${y}`;
    }
    return isoDate;
  }

  private formatAmount(value: number | string | undefined): string {
    const num = typeof value === 'string' ? Number(value) : value;
    if (num === null || num === undefined || Number.isNaN(num)) return String(value ?? '');
    return new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num as number) + ' €';
  }

  private downloadBlob(res: HttpResponse<Blob>, fallbackName: string): void {
    const blob = res.body;
    if (!blob) return;
    let fileName = fallbackName;
    const disposition = res.headers.get('content-disposition');
    if (disposition) {
      const match = disposition.match(/filename\*?=UTF-8''([^;]+)|filename="?([^;"]+)"?/i);
      const extracted = match?.[1] || match?.[2];
      if (extracted) {
        fileName = decodeURIComponent(extracted);
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }
}
