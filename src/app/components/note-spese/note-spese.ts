import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgIf, NgForOf, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoteSpeseService, DettaglioApiResponse, AddSpesaRequest, UpdateSpesaRequest } from './note-spese.service';
import { ClientiOrdiniService } from '../../shared/services/clienti-ordini.service';
import { ClienteApiItem } from '../../dto/cliente.dto';
import { OrdineApiItem } from '../../dto/ordine.dto';
import { clampNonNegative, blockNegative } from '../../shared/utils/input.utils';
import { parseDateString, formatDateIt, formatDateISO, sanitizeDateInput } from '../../shared/utils/date.utils';


interface Spesa {
  id?: number | null;
  data: string;
  codice: string;
  richiesto: string;
  validato: string;
  pagato: boolean;
  idCliente?: number | null;
}


interface DettaglioSpesa {
  idDettaglio?: number;
  idCliente?: number | null;
  nominativoCliente?: string | null;
  codiceOrdine: string;
  vitto?: number | null;
  alloggio?: number | null;
  hotel?: number | null;
  trasporti?: number | null;
  aereo?: number | null;
  varie?: number | null;
  auto?: string;
  km?: number | null;
  parking?: number | null;
  telepass?: number | null;
  costo?: number | null;
  idAuto?: number;
}


@Component({
  selector: 'app-note-spese',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgForOf, NgClass],
  templateUrl: './note-spese.html',
  styleUrl: './note-spese.css',
})






export class NoteSpese implements OnInit, OnDestroy {
  private readonly filtroDefault = 'Tutti';
  readonly clientiOptions: ClienteApiItem[] = [];
  private ordiniCache: Record<number, OrdineApiItem[]> = {};

  ordini: OrdineApiItem[] = [];
  selectedCodiceOrdine = '';


  listaSpese: Spesa[] = [];
  loading = false;
  errore: string | null = null;


  filtroPagate = this.filtroDefault;
  filtroData = '';
  filtroCliente: number | 'Tutti' = this.filtroDefault;
  filtroOrdine = this.filtroDefault;
  filtroOrdiniOptions: string[] = [];


  mostraModal = false;
  modalMode: 'aggiungi' | 'visualizza' | 'modifica' = 'aggiungi';
  nuovaSpesaData = '';
  tabAttiva = 0;
  dettagliSpesa: DettaglioSpesa[] = [];
  mostraErrore = false;
  salvaInCorso = false;
  salvaErrore = '';
  loadErrore = '';
  private clientiLoaded = false;
  isClientiLoading = false;
  isOrdiniLoading = false;
  isSpeseLoading = false;
  deletingSpesaId: number | null = null;
  isDettaglioLoading = false;


  rigaSelezionata: Spesa | null = null;


  mostraCalendario = false;
  targetData: 'filtro' | 'popup' = 'filtro';


  readonly listaMesi = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  listaAnni: number[] = [];


  meseFiltro = new Date().getMonth();
  annoFiltro = new Date().getFullYear();


  mostraCalendarioPopup = false;
  dataVisualizzataPopup: Date = new Date();
  giorniDelMesePopup: number[] = [];
  giorniVuotiPopup: number[] = [];


  get isAggiungi(): boolean { return this.modalMode === 'aggiungi'; }
  get isVisualizza(): boolean { return this.modalMode === 'visualizza'; }
  get isModifica(): boolean { return this.modalMode === 'modifica'; }


  constructor(
    private readonly noteSpeseService: NoteSpeseService,
    private readonly clientiOrdiniService: ClientiOrdiniService
  ) {}


  ngOnInit(): void {
    this.listaAnni = this.creaIntervalloAnni();
    this.syncDateStrings('filtro');
    this.syncDatePopupFromString();
    this.generaCalendarioPopup();
    this.loadClienti();
    this.loadSpese();
    this.resetNuovaSpesa();
     this.clientiOrdiniService.getOrdini().subscribe({
      next: res => this.ordini = res || [],
      error: () => this.ordini = []
    });
  }


  ngOnDestroy(): void {
    this.setBodyScrollLock(false);
  }


