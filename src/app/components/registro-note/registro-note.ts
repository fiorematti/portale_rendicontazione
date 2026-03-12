import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { generateCalendarDays, navigateMonth, formatSelectedDay, isDaySelected, MONTH_NAMES_IT } from '../../shared/utils/calendar.utils';
import { creaIntervalloAnni, sanitizeDateInput } from '../../shared/utils/date.utils';
import { setBodyScrollLock } from '../../shared/utils/dom.utils';
import { downloadBlobFromResponse } from '../../shared/utils/file-download.utils';
import { RegistroNoteService, SpesaNotaApi, DettaglioSpesaApi, UtenteApi } from './registro-note.service';
import { AttachmentInfo } from '../../shared/models/attachment.model';
import {
  revokeIfObjectUrl,
  ensureAttachmentContainer,
  setAttachment as setAttachmentUtil,
  getAttachment as getAttachmentFromContainer,
  removeAttachmentFromContainer,
  showAttachmentPreview,
  closeAttachmentPreview,
  handleFileSelected,
  openFileUploader,
  createAttachmentState,
  AttachmentState,
} from '../../shared/utils/attachment.utils';

interface Nota {
  id: string;
  idSpesa?: number;
  data: string;
  totaleAnnullato: string;
  totaleComplessivo: string;
  totaleNonValidato: string;
  totaleValidato?: string;
  pagato: boolean;
  utente?: string;
  codiceOrdine?: string;
  idUtente?: number;
  /** Dettagli gestiti localmente per modifiche lato UI */
  dettagliLocali?: DettaglioSpesa[];
}

type CalendarContext = 'filter' | 'form' | 'dettaglio';

interface UtenteOption {
  id: number;
  label: string;
}

interface DettaglioSpesa {
  idDettaglio: number;
  dataDettaglio: string;
  vitto: number;
  hotel: number;
  trasporti: number;
  aereo: number;
  spesaVaria: number;
  auto: string;
  km: number;
  telepass: number;
  parking: number;
  costoKilometri: number;
  totale: number;
  statoApprovazione?: string;
  allegati: { fileName?: string; url?: string }[];
  attachments?: Record<string, AttachmentInfo>;
}

@Component({
  selector: 'app-registro-note',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'registro-note.html',
  styleUrl: './registro-note.css',
})
export class RegistroNoteComponent implements OnInit, OnDestroy {
  filtroTesto: string = '';
  filtroData: string = '';
  mostraModal: boolean = false;
  mostraCalendario: boolean = false;
  mostraErrore: boolean = false;
  calendarContext: CalendarContext = 'filter';
  calendarTarget: DettaglioSpesa | null = null;
  isDettaglioOpen: boolean = false;
  notaDettaglio: Nota | null = null;
  // Attachments state
  attachmentState = createAttachmentState();
  get mostraAttachmentPopup() { return this.attachmentState.mostraAttachmentPopup; }
  set mostraAttachmentPopup(v: boolean) { this.attachmentState.mostraAttachmentPopup = v; }
  get attachmentPreviewUrl() { return this.attachmentState.attachmentPreviewUrl; }
  set attachmentPreviewUrl(v: string | null) { this.attachmentState.attachmentPreviewUrl = v; }
  get attachmentPreviewType() { return this.attachmentState.attachmentPreviewType; }
  set attachmentPreviewType(v: 'image' | 'pdf' | null) { this.attachmentState.attachmentPreviewType = v; }
  get attachmentFileName() { return this.attachmentState.attachmentFileName; }
  set attachmentFileName(v: string) { this.attachmentState.attachmentFileName = v; }
  get currentAttachmentTarget() { return this.attachmentState.currentAttachmentTarget; }
  set currentAttachmentTarget(v: { tab: number; field: string } | null) { this.attachmentState.currentAttachmentTarget = v; }

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
  payingId: number | null = null;
  showValidazionePopup = false;
  notaDaValidare: Nota | null = null;
  isValidazioneLoading = false;
  validazioneError: string | null = null;
  validazioneLoadingId: number | null = null;
  dettagliSpesa: DettaglioSpesa[] = [];
  dettaglioTabAttiva = 0;
  isDettaglioLoading = false;
  dettaglioError: string | null = null;

