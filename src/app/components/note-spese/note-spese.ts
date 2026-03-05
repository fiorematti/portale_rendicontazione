import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgIf, NgForOf, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoteSpeseService, DettaglioApiResponse, UpdateSpesaRequest } from './note-spese.service';
import { ClientiOrdiniService } from '../../shared/services/clienti-ordini.service';
import { ClienteApiItem } from '../../dto/cliente.dto';
import { OrdineApiItem } from '../../dto/ordine.dto';
import { AutomobileDto } from '../../dto/automobile.dto';
import { clampNonNegative, blockNegative } from '../../shared/utils/input.utils';
import { parseDateString, formatDateIt, formatDateISO, sanitizeDateInput, creaIntervalloAnni } from '../../shared/utils/date.utils';
import { setBodyScrollLock } from '../../shared/utils/dom.utils';


/** Rappresenta una nota spesa nella lista principale */
interface Spesa {
  id?: number | null;
  /** Data in formato dd/MM/yyyy */
  data: string;
  codice: string;
  /** Totale richiesto formattato (es. "215,00€") */
  richiesto: string;
  /** Totale validato formattato */
  validato: string;
  pagato: boolean;
  idCliente?: number | null;
  /** Dettagli salvati localmente (prima del salvataggio su backend) */
  dettagliLocali?: DettaglioSpesa[];
}


/** Rappresenta un singolo dettaglio/riga di una nota spesa */
interface DettaglioSpesa {
  idDettaglio?: number;
  idCliente?: number | null;
  nominativoCliente?: string | null;
  codiceOrdine: string;
  vitto?: number | null;
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
  totale?: number | null;
  statoApprovazione?: string | null;
  costoKilometri?: number | null;
  /** Allegati associati al dettaglio, indicizzati per campo */
  attachments?: Record<string, AttachmentInfo>;
}

/** Informazioni su un allegato caricato */
interface AttachmentInfo {
  fileName: string;
  previewUrl: string;
  previewType: 'image' | 'pdf';
}


@Component({
  selector: 'app-note-spese',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgForOf, NgClass],
  templateUrl: './note-spese.html',
  styleUrl: './note-spese.css',
})




/**
 * Componente per la gestione delle note spese dell'utente.
 * Permette di visualizzare, aggiungere, modificare ed eliminare note spese
 * con supporto per dettagli multipli (tab), allegati, filtri e calendario.
 */
export class NoteSpese implements OnInit, OnDestroy {
  readonly filtroDefault = 'Tutti';
  readonly clientiOptions: ClienteApiItem[] = [];
  /** Cache degli ordini per cliente, evita chiamate API ripetute */
  private ordiniCache: Record<number, OrdineApiItem[]> = {};

  ordini: OrdineApiItem[] = [];
  selectedCodiceOrdine = '';

  automobili: AutomobileDto[] = [];
  isAutomobiliLoading = false;

  /** Lista completa delle spese caricate dal backend */
  listaSpese: Spesa[] = [];
  loading = false;
  errore: string | null = null;

  /* --- Stato dei filtri nella pagina principale --- */
  filtroPagate = this.filtroDefault;
  filtroData = '';
  filtroCliente: number | 'Tutti' = this.filtroDefault;
  filtroOrdine = this.filtroDefault;
  filtroOrdiniOptions: string[] = [];

  /* --- Stato della modale di creazione/modifica/visualizzazione --- */
  mostraModal = false;
  modalMode: 'aggiungi' | 'visualizza' | 'modifica' = 'aggiungi';
  nuovaSpesaData = '';
  /** Indice del tab (dettaglio) attivo nella modale */
  tabAttiva = 0;
  /** Dettagli della spesa nella modale (ogni tab = un dettaglio) */
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

  /** Spesa attualmente selezionata per modifica/visualizzazione */
  rigaSelezionata: Spesa | null = null;

  readonly costoKm = 0;