  visualizzaDettaglio(spesa: Spesa): void {
    this.rigaSelezionata = spesa;
    this.nuovaSpesaData = spesa.data;
    this.apriModalConModalita('visualizza');


    if (spesa.id != null) {
      this.isDettaglioLoading = true;
      this.noteSpeseService.getDettagliBySpesa(spesa.id).subscribe({
        next: (res) => {
          if (res && res.length > 0) {
            this.dettagliSpesa = res.map(item => this.mapDettaglioApiToDettaglioSpesa(item, spesa));
          } else {
            this.caricaDatiNellaModal(spesa);
          }
          this.tabAttiva = 0;
        },
        error: (err) => {
          console.error('[NoteSpese] getDettagliBySpesa error:', err);
          this.caricaDatiNellaModal(spesa);
        },
        complete: () => {
          this.isDettaglioLoading = false;
        }
      });
    } else {
      this.caricaDatiNellaModal(spesa);
    }
  }


  private mapDettaglioApiToDettaglioSpesa(item: DettaglioApiResponse, spesa: Spesa): DettaglioSpesa {
    const ordine = this.findOrdineByCodice(spesa.codice);
    const cliente = ordine ? this.clientiOptions.find(c => c.idCliente === ordine.idCliente) : null;
    return {
      idDettaglio: item.idDettaglio ?? 0,
      idCliente: ordine?.idCliente ?? spesa.idCliente ?? null,
      nominativoCliente: cliente?.nominativo ?? null,
      codiceOrdine: spesa.codice,
      vitto: item.vitto ?? 0,
      alloggio: 0,
      hotel: item.hotel ?? 0,
      trasporti: item.trasportiLocali ?? 0,
      aereo: item.aereo ?? 0,
      varie: item.spesaVaria ?? 0,
      auto: item.idAuto != null ? String(item.idAuto) : 'Modello auto',
      km: item.km ?? 0,
      parking: item.parking ?? 0,
      telepass: item.telepass ?? 0,
      costo: 0
    };
  }


  apriModifica(spesa: Spesa): void {
    this.rigaSelezionata = spesa;
    this.nuovaSpesaData = spesa.data;
    this.apriModalConModalita('modifica');


    if (spesa.id != null) {
      this.isDettaglioLoading = true;
      this.noteSpeseService.getDettagliBySpesa(spesa.id).subscribe({
        next: (res) => {
          if (res && res.length > 0) {
            this.dettagliSpesa = res.map(item => this.mapDettaglioApiToDettaglioSpesa(item, spesa));
          } else {
            this.caricaDatiNellaModal(spesa);
          }
          this.tabAttiva = 0;
        },
        error: (err) => {
          console.error('[NoteSpese] getDettagliBySpesa error:', err);
          this.caricaDatiNellaModal(spesa);
        },
        complete: () => {
          this.isDettaglioLoading = false;
        }
      });
    } else {
      this.caricaDatiNellaModal(spesa);
    }
  }


  eliminaSpesa(indexTable: number): void {
    const spesaDaEliminare = this.speseFiltrate[indexTable];
    if (!spesaDaEliminare) return;
    const indexReale = this.listaSpese.indexOf(spesaDaEliminare);
    if (!confirm('Sei sicuro di voler eliminare questa nota spesa?')) return;


    if (spesaDaEliminare.id != null) {
      this.deletingSpesaId = spesaDaEliminare.id;
      this.noteSpeseService.deleteSpesa(spesaDaEliminare.id).subscribe({
        next: (res) => {
          const esitoOk = typeof res?.esito === 'string' ? res.esito.toLowerCase().includes('riuscita') : true;
          if (esitoOk) {
            if (indexReale >= 0) this.listaSpese.splice(indexReale, 1);
            this.rebuildFiltroOrdiniOptions();
          } else {
            this.loadErrore = res?.motivazione || 'Eliminazione non riuscita.';
          }
        },
        error: (err) => {
          console.error('DeleteSpesa error:', err);
          this.loadErrore = 'Errore durante l\'eliminazione della spesa.';
        },
        complete: () => {
          this.deletingSpesaId = null;
        }
      });
    } else {
      if (indexReale >= 0) this.listaSpese.splice(indexReale, 1);
      this.rebuildFiltroOrdiniOptions();
    }
  }