  elencoNote: Nota[] = [];

  isTableLoading = false;
  tableError: string | null = null;

  constructor(private readonly registroNoteService: RegistroNoteService) {}

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
    } else if (context === 'dettaglio' && this.calendarTarget) {
      this.calendarTarget.dataDettaglio = selectedDate;
    } else {
      this.nuovaNota.data = selectedDate;
    }
    this.mostraCalendario = false;
    this.calendarTarget = null;
  }

  isSelected(day: number | null, context: CalendarContext = 'form'): boolean {
    const dateToCheck = context === 'form'
      ? this.nuovaNota.data
      : context === 'dettaglio'
        ? this.calendarTarget?.dataDettaglio || ''
        : this.filtroData;
    return isDaySelected(day, dateToCheck, this.currentMonth, this.currentYear);
  }
  
  formattaDataNota(event: any): void {
    this.nuovaNota.data = sanitizeDateInput(event.target.value);
  }

  apriCalendarioDettaglio(dett: DettaglioSpesa): void {
    // Toggle behavior: if calendar already open for the same dettaglio, close it
    if (this.mostraCalendario && this.calendarContext === 'dettaglio' && this.calendarTarget && this.calendarTarget.idDettaglio === dett.idDettaglio) {
      this.mostraCalendario = false;
      this.calendarTarget = null;
      this.calendarContext = 'filter';
      return;
    }

    this.calendarContext = 'dettaglio';
    this.calendarTarget = dett;
    this.mostraCalendario = true;
  }

  formattaDataFiltro(event: any): void {
    this.filtroData = sanitizeDateInput(event.target.value);
  }

  nuovaNotaFn(): void {
    this.dettagliSpesa = [this.buildDettaglioVuoto()];
    this.dettaglioTabAttiva = 0;
    this.notaDettaglio = null;
    this.apriModal('aggiungi');
    setBodyScrollLock(true);
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

    this.registroNoteService.exportPdf(params).subscribe({
      next: (res: HttpResponse<Blob>) => {
        downloadBlobFromResponse(res.body, res.headers, `NotaSpese_${params['anno']}_${String(params['mese']).padStart(2, '0')}.pdf`);
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

  pagaNota(nota: Nota): void {
    if (!nota.idSpesa && Number.isNaN(Number(nota.id))) {
      return;
    }
    const spesaId = nota.idSpesa ?? Number(nota.id);
    this.payingId = spesaId;
     this.registroNoteService.pagaSpese([spesaId]).subscribe({
       next: (res: HttpResponse<any>) => {
         console.log('[RegistroNote] pagaSpese response', res.status, res.body);
         // if backend reports success, reload list to reflect persisted state
         if (res.status >= 200 && res.status < 300) {
           this.loadRegistroNote(this.filtroAnno, this.filtroMese + 1);
         } else {
           this.tableError = `Server response ${res.status}`;
         }
       },
       error: (err) => {
         console.error('[RegistroNote] pagaSpese error', err);
         this.tableError = 'Errore durante l\'operazione di pagamento.';
       },
       complete: () => {
         this.payingId = null;
       }
     });
  }

    openValidazione(nota: Nota): void {
      this.notaDaValidare = nota;
      this.showValidazionePopup = true;
      setBodyScrollLock(true);
    }

    annullaValidazione(): void {
      this.showValidazionePopup = false;
      this.notaDaValidare = null;
      setBodyScrollLock(false);
    }

    confermaValidazione(): void {
      if (!this.notaDaValidare) return;
      const spesaId = this.notaDaValidare.idSpesa ?? Number(this.notaDaValidare.id);
      if (!spesaId) return;

      this.validazioneError = null;
      this.isValidazioneLoading = true;

      this.registroNoteService.validaDettaglio([spesaId]).subscribe({
        next: (res: HttpResponse<any>) => {
          const esito: string = (res.body?.esito || '').toLowerCase();
          console.log('[RegistroNote] validaDettaglio response', res.status, res.body);

          if (res.status >= 200 && res.status < 300 && !esito.includes('parzialmente')) {
            this.showValidazionePopup = false;
            this.notaDaValidare = null;
            setBodyScrollLock(false);
            // reload elenco to reflect new stato approvazione/pagato
            this.loadRegistroNote(this.filtroAnno, this.filtroMese + 1);
          } else {
            this.validazioneError = res.body?.esito || 'Operazione parzialmente riuscita.';
          }
        },
        error: (err) => {
          console.error('[RegistroNote] validaDettaglio error', err);
          this.validazioneError = 'Errore durante la validazione. Riprova.';
        },
        complete: () => {
          this.isValidazioneLoading = false;
        }
      });
    }

  loadDettagliSpesa(spesaId: number): void {
    this.isDettaglioLoading = true;
    this.dettaglioError = null;

    this.registroNoteService.getDettagliBySpesa(spesaId).subscribe({
      next: (res) => {
        this.dettagliSpesa = (res || []).map((item, idx) => this.mapDettaglio(item, idx));
        this.dettagliSpesa.forEach(d => this.syncTotaleDettaglio(d));
        this.dettaglioTabAttiva = 0;

        if (this.isModifica || this.mostraModal) {
          this.nuovaNota.dettagliLocali = this.cloneDettagli(this.dettagliSpesa);
        }

        if (!this.dettagliSpesa.length) {
          this.dettaglioError = 'Nessun dettaglio trovato per questa spesa.';
          this.dettagliSpesa.push(this.buildDettaglioVuoto());
        }
      },
      error: (err) => {
        console.error('[RegistroNote] loadDettagliSpesa error', err);
        this.dettaglioError = 'Errore nel caricamento dei dettagli della spesa.';
        if (!this.dettagliSpesa.length) {
          this.dettagliSpesa.push(this.buildDettaglioVuoto());
        }
      },
      complete: () => {
        this.isDettaglioLoading = false;
      }
    });
  }

  loadRegistroNote(year: number, month: number): void {
    this.isTableLoading = true;
    this.tableError = null;

    this.registroNoteService.getSpeseByYearAndMonth(year, month).subscribe({
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

  selezionaDettaglio(idx: number): void {
    this.dettaglioTabAttiva = idx;
    this.closeAttachmentPopup(true);
  }

  get dettaglioCorrente(): DettaglioSpesa | null {
    return this.dettagliSpesa[this.dettaglioTabAttiva] ?? null;
  }

  aggiungiDettaglio(): void {
    this.dettagliSpesa.push(this.buildDettaglioVuoto());
    this.dettaglioTabAttiva = this.dettagliSpesa.length - 1;
  }

  rimuoviDettaglioCorrente(): void {
    if (!this.dettagliSpesa.length) return;
    this.dettagliSpesa.splice(this.dettaglioTabAttiva, 1);
    this.dettaglioTabAttiva = Math.max(0, this.dettaglioTabAttiva - 1);
    if (!this.dettagliSpesa.length) {
      this.dettagliSpesa.push(this.buildDettaglioVuoto());
    }
  }

  formattaDataDettaglio(event: any, dett: DettaglioSpesa): void {
    dett.dataDettaglio = sanitizeDateInput(event.target.value);
  }

  onDettaglioValueChange(dett: DettaglioSpesa): void {
    this.syncTotaleDettaglio(dett);
  }

  calcolaTotaleDettaglio(dett: DettaglioSpesa): number {
    const somma =
      this.toNumber(dett.vitto) +
      this.toNumber(dett.hotel) +
      this.toNumber(dett.trasporti) +
      this.toNumber(dett.aereo) +
      this.toNumber(dett.spesaVaria) +
      this.toNumber(dett.telepass) +
      this.toNumber(dett.parking);
    const costoKm = this.toNumber(dett.km) * this.toNumber(dett.costoKilometri);
    return Number((somma + costoKm).toFixed(2));
  }

  private toNumber(value: number | string | undefined | null): number {
    const num = typeof value === 'string' ? Number(value.replace(',', '.')) : Number(value);
    return Number.isFinite(num) ? num : 0;
  }

  private syncTotaleDettaglio(dett: DettaglioSpesa): void {
    dett.totale = this.calcolaTotaleDettaglio(dett);
  }

  onToggleValidato(dett: DettaglioSpesa, value?: boolean): void {
    if (!dett) return;
    const nextVal = typeof value === 'boolean' ? value : !this.isValidato(dett);

    const idDett = dett.idDettaglio;
    if (!idDett) {
      dett.statoApprovazione = 'Non validato';
      return;
    }

    this.validazioneLoadingId = idDett;
    const request$ = nextVal
      ? this.registroNoteService.validaDettaglio([idDett])
      : this.registroNoteService.respingiDettaglio([idDett]);

    request$.subscribe({
      next: (res: HttpResponse<any>) => {
        const esito: string = (res.body?.esito || '').toLowerCase();
        const ok = res.status >= 200 && res.status < 300 && esito.includes('riuscita');
        dett.statoApprovazione = ok ? (nextVal ? 'Validato' : 'Non validato') : dett.statoApprovazione;
      },
      error: (err) => {
        console.error('[RegistroNote] toggleDettaglio validazione/respingi error', err);
      },
      complete: () => {
        this.validazioneLoadingId = null;
      }
    });
  }

  isValidato(dett: DettaglioSpesa | null | undefined): boolean {
    if (!dett) return false;
    return (dett.statoApprovazione || '').toLowerCase().includes('valid');
  }

  /** Attachments helpers (ispirati a Note Spese) */
  openAttachmentUploader(tabIndex: number, field: string): void {
    ensureAttachmentContainer(this.dettagliSpesa, tabIndex);
    openFileUploader(this.attachmentState, tabIndex, field, 'registroFileUploader');
  }

  onFileSelected(event: Event): void {
    handleFileSelected(event, this.attachmentState, this.dettagliSpesa);
  }

  getAttachment(tabIndex: number, field: string): AttachmentInfo | null {
    return getAttachmentFromContainer(this.dettagliSpesa, tabIndex, field);
  }

  openStoredAttachment(tabIndex: number, field: string): void {
    const att = this.getAttachment(tabIndex, field);
    if (!att) return;
    showAttachmentPreview(this.attachmentState, att);
  }

  removeAttachment(tabIndex: number, field: string): void {
    const prevUrl = this.attachmentPreviewUrl;
    const att = removeAttachmentFromContainer(this.dettagliSpesa, tabIndex, field);
    if (att && prevUrl === att.previewUrl) {
      this.closeAttachmentPopup();
    }
  }

  closeAttachmentPopup(clearTarget: boolean = false): void {
    closeAttachmentPreview(this.attachmentState, clearTarget);
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

    this.registroNoteService.getAllUtenti().subscribe({
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

  openDettaglio(nota: Nota): void {
    this.notaDettaglio = { ...nota };
    this.isDettaglioOpen = true;
    this.dettaglioError = null;
    this.dettagliSpesa = [];
    this.dettaglioTabAttiva = 0;
    const spesaId = nota.idSpesa ?? Number(nota.id);
    if (spesaId) {
      setBodyScrollLock(true);
      this.loadDettagliSpesa(spesaId);
    } else {
      this.dettagliSpesa = [this.buildDettaglioVuoto()];
      setBodyScrollLock(true);
    }
  }

  closeDettaglio(): void {
    this.isDettaglioOpen = false;
    this.notaDettaglio = null;
    this.dettagliSpesa = [];
    this.dettaglioError = null;
    this.isDettaglioLoading = false;
    this.closeAttachmentPopup(true);
    setBodyScrollLock(false);
  }

  chiudiModal(): void {
    this.mostraModal = false;
    this.isModifica = false;
    this.indiceInModifica = -1;
    this.notaDettaglio = null;
    this.resetForm();
    this.mostraCalendario = false;
    this.calendarTarget = null;
    this.mostraErrore = false;
    this.dettagliSpesa = [];
    this.dettaglioTabAttiva = 0;
    this.closeAttachmentPopup(true);
    setBodyScrollLock(false);
  }

  confermaNota(): void {
    if (!this.isNotaValida(this.nuovaNota)) {
      this.mostraErrore = true;
      setTimeout(() => (this.mostraErrore = false), 4000);
      return;
    }

    const dettagliClone = this.cloneDettagli(this.dettagliSpesa);
    const notaAggiornata = { ...this.nuovaNota, dettagliLocali: dettagliClone };

    if (this.isModifica && this.indiceInModifica > -1) {
      this.elencoNote[this.indiceInModifica] = notaAggiornata;
    } else {
      this.elencoNote.unshift({ ...notaAggiornata, id: this.nextId() });
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
    this.dettagliSpesa = [this.buildDettaglioVuoto()];
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

  private buildDettaglioVuoto(): DettaglioSpesa {
    return {
      idDettaglio: Date.now(),
      dataDettaglio: this.notaDettaglio?.data || '',
      vitto: 0,
      hotel: 0,
      trasporti: 0,
      aereo: 0,
      spesaVaria: 0,
      auto: '',
      km: 0,
      telepass: 0,
      parking: 0,
      costoKilometri: 0,
      totale: 0,
      statoApprovazione: '',
      allegati: [],
      attachments: {},
    };
  }

  private isNotaValida(nota: Nota): boolean {
    const { totaleAnnullato, totaleComplessivo, totaleNonValidato } = nota;
    return Boolean(totaleAnnullato.trim() && totaleComplessivo.trim() && totaleNonValidato.trim());
  }

  private nextId(): string {
    const maxId = this.elencoNote.reduce((acc, n) => Math.max(acc, Number(n.id) || 0), 0);
    return String(maxId + 1);
  }

  private cloneDettagli(dettagli: DettaglioSpesa[]): DettaglioSpesa[] {
    return dettagli.map(d => ({
      ...d,
      allegati: d.allegati ? [...d.allegati] : [],
      attachments: d.attachments ? { ...d.attachments } : {},
    }));
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
      idSpesa: api.idSpesa,
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

  private mapDettaglio(api: DettaglioSpesaApi, idx: number): DettaglioSpesa {
    const data = api.dataDettaglio ? this.formatIsoDate(api.dataDettaglio) : '';
    const trasportiVal = api.trasportiLocali ?? api.trasporti ?? 0;
    const spesaVariaVal = api.spesaVaria ?? api.varie ?? 0;
    const stato = api.statoApprovazione ?? '';

    return {
      idDettaglio: api.idDettaglio ?? idx + 1,
      dataDettaglio: data,
      vitto: api.vitto ?? 0,
      hotel: api.hotel ?? 0,
      trasporti: trasportiVal,
      aereo: api.aereo ?? 0,
      spesaVaria: spesaVariaVal,
      auto: api.auto ?? '',
      km: api.km ?? 0,
      telepass: api.telepass ?? 0,
      parking: api.parking ?? 0,
      costoKilometri: api.costoKilometri ?? 0,
      totale: api.totale ?? 0,
      statoApprovazione: stato,
      allegati: api.allegati ?? [],
      attachments: {},
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

}