  /* --- Stato del calendario popup --- */
  mostraCalendario = false;
  targetData: 'filtro' | 'popup' = 'filtro';

  /** Abbreviazioni dei mesi per i selettori */
  readonly listaMesi = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  listaAnni: number[] = [];


  meseFiltro = new Date().getMonth();
  annoFiltro = new Date().getFullYear();


  mostraCalendarioPopup = false;
  dataVisualizzataPopup: Date = new Date();
  giorniDelMesePopup: number[] = [];
  giorniVuotiPopup: number[] = [];

  /* --- Stato popup allegati --- */
  mostraAttachmentPopup = false;
  attachmentPreviewUrl: string | null = null;
  attachmentPreviewType: 'image' | 'pdf' | null = null;
  attachmentFileName = '';
  private currentAttachmentTarget: { tab: number; field: string } | null = null;

  /** Shortcut per verificare la modalità corrente della modale */
  get isAggiungi(): boolean { return this.modalMode === 'aggiungi'; }
  get isVisualizza(): boolean { return this.modalMode === 'visualizza'; }
  get isModifica(): boolean { return this.modalMode === 'modifica'; }


  constructor(
    private readonly noteSpeseService: NoteSpeseService,
    private readonly clientiOrdiniService: ClientiOrdiniService
  ) {}


  ngOnInit(): void {
    this.listaAnni = creaIntervalloAnni(2020, new Date().getFullYear() + 5);
    this.syncDateStrings('filtro');
    this.syncDatePopupFromString();
    this.generaCalendarioPopup();
    this.loadClienti();
    this.loadSpese();
    this.resetNuovaSpesa();
    // keep codice ordine dropdown empty until new endpoints are wired
    this.filtroOrdiniOptions = [this.filtroDefault];
    // NOTE: removed direct call to clientiOrdiniService.getOrdini() here.
    // Orders will be fetched with the new endpoints later. Keep `ordini` empty for now.
  }


  ngOnDestroy(): void {
    setBodyScrollLock(false);
  }