  private caricaDatiNellaModal(spesa: Spesa): void {
    this.nuovaSpesaData = spesa.data;
    const importoPulito = this.parseImporto(spesa.richiesto);
    const ordine = this.findOrdineByCodice(spesa.codice);
    const cliente = ordine ? this.clientiOptions.find(c => c.idCliente === ordine.idCliente) : null;
   
    this.dettagliSpesa = [{
      idCliente: ordine?.idCliente ?? null,
      nominativoCliente: cliente?.nominativo ?? null,
      codiceOrdine: spesa.codice,
      vitto: importoPulito,
      alloggio: 0,
      hotel: 0,
      trasporti: 0,
      aereo: 0,
      varie: 0,
      auto: 'Modello auto',
      km: 0,
      parking: 0,
      telepass: 0,
      costo: 0
    }];
    this.tabAttiva = 0;
  }


  confermaSpesa(): void {
    const dett = this.dettagliSpesa[this.tabAttiva] || this.dettagliSpesa[0];
    if (!this.isDettaglioValido(dett)) {
      this.mostraErrore = true;
      setTimeout(() => (this.mostraErrore = false), 4000);
      return;
    }
    this.salvaErrore = '';
    this.salvaInCorso = true;


    if (this.isAggiungi) {
      const payload = this.buildAddPayload();
      this.noteSpeseService.addSpesa(payload).subscribe({
        next: (ok) => {
          if (ok === true) {
            const totaleStringa = this.formattaTotale(this.totaleCalcolato);
            this.listaSpese.unshift(this.creaSpesaDaDettaglio(dett, totaleStringa));
            this.chiudiModal();
          } else {
            this.salvaErrore = 'Salvataggio non riuscito.';
          }
        },
        error: (err) => {
          console.error('AddSpesa error', err);
          this.salvaErrore = 'Errore durante il salvataggio della spesa.';
        },
        complete: () => { this.salvaInCorso = false; }
      });
    } else if (this.isModifica && this.rigaSelezionata) {
      const payload = this.buildUpdatePayload();
      this.noteSpeseService.updateSpesa(payload).subscribe({
        next: (res) => {
          const esitoOk = typeof res?.esito === 'string' && res.esito.toLowerCase().includes('riuscita');
          if (esitoOk) {
            const totaleStringa = this.formattaTotale(this.totaleCalcolato);
            this.rigaSelezionata!.data = this.nuovaSpesaData;
            this.rigaSelezionata!.codice = dett.codiceOrdine;
            this.rigaSelezionata!.richiesto = totaleStringa;
            this.chiudiModal();
          } else {
            this.salvaErrore = res?.motivazione || 'Aggiornamento non riuscito.';
          }
        },
        error: (err) => {
          console.error('UpdateSpesa error', err);
          this.salvaErrore = 'Errore durante l\'aggiornamento della spesa.';
        },
        complete: () => { this.salvaInCorso = false; }
      });
    } else if (this.rigaSelezionata) {
      const totaleStringa = this.formattaTotale(this.totaleCalcolato);
      this.rigaSelezionata.data = this.nuovaSpesaData;
      this.rigaSelezionata.codice = dett.codiceOrdine;
      this.rigaSelezionata.richiesto = totaleStringa;
      this.salvaInCorso = false;
      this.chiudiModal();
    }
  }


  resetNuovaSpesa(): void {
    this.nuovaSpesaData = '';
    this.dettagliSpesa = [{
      idCliente: null,
      nominativoCliente: null,
      codiceOrdine: '',
      vitto: null,
      auto: 'Modello auto'
    }];
    this.tabAttiva = 0;
    this.rigaSelezionata = null;
    this.mostraErrore = false;
    this.syncDatePopupFromString();
    this.generaCalendarioPopup();
    // se i clienti sono già caricati preimposta il primo
    if (this.clientiLoaded && this.clientiOptions.length) {
      const first = this.clientiOptions[0];
      this.dettagliSpesa[0].idCliente = first.idCliente;
      this.dettagliSpesa[0].nominativoCliente = first.nominativo;
      this.loadOrdiniByCliente(first.idCliente, this.dettagliSpesa[0]);
    }
  }


  apriModalSpesa(): void {
    this.resetNuovaSpesa();
    this.apriModalConModalita('aggiungi');
  }


  chiudiModal(): void {
    this.mostraModal = false;
    this.mostraCalendario = false;
    this.rigaSelezionata = null;
    this.mostraErrore = false;
    this.setBodyScrollLock(false);
  }


  get totaleCalcolato(): number {
    return this.dettagliSpesa.reduce((acc, dett) => acc + this.sommaDettaglio(dett), 0);
  }


  onCambioMeseAnno(target: 'filtro' | 'popup'): void {
    if (target === 'filtro') {
      this.syncDateStrings('filtro');
    }
  }


  formattaData(event: Event, campo: string): void {
    const target = event.target as HTMLInputElement;
    const v = sanitizeDateInput(target.value);
    if (campo === 'filtro') this.filtroData = v; else this.nuovaSpesaData = v;
  }


  get speseFiltrate(): Spesa[] {
    const filtroDate = parseDateString(this.filtroData);
    return this.listaSpese.filter((s) => {
      const mPagato = this.filtroPagate === this.filtroDefault || (this.filtroPagate === 'Si' ? s.pagato : !s.pagato);
      let mData = true;
      if (this.filtroData && filtroDate) {
        const sd = parseDateString(s.data);
        mData = sd ? sd.getFullYear() === filtroDate.getFullYear() && sd.getMonth() === filtroDate.getMonth() : false;
      }
      const mOrdine = this.filtroOrdine === this.filtroDefault || s.codice === this.filtroOrdine;
      const idClienteSpesa = s.idCliente ?? this.resolveClienteIdFromOrdine(s.codice);
      const mCliente = this.filtroCliente === this.filtroDefault || (idClienteSpesa != null && idClienteSpesa === this.filtroCliente);
      return mPagato && mData && mOrdine && mCliente;
    });
  }


  selezionaTab(i: number): void { this.tabAttiva = i; }
  aggiungiTab(): void {
    const first = this.dettagliSpesa[0];
    this.dettagliSpesa.push({
      idCliente: first?.idCliente ?? null,
      nominativoCliente: first?.nominativoCliente ?? null,
      codiceOrdine: first?.codiceOrdine || '',
      vitto: 0
    });
  }
  eliminaDettaglioCorrente(): void {
    this.dettagliSpesa.splice(this.tabAttiva, 1);
    if (this.dettagliSpesa.length === 0) this.chiudiModal();
    else this.tabAttiva = 0;
  }


  ordiniDisponibili(dett: DettaglioSpesa): { codiceOrdine: string; idCliente: number }[] {
    if (!dett || dett.idCliente == null) return [];
    return this.ordiniCache[dett.idCliente] || [];
  }


  onClienteDropdownClick(): void {
    if (this.isClientiLoading) return;
    this.isClientiLoading = true;
    this.clientiOrdiniService.getClienti().subscribe({
      next: (res) => {
        this.clientiLoaded = true;
        this.clientiOptions.splice(0, this.clientiOptions.length, ...(res || []));
      },
      error: (err) => {
        console.error('[NoteSpese] getClienteByUtente error:', err);
      },
      complete: () => {
        this.isClientiLoading = false;
      }
    });
  }


  onClienteChange(dett: DettaglioSpesa): void {
    if (!dett) return;
    const cliente = this.clientiOptions.find(c => c.idCliente === dett.idCliente);
    dett.nominativoCliente = cliente ? cliente.nominativo : null;
    this.loadOrdiniByCliente(dett.idCliente ?? null, dett);
  }


  onCodiceChange(dett: DettaglioSpesa, codice: string): void {
    if (!dett) return;
    dett.codiceOrdine = codice;
    const ordine = this.findOrdineByCodice(codice);
    if (ordine) {
      dett.idCliente = ordine.idCliente;
      const cliente = this.clientiOptions.find(c => c.idCliente === ordine.idCliente);
      dett.nominativoCliente = cliente ? cliente.nominativo : dett.nominativoCliente;
    }
  }


  toggleCalendario(target: 'filtro' | 'popup'): void {
    if (target !== 'popup' || this.modalMode === 'visualizza') return;
    this.targetData = target;
    this.mostraCalendarioPopup = !this.mostraCalendarioPopup;
    if (this.mostraCalendarioPopup) {
      this.syncDatePopupFromString();
      this.generaCalendarioPopup();
    }
  }