  /** Apre la modale in modalità visualizzazione e carica i dettagli dal backend */
  visualizzaDettaglio(spesa: Spesa): void {
    this.cleanupAttachments();
    this.rigaSelezionata = spesa;
    this.nuovaSpesaData = spesa.data;
    this.dettagliSpesa = [];
    this.tabAttiva = 0;
    this.ensureAutomobiliLoaded();
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
          this.loadOrdiniPerDettagli();
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
      if (spesa.dettagliLocali?.length) {
        this.dettagliSpesa = this.copiaDettagli(spesa.dettagliLocali);
      } else {
        this.caricaDatiNellaModal(spesa);
      }
      this.loadOrdiniPerDettagli();
    }
  }


  /**
   * Mappa un dettaglio ricevuto dall'API nel formato locale DettaglioSpesa.
   * Gestisce sia la naming convention camelCase che PascalCase dell'API.
   */
  private mapDettaglioApiToDettaglioSpesa(item: DettaglioApiResponse, spesa: Spesa): DettaglioSpesa {
    const ordine = this.findOrdineByCodice(spesa.codice);
    const clienteId = ordine?.idCliente
      ?? spesa.idCliente
      ?? (item as any).idCliente
      ?? (item as any).clienteId
      ?? null;
    const cliente = clienteId != null ? this.clientiOptions.find(c => c.idCliente === clienteId) : null;
    const vitto = (item as any).vitto ?? (item as any).Vitto ?? 0;
    const hotel = (item as any).hotel ?? (item as any).Hotel ?? 0;
    const trasporti = (item as any).trasportiLocali ?? (item as any).TrasportiLocali ?? 0;
    const aereo = (item as any).aereo ?? (item as any).Aereo ?? 0;
    const varie = (item as any).spesaVaria ?? (item as any).SpesaVaria ?? 0;
    const parking = (item as any).parking ?? (item as any).Parking ?? 0;
    const telepass = (item as any).telepass ?? (item as any).Telepass ?? 0;
    const km = (item as any).km ?? (item as any).Km ?? 0;
    const idAutoVal = (item as any).idAuto ?? (item as any).IdAuto;
    const totale = (item as any).totale ?? (item as any).Totale ?? null;
    const statoApprovazione = (item as any).statoApprovazione ?? (item as any).StatoApprovazione ?? null;
    const costoKmApi = (item as any).costoKm ?? (item as any).costoKilometri ?? (item as any).CostoKilometri ?? null;
    const costo = (item as any).costo ?? (item as any).Costo ?? null;
    return {
      idDettaglio: item.idDettaglio ?? 0,
      idCliente: clienteId,
      nominativoCliente: cliente?.nominativo ?? null,
      codiceOrdine: spesa.codice,
      vitto,
      hotel,
      trasporti,
      aereo,
      varie,
      auto: idAutoVal != null && idAutoVal > 0 ? String(idAutoVal) : 'Modello auto',
      km,
      parking,
      telepass,
      costo,
      totale,
      statoApprovazione,
      costoKilometri: costoKmApi,
    };
  }


  /** Apre la modale in modalità modifica e carica i dettagli dal backend */
  apriModifica(spesa: Spesa): void {
    this.cleanupAttachments();
    this.rigaSelezionata = spesa;
    this.nuovaSpesaData = spesa.data;
    this.dettagliSpesa = [];
    this.tabAttiva = 0;
    this.ensureAutomobiliLoaded();
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
          this.loadOrdiniPerDettagli();
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
      if (spesa.dettagliLocali?.length) {
        this.dettagliSpesa = this.copiaDettagli(spesa.dettagliLocali);
      } else {
        this.caricaDatiNellaModal(spesa);
      }
      this.loadOrdiniPerDettagli();
    }
  }


  /** Elimina una spesa dopo conferma utente. Gestisce sia spese remote che locali. */
  eliminaSpesa(indexTable: number): void {
    const spesaDaEliminare = this.speseFiltrate[indexTable];
    if (!spesaDaEliminare) return;
    const indexReale = this.listaSpese.indexOf(spesaDaEliminare);
    if (!confirm('Sei sicuro di voler eliminare questa nota spesa?')) return;


    if (spesaDaEliminare.id != null) {
      this.deletingSpesaId = spesaDaEliminare.id;
      this.noteSpeseService.deleteSpesa(spesaDaEliminare.id).subscribe({
        next: (res) => {
          const esitoStr = typeof res?.esito === 'string' ? res.esito.toLowerCase() : '';
          const esitoOk = !res?.esito
            || esitoStr.includes('riuscita')
            || esitoStr.includes('completata');
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


  /** Popola la modale con i dati base di una spesa (fallback se non ci sono dettagli API) */
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
      hotel: 0,
      trasporti: 0,
      aereo: 0,
      varie: 0,
      auto: 'Modello auto',
      km: 0,
      parking: 0,
      telepass: 0,
      costo: 0,
      attachments: {}
    }];
    this.tabAttiva = 0;
  }


  /** Deep-copy dei dettagli preservando gli allegati */
  private copiaDettagli(dettagli: DettaglioSpesa[]): DettaglioSpesa[] {
    return dettagli.map(d => ({
      ...d,
      attachments: d.attachments ? { ...d.attachments } : undefined
    }));
  }


  /**
   * Conferma il salvataggio della spesa (creazione o modifica).
   * Valida il dettaglio attivo prima dell'invio.
   */
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
      const formData = this.buildAddPayload();
      for (const [k, v] of formData.entries()) {
    console.log('AddSpesa payload ->', k, v);
  }
      this.noteSpeseService.addSpesa(formData).subscribe({
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


  /** Resetta il form della spesa e prepara per una nuova creazione */
  resetNuovaSpesa(): void {
    this.cleanupAttachments();
    this.nuovaSpesaData = '';
    this.dettagliSpesa = [{
      idCliente: null,
      nominativoCliente: null,
      codiceOrdine: '',
      vitto: null,
      auto: 'Modello auto',
      attachments: {}
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


  /** Chiude la modale e ripristina lo stato */
  chiudiModal(): void {
    this.cleanupAttachments();
    this.closeAttachmentPopup();
    this.mostraModal = false;
    this.mostraCalendario = false;
    this.rigaSelezionata = null;
    this.mostraErrore = false;
    setBodyScrollLock(false);
  }


  /** Totale complessivo di tutti i dettagli della spesa corrente */
  get totaleCalcolato(): number {
    return this.dettagliSpesa.reduce((acc, dett) => acc + this.sommaDettaglio(dett), 0);
  }


  /** Callback al cambio mese/anno nel filtro principale — ricarica le spese */
  onCambioMeseAnno(target: 'filtro' | 'popup'): void {
    if (target === 'filtro') {
      this.syncDateStrings('filtro');
      // ricarica le spese per mese/anno selezionato
      this.loadSpese(this.annoFiltro, this.meseFiltro + 1);
    }
  }


  formattaData(event: Event, campo: string): void {
    const target = event.target as HTMLInputElement;
    const v = sanitizeDateInput(target.value);
    if (campo === 'filtro') this.filtroData = v; else this.nuovaSpesaData = v;
  }


  /** Filtra la lista spese in base a pagamento, data, ordine e cliente */
  get speseFiltrate(): Spesa[] {
    const filtroDate = parseDateString(this.filtroData);
    return this.listaSpese.filter((s) => {
      console.log(s);
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
      vitto: 0,
      auto: 'Modello auto',
      attachments: {}
    });
  }
  eliminaDettaglioCorrente(): void {
    const dett = this.dettagliSpesa[this.tabAttiva];
    this.cleanupAttachmentForDettaglio(dett);

    if (this.rigaSelezionata?.id != null) {
      const spesaId = this.rigaSelezionata.id;
      if (!confirm('Sei sicuro di voler eliminare questo dettaglio e la nota spesa associata?')) return;
      this.deletingSpesaId = spesaId;
      this.noteSpeseService.deleteSpesa(spesaId).subscribe({
        next: (res) => {
          const esitoStr = typeof res?.esito === 'string' ? res.esito.toLowerCase() : '';
          const esitoOk = !res?.esito
            || esitoStr.includes('riuscita')
            || esitoStr.includes('completata');
          if (esitoOk) {
            const indexReale = this.listaSpese.indexOf(this.rigaSelezionata!);
            if (indexReale >= 0) this.listaSpese.splice(indexReale, 1);
            this.rebuildFiltroOrdiniOptions();
            this.chiudiModal();
          } else {
            this.salvaErrore = res?.motivazione || 'Eliminazione non riuscita.';
          }
        },
        error: (err) => {
          console.error('DeleteSpesa error:', err);
          this.salvaErrore = 'Errore durante l\'eliminazione del dettaglio.';
        },
        complete: () => {
          this.deletingSpesaId = null;
        }
      });
    } else {
      this.dettagliSpesa.splice(this.tabAttiva, 1);
      if (this.dettagliSpesa.length === 0) this.chiudiModal();
      else this.tabAttiva = 0;
    }
  }


  /** Restituisce gli ordini disponibili per il cliente del dettaglio corrente */
  ordiniDisponibili(dett: DettaglioSpesa): { codiceOrdine: string; idCliente: number }[] {
    if (!dett || dett.idCliente == null) return [];
    return this.ordiniCache[dett.idCliente] || [];
  }


  /** Restituisce il nome dell'auto (marca modello - targa) per un dettaglio */
  nomeAutoPerDettaglio(dett: DettaglioSpesa): string {
    if (!dett?.auto || dett.auto === 'Modello auto') return '';
    const auto = this.automobili.find(a => a.idauto.toString() === dett.auto);
    return auto ? `${auto.marca} ${auto.modello} - ${auto.targa}` : '';
  }


  /** Carica gli ordini per tutti i clienti presenti nei dettagli correnti */
  private loadOrdiniPerDettagli(): void {
    const clienteIds = new Set<number>();
    this.dettagliSpesa.forEach(d => {
      if (d.idCliente != null) clienteIds.add(d.idCliente);
    });
    clienteIds.forEach(id => {
      if (!this.ordiniCache[id]) {
        this.loadOrdiniByCliente(id);
      }
    });
  }


  /** Carica i clienti su prima apertura del dropdown (lazy loading) */
  onClienteDropdownClick(): void {
    if (this.clientiLoaded || this.isClientiLoading) return;
    this.isClientiLoading = true;
    this.loadErrore = '';
    this.clientiOrdiniService.getClienti().subscribe({
      next: (res) => {
        // replace contents while keeping the same array instance
        this.clientiOptions.splice(0, this.clientiOptions.length, ...(res || []));
        this.clientiLoaded = true;
      },
      error: (err) => {
        console.error('[NoteSpese] getClienti error:', err);
        this.loadErrore = 'Errore caricamento clienti.';
      },
      complete: () => {
        this.isClientiLoading = false;
      }
    });
  }


  /** Quando cambia il cliente nel dettaglio, aggiorna il nominativo e ricarica gli ordini */
  onClienteChange(dett: DettaglioSpesa): void {
    if (!dett) return;
    const cliente = this.clientiOptions.find(c => c.idCliente === dett.idCliente);
    dett.nominativoCliente = cliente ? cliente.nominativo : null;
    this.loadOrdiniByCliente(dett.idCliente ?? null, dett);
  }

  /** Chiamata quando cambia il filtro Cliente nella pagina principale */
  onFiltroClienteChange(): void {
    if (typeof this.filtroCliente === 'number') {
      this.isOrdiniLoading = true;
      this.loadErrore = '';
      this.clientiOrdiniService.getOrdiniByUtenteAndCliente(this.filtroCliente).subscribe({
        next: (res) => {
          const ordini = res || [];
          this.ordiniCache[this.filtroCliente as number] = ordini;
          this.ordini = ordini;
          const codes = ordini.map(o => o.codiceOrdine).filter(Boolean);
          const unique = Array.from(new Set(codes));
          unique.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
          this.filtroOrdiniOptions = [this.filtroDefault, ...unique];
          if (!this.filtroOrdiniOptions.includes(this.filtroOrdine)) {
            this.filtroOrdine = this.filtroDefault;
          }
        },
        error: (err) => {
          console.error('[NoteSpese] getOrdiniByUtenteAndCliente error:', err);
          this.loadErrore = 'Errore caricamento ordini.';
        },
        complete: () => { this.isOrdiniLoading = false; }
      });
    } else {
      // "Tutti" selezionato — resetta filtro ordini
      this.filtroOrdiniOptions = [this.filtroDefault];
      this.filtroOrdine = this.filtroDefault;
      this.ordini = [];
    }
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


  onAutoDropdownClick(): void {
    this.ensureAutomobiliLoaded();
  }


  private ensureAutomobiliLoaded(): void {
    if (this.automobili.length || this.isAutomobiliLoading) return;
    this.isAutomobiliLoading = true;
    this.noteSpeseService.getAutomobili().subscribe({
      next: (res) => {
        this.automobili = res || [];
      },
      error: (err) => {
        console.error('[NoteSpese] getAutomobili error:', err);
      },
      complete: () => {
        this.isAutomobiliLoading = false;
      }
    });
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


  /** Sincronizza la data del filtro stringa dal selettore mese/anno */
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


  /** Apre la modale nella modalità specificata e blocca lo scroll del body */
  private apriModalConModalita(mode: 'aggiungi' | 'visualizza' | 'modifica'): void {
    this.modalMode = mode;
    this.mostraModal = true;
    setBodyScrollLock(true);
  }


  private isDettaglioValido(dett: DettaglioSpesa | undefined): boolean {
    if (!dett) return false;
    const dataValida = this.nuovaSpesaData.trim().length > 0;
    const codiceValido = dett.codiceOrdine?.toString().trim().length > 0;
    const hasImporto = [
      dett.vitto,
      dett.hotel,
      dett.trasporti,
      dett.aereo,
      dett.varie,
      dett.parking,
      dett.telepass,
      dett.costo,
      (Number(dett.km || 0) * this.costoKm),
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
      dettagliLocali: this.copiaDettagli(this.dettagliSpesa),
    };
  }


  /** Carica le spese dal backend filtrando per anno e mese */
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
            richiesto: this.formattaTotale(item.totaleComplessivo || 0),
            validato: this.formattaTotale((item as any).totaleValidato || 0),
            pagato: Boolean(item.statoPagamento),
            idCliente,
          } as Spesa;
          console.log('[NoteSpese] mapped item ->', result);
          return result;
        });
        this.listaSpese = mapped.sort((a, b) => {
          const da = parseDateString(a.data);
          const db = parseDateString(b.data);
          const ta = da ? da.getTime() : 0;
          const tb = db ? db.getTime() : 0;
          return tb - ta; // più recenti prima
        });
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


  /**
   * Formatta un importo numerico in stringa con virgola e simbolo euro.
   * Es: 215.50 → "215,50€"
   */
  private formattaTotale(totale: number): string {
    const n = Number(totale || 0);
    return n.toFixed(2).replace('.', ',') + '€';
  }


  clampNonNegative(value: number | string | null | undefined): number {
    return clampNonNegative(value);
  }


  blockNegative(event: KeyboardEvent): void {
    blockNegative(event);
  }


  /** Somma tutte le voci di spesa di un singolo dettaglio */
  private sommaDettaglio(dett: DettaglioSpesa): number {
    return (
      Number(dett.vitto || 0) +
      Number(dett.hotel || 0) +
      Number(dett.trasporti || 0) +
      Number(dett.aereo || 0) +
      Number(dett.varie || 0) +
      Number(dett.parking || 0) +
      Number(dett.telepass || 0) +
      Number(dett.costo || 0) +
      Number(dett.km || 0) * Number(this.costoKm || 0)
    );
  }


  /** Ricostruisce le opzioni del filtro ordini dai dati in cache */
  private rebuildFiltroOrdiniOptions(): void {
    const fromOrdini = (this.ordini || []).map(o => o.codiceOrdine).filter(Boolean);
    const fromCache = Object.values(this.ordiniCache || {}).flat().map(o => o.codiceOrdine).filter(Boolean);
    const allCodes = Array.from(new Set([...fromOrdini, ...fromCache]));
    allCodes.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    this.filtroOrdiniOptions = [this.filtroDefault, ...allCodes];
    if (!this.filtroOrdiniOptions.includes(this.filtroOrdine)) {
      this.filtroOrdine = this.filtroDefault;
    }
  }


  /** Carica la lista dei clienti dell'utente dal backend */
  private loadClienti(): void {
    if (this.clientiLoaded || this.isClientiLoading) return;
    this.isClientiLoading = true;
    this.loadErrore = '';
    this.clientiOrdiniService.getClienti().subscribe({
      next: (res) => {
        this.clientiOptions.splice(0, this.clientiOptions.length, ...(res || []));
        this.clientiLoaded = true;
      },
      error: (err) => {
        console.error('[NoteSpese] getClienti error:', err);
        this.loadErrore = 'Errore caricamento clienti.';
      },
      complete: () => { this.isClientiLoading = false; }
    });
  }


  /** Carica gli ordini per un cliente (usa cache se disponibile) */
  private loadOrdiniByCliente(idCliente: number | null, dett?: DettaglioSpesa): void {
    if (idCliente == null) return;
    if (this.ordiniCache[idCliente]) {
      this.ordini = this.ordiniCache[idCliente];
      this.enrichSpeseWithClienti();
      this.ensureCodiceOrdineValid(dett, this.ordiniCache[idCliente]);
      return;
    }
    this.isOrdiniLoading = true;
    this.loadErrore = '';
    this.clientiOrdiniService.getOrdiniByUtenteAndCliente(idCliente).subscribe({
      next: (res) => {
        const ordini = res || [];
        this.ordiniCache[idCliente] = ordini;
        this.ordini = ordini;
        this.enrichSpeseWithClienti();
        this.ensureCodiceOrdineValid(dett, ordini);
      },
      error: (err) => {
        console.error('[NoteSpese] getOrdiniByUtenteAndCliente error:', err);
        this.loadErrore = 'Errore caricamento ordini.';
      },
      complete: () => { this.isOrdiniLoading = false; }
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


  /** Costruisce il FormData payload per la creazione di una nuova spesa */
  private buildAddPayload(): FormData {
    const dataNotificazione = formatDateISO(this.nuovaSpesaData);
    const form = new FormData();

    form.append('CodiceOrdine', this.dettagliSpesa[0]?.codiceOrdine || '');
    form.append('DataNotificazione', dataNotificazione);

    this.dettagliSpesa.forEach((dett, index) => {
      const prefix = `Dettagli[${index}]`;
      const dataDettaglio = formatDateISO(this.nuovaSpesaData);
      const idAutoValue = dett.auto && dett.auto !== 'Modello auto' ? Number(dett.auto) || 0 : 0;

      form.append(`${prefix}.dataDettaglio`, dataDettaglio);
      form.append(`${prefix}.km`, String(Number(dett.km || 0)));
      form.append(`${prefix}.spesaVaria`, String(Number(dett.varie || 0)));
      form.append(`${prefix}.idAuto`, String(idAutoValue));
      form.append(`${prefix}.allegati`, JSON.stringify([]));
      form.append(`${prefix}.hotel`, String(Number(dett.hotel || 0)));
      form.append(`${prefix}.trasportiLocali`, String(Number(dett.trasporti || 0)));
      form.append(`${prefix}.aereo`, String(Number(dett.aereo || 0)));
      form.append(`${prefix}.parking`, String(Number(dett.parking || 0)));
      form.append(`${prefix}.telepass`, String(Number(dett.telepass || 0)));
      form.append(`${prefix}.vitto`, String(Number(dett.vitto || 0)));
    });

    return form;
  }


  /** Costruisce il payload per l'aggiornamento di una spesa esistente */
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


  /** Apre il selettore file per un campo allegato specifico */
  openAttachmentUploader(tabIndex: number, field: string): void {
    this.ensureAttachmentContainer(tabIndex);
    this.currentAttachmentTarget = { tab: tabIndex, field };
    const input = document.getElementById('fileUploader') as HTMLInputElement | null;
    if (input) {
      input.value = '';
      input.click();
    }
  }

  /** Gestisce la selezione del file e genera anteprima (immagine o PDF) */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files && input.files[0];
    const target = this.currentAttachmentTarget;
    if (!file || !target) return;
    const { tab, field } = target;
    if (!this.dettagliSpesa[tab]) return;

    const finalizeAttachment = (previewUrl: string, previewType: 'image' | 'pdf') => {
      const info: AttachmentInfo = {
        fileName: file.name,
        previewUrl,
        previewType
      };
      this.setAttachment(tab, field, info);
      this.showAttachment(info);
    };

    this.attachmentFileName = file.name;
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (isPdf) {
      const url = URL.createObjectURL(file);
      this.renderPdfAsImage(url).then((dataUrl) => {
        if (dataUrl) {
          finalizeAttachment(dataUrl, 'image');
        } else {
          finalizeAttachment(url, 'pdf');
        }
      }).catch(() => {
        finalizeAttachment(url, 'pdf');
      });
    } else if (file.type.startsWith('image/')) {
      finalizeAttachment(URL.createObjectURL(file), 'image');
    } else {
      finalizeAttachment(URL.createObjectURL(file), 'image');
    }
  }

  closeAttachmentPopup(clearTarget: boolean = true): void {
    this.mostraAttachmentPopup = false;
    this.attachmentPreviewUrl = null;
    this.attachmentPreviewType = null;
    this.attachmentFileName = '';
    if (clearTarget) this.currentAttachmentTarget = null;
  }

  getAttachment(tabIndex: number, field: string): AttachmentInfo | null {
    const dett = this.dettagliSpesa[tabIndex];
    return dett?.attachments?.[field] || null;
  }

  openStoredAttachment(tabIndex: number, field: string): void {
    const att = this.getAttachment(tabIndex, field);
    if (!att) return;
    this.showAttachment(att);
  }

  removeAttachment(tabIndex: number, field: string): void {
    const dett = this.dettagliSpesa[tabIndex];
    if (!dett || !dett.attachments || !dett.attachments[field]) return;
    const att = dett.attachments[field];
    this.revokeIfObjectUrl(att.previewUrl);
    delete dett.attachments[field];
    if (this.attachmentPreviewUrl === att.previewUrl) {
      this.closeAttachmentPopup();
    }
  }

  private showAttachment(info: AttachmentInfo): void {
    this.attachmentFileName = info.fileName;
    this.attachmentPreviewUrl = info.previewUrl;
    this.attachmentPreviewType = info.previewType;
    this.mostraAttachmentPopup = true;
  }

  private ensureAttachmentContainer(tabIndex: number): Record<string, AttachmentInfo> {
    const dett = this.dettagliSpesa[tabIndex];
    if (!dett) return {};
    if (!dett.attachments) dett.attachments = {};
    return dett.attachments;
  }

  private setAttachment(tabIndex: number, field: string, info: AttachmentInfo): void {
    const container = this.ensureAttachmentContainer(tabIndex);
    const existing = container[field];
    if (existing && existing.previewUrl !== info.previewUrl) {
      this.revokeIfObjectUrl(existing.previewUrl);
    }
    container[field] = info;
  }

  private cleanupAttachmentForDettaglio(dett: DettaglioSpesa | undefined): void {
    if (!dett?.attachments) return;
    Object.values(dett.attachments).forEach(att => this.revokeIfObjectUrl(att.previewUrl));
    dett.attachments = {};
  }

  private cleanupAttachments(): void {
    this.dettagliSpesa.forEach(d => this.cleanupAttachmentForDettaglio(d));
  }

  private revokeIfObjectUrl(url: string): void {
    if (!url || url.startsWith('data:')) return;
    try {
      URL.revokeObjectURL(url);
    } catch (e) {
      // ignore revoke errors
    }
  }

  /**
   * Renderizza la prima pagina di un PDF come immagine (data URL) usando pdf.js.
   * Carica la libreria pdf.js dal CDN se non ancora disponibile.
   */
  private renderPdfAsImage(pdfUrl: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const finishRender = () => {
        const pdfjsLib = (window as any).pdfjsLib;
        if (!pdfjsLib || !pdfjsLib.getDocument) {
          resolve(null);
          return;
        }
        try {
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
          pdfjsLib.getDocument(pdfUrl).promise.then((pdf: any) => {
            pdf.getPage(1).then((page: any) => {
              const viewport = page.getViewport({ scale: 1.5 });
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              page.render({ canvasContext: ctx, viewport }).promise.then(() => {
                try {
                  const dataUrl = canvas.toDataURL('image/png');
                  resolve(dataUrl);
                } catch (err) {
                  resolve(null);
                }
              }).catch((e: any) => resolve(null));
            }).catch(() => resolve(null));
          }).catch(() => resolve(null));
        } catch (e) { resolve(null); }
      };

      if (!(window as any).pdfjsLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
        script.onload = () => finishRender();
        script.onerror = () => resolve(null);
        document.head.appendChild(script);
      } else {
        finishRender();
      }
    });
  }
  
  
}