  generaCalendarioPopup(): void {
    const anno = this.dataVisualizzataPopup.getFullYear();
    const mese = this.dataVisualizzataPopup.getMonth();
    const firstDayIndex = new Date(anno, mese, 1).getDay();
    const offset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    this.giorniVuotiPopup = Array(offset).fill(0);
    const numGiorni = new Date(anno, mese + 1, 0).getDate();
    this.giorniDelMesePopup = Array.from({ length: numGiorni }, (_, i) => i + 1);
  }


  cambiaMesePopup(delta: number): void {
    const currentMonth = this.dataVisualizzataPopup.getMonth();
    const currentYear = this.dataVisualizzataPopup.getFullYear();
    const target = new Date(currentYear, currentMonth + delta, 1);
    this.dataVisualizzataPopup = target;
    this.generaCalendarioPopup();
  }


  selezionaGiornoPopup(g: number): void {
    const giorno = String(g).padStart(2, '0');
    const mese = String(this.dataVisualizzataPopup.getMonth() + 1).padStart(2, '0');
    const anno = this.dataVisualizzataPopup.getFullYear();
    this.nuovaSpesaData = `${giorno}/${mese}/${anno}`;
    this.mostraCalendarioPopup = false;
  }


  isGiornoSelezionatoPopup(giorno: number): boolean {
    const data = parseDateString(this.nuovaSpesaData);
    if (!data) return false;
    return (
      data.getDate() === giorno &&
      data.getMonth() === this.dataVisualizzataPopup.getMonth() &&
      data.getFullYear() === this.dataVisualizzataPopup.getFullYear()
    );
  }


  get nomeMesePopup(): string {
    return this.dataVisualizzataPopup.toLocaleString('it-IT', { month: 'long' });
  }


  get annoPopup(): number {
    return this.dataVisualizzataPopup.getFullYear();
  }


  private creaIntervalloAnni(): number[] {
    const start = 2020;
    const end = new Date().getFullYear() + 5;
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }


  private syncDateStrings(target: 'filtro' | 'popup'): void {
    const giorno = '01';
    if (target === 'filtro') {
      const mese = String(this.meseFiltro + 1).padStart(2, '0');
      this.filtroData = `${giorno}/${mese}/${this.annoFiltro}`;
    }
  }


  private syncDatePopupFromString(): void {
    const data = parseDateString(this.nuovaSpesaData) || new Date();
    this.dataVisualizzataPopup = new Date(data.getFullYear(), data.getMonth(), 1);
  }


  private apriModalConModalita(mode: 'aggiungi' | 'visualizza' | 'modifica'): void {
    this.modalMode = mode;
    this.mostraModal = true;
    this.setBodyScrollLock(true);
  }


  private isDettaglioValido(dett: DettaglioSpesa | undefined): boolean {
    if (!dett) return false;
    const dataValida = this.nuovaSpesaData.trim().length > 0;
    const codiceValido = dett.codiceOrdine?.toString().trim().length > 0;
    const hasImporto = [
      dett.vitto,
      dett.alloggio,
      dett.hotel,
      dett.trasporti,
      dett.aereo,
      dett.varie,
      dett.parking,
      dett.telepass,
      dett.costo,
    ].some((v) => Number(v || 0) > 0);
    return Boolean(dataValida && codiceValido && hasImporto);
  }


  private creaSpesaDaDettaglio(dett: DettaglioSpesa, totale: string): Spesa {
    return {
      id: null,
      data: this.nuovaSpesaData,
      codice: dett.codiceOrdine,
      richiesto: totale,
      validato: '0,00€',
      pagato: false,
      idCliente: dett.idCliente ?? null,
    };
  }


  private loadSpese(year: number = new Date().getFullYear(), month: number = new Date().getMonth() + 1): void {
    this.isSpeseLoading = true;
    this.loading = true;
    this.noteSpeseService.getSpeseByYear(year, month).subscribe({
      next: (res) => {
        console.log('[NoteSpese] API response spese:', res);
        const mapped = (res || []).map(item => {
          const id = (item as any)?.id ?? item?.idSpesa ?? (item as any)?.idSpesaNota ?? null;
          const idCliente = (item as any)?.idCliente ?? (item as any)?.idClienteOrdine ?? (item as any)?.clienteId ?? null;
          const result = {
            id,
            data: formatDateIt(item.dataNotificazione),
            codice: item.codiceOrdine || '',
            richiesto: this.formattaTotaleNumber(item.totaleComplessivo || 0),
            validato: this.formattaTotaleNumber((item as any).totaleValidato || 0),
            pagato: Boolean(item.statoPagamento),
            idCliente,
          } as Spesa;
          console.log('[NoteSpese] mapped item ->', result);
          return result;
        });
        this.listaSpese = mapped;
        console.log('[NoteSpese] listaSpese popolata', this.listaSpese.length);
        this.enrichSpeseWithClienti();
        this.rebuildFiltroOrdiniOptions();
      },
      error: (err: any) => {
        console.error('[NoteSpese] loadSpese error:', err);
        const status = err && err.status ? err.status : 'n/a';
        this.loadErrore = `Errore caricamento spese: ${status}`;
        this.loading = false;
      },
      complete: () => {
        this.isSpeseLoading = false;
        this.loading = false;
        console.log('[NoteSpese] loadSpese complete');
      }
    });
  }


  private parseImporto(importo: string): number {
    return (
      parseFloat(
        importo
          .replace(/\./g, '')
          .replace(',', '.')
          .replace(/[^\d.]/g, '')
      ) || 0
    );
  }


  private formattaTotale(totale: number): string {
    return totale.toFixed(2).replace('.', ',') + '€';
  }


  private formattaTotaleNumber(tot: number): string {
    const n = Number(tot || 0);
    return n.toFixed(2).replace('.', ',') + '€';
  }


  clampNonNegative(value: number | string | null | undefined): number {
    return clampNonNegative(value);
  }


  blockNegative(event: KeyboardEvent): void {
    blockNegative(event);
  }


  private sommaDettaglio(dett: DettaglioSpesa): number {
    return (
      Number(dett.vitto || 0) +
      Number(dett.alloggio || 0) +
      Number(dett.hotel || 0) +
      Number(dett.trasporti || 0) +
      Number(dett.aereo || 0) +
      Number(dett.varie || 0) +
      Number(dett.parking || 0) +
      Number(dett.telepass || 0) +
      Number(dett.costo || 0)
    );
  }


  private rebuildFiltroOrdiniOptions(): void {
    const codes = Array.from(new Set(this.listaSpese.map(s => s.codice).filter(Boolean)));
    this.filtroOrdiniOptions = [this.filtroDefault, ...codes];
    if (!this.filtroOrdiniOptions.includes(this.filtroOrdine)) {
      this.filtroOrdine = this.filtroDefault;
    }
  }


  private loadClienti(): void {
    if (this.clientiLoaded || this.isClientiLoading) return;
    this.isClientiLoading = true;
    this.clientiOrdiniService.getClienti().subscribe({
      next: (res) => {
        this.clientiLoaded = true;
        this.clientiOptions.splice(0, this.clientiOptions.length, ...(res || []));
        if (this.clientiOptions.length && this.dettagliSpesa[0]) {
          const first = this.clientiOptions[0];
          this.dettagliSpesa[0].idCliente = first.idCliente;
          this.dettagliSpesa[0].nominativoCliente = first.nominativo;
          this.loadOrdiniByCliente(first.idCliente, this.dettagliSpesa[0]);
        }
        if (!this.clientiOptions.length) {
          this.loadErrore = 'Nessun cliente disponibile.';
        }
      },
      error: (err) => {
        console.error('[NoteSpese] getClienteByUtente error:', err);
        this.loadErrore = `Errore caricamento clienti: ${err?.status || 'n/a'}`;
      },
      complete: () => {
        this.isClientiLoading = false;
      }
    });
  }


  private loadOrdiniByCliente(idCliente: number | null, dett?: DettaglioSpesa): void {
    if (idCliente == null) return;
    if (this.ordiniCache[idCliente]) {
      this.enrichSpeseWithClienti();
      this.ensureCodiceOrdineValid(dett, this.ordiniCache[idCliente]);
      return;
    }


    this.isOrdiniLoading = true;
    this.clientiOrdiniService.getOrdini(idCliente).subscribe({
      next: (res) => {
        this.ordiniCache[idCliente] = res || [];
        if (!this.ordiniCache[idCliente].length) {
          this.loadErrore = 'Nessun ordine per il cliente selezionato.';
        }
        this.enrichSpeseWithClienti();
        this.ensureCodiceOrdineValid(dett, this.ordiniCache[idCliente]);
      },
      error: (err) => {
        console.error('[NoteSpese] getOrdini error:', err);
        this.loadErrore = `Errore caricamento ordini: ${err?.status || 'n/a'}`;
        this.ordiniCache[idCliente] = this.ordiniCache[idCliente] || [];
        this.enrichSpeseWithClienti();
        this.ensureCodiceOrdineValid(dett, this.ordiniCache[idCliente]);
      },
      complete: () => {
        this.isOrdiniLoading = false;
      }
    });
  }


  private ensureCodiceOrdineValid(dett: DettaglioSpesa | undefined, ordini: OrdineApiItem[]): void {
    if (!dett) return;
    const valido = ordini.some(o => o.codiceOrdine === dett.codiceOrdine);
    if (!valido) dett.codiceOrdine = ordini[0]?.codiceOrdine || '';
  }


  private findOrdineByCodice(codice: string): OrdineApiItem | undefined {
    const cacheValues = Object.values(this.ordiniCache).flat();
    const allOrdini = [...cacheValues, ...(this.ordini || [])];
    return allOrdini.find(o => o.codiceOrdine === codice);
  }


  private resolveClienteIdFromOrdine(codice: string): number | null {
    if (!codice) return null;
    const ordine = this.findOrdineByCodice(codice);
    return ordine ? ordine.idCliente : null;
  }


  private enrichSpeseWithClienti(): void {
    this.listaSpese.forEach(spesa => {
      if (spesa.idCliente == null) {
        spesa.idCliente = this.resolveClienteIdFromOrdine(spesa.codice);
      }
    });
  }


  private buildAddPayload(): AddSpesaRequest {
    const dataNotificazione = formatDateISO(this.nuovaSpesaData);
    const dettagli = this.dettagliSpesa.map(d => ({
      dataDettaglio: formatDateISO(this.nuovaSpesaData),
      vitto: Number(d.vitto || 0),
      hotel: Number(d.hotel || 0),
      trasportiLocali: Number(d.trasporti || 0),
      aereo: Number(d.aereo || 0),
      spesaVaria: Number(d.varie || 0),
      idAuto: d.auto ? Number(d.auto) || null : null,
      km: Number(d.km || 0),
      telepass: Number(d.telepass || 0),
      parking: Number(d.parking || 0)
    }));


    return {
      codiceOrdine: this.dettagliSpesa[0]?.codiceOrdine || '',
      dataNotificazione,
      dettagli
    };
  }


  private buildUpdatePayload(): UpdateSpesaRequest {
    const dettagli = this.dettagliSpesa.map(d => ({
      idDettaglio: d.idDettaglio ?? 0,
      daEliminare: false,
      dataDettaglio: formatDateISO(this.nuovaSpesaData),
      vitto: Number(d.vitto || 0),
      hotel: Number(d.hotel || 0),
      trasportiLocali: Number(d.trasporti || 0),
      aereo: Number(d.aereo || 0),
      spesaVaria: Number(d.varie || 0),
      idAuto: d.auto ? Number(d.auto) || null : null,
      km: Number(d.km || 0),
      telepass: Number(d.telepass || 0),
      parking: Number(d.parking || 0)
    }));


    return {
      codiceOrdine: this.dettagliSpesa[0]?.codiceOrdine || '',
      idSpesa: this.rigaSelezionata?.id ?? 0,
      dettagli
    };
  }


  private formatDateISO(valore: string): string {
    const data = parseDateString(valore) || new Date();
    const yyyy = data.getFullYear();
    const mm = String(data.getMonth() + 1).padStart(2, '0');
    const dd = String(data.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }


  private setBodyScrollLock(lock: boolean): void {
    const body = document.body;
    const html = document.documentElement;
    if (!body || !html) return;
    if (lock) {
      body.classList.add('modal-open');
      html.classList.add('modal-open');
    } else {
      body.classList.remove('modal-open');
      html.classList.remove('modal-open');
    }
  }
  
  
}
