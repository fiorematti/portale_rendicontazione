import { Component, OnInit } from '@angular/core';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Spesa {
  data: string;
  codice: string;
  richiesto: string;
  validato: string;
  pagato: boolean;
  idCliente?: number | null;
}

interface ClienteApiItem {
  idCliente: number;
  nominativo: string;
}

interface OrdineApiItem {
  codiceOrdine: string;
  idCliente: number;
}

interface DettaglioSpesa {
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
}

@Component({
  selector: 'app-note-spese',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgForOf, HttpClientModule],
  templateUrl: './note-spese.html',
  styleUrl: './note-spese.css',
})
export class NoteSpese implements OnInit {
  private readonly filtroDefault = 'Tutti';
  readonly clientiOptions: ClienteApiItem[] = [];
  private ordiniCache: Record<number, OrdineApiItem[]> = {};

  listaSpese: Spesa[] = [
    { data: '14/01/2026', codice: 'AAAA/xxxx', richiesto: '215,00€', validato: '190,00€', pagato: true },
    { data: '15/01/2026', codice: 'BBBB/yyyy', richiesto: '120,00€', validato: '120,00€', pagato: true },
    { data: '16/01/2026', codice: 'CCCC/zzzz', richiesto: '45,00€', validato: '40,00€', pagato: false },
  ];

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

  rigaSelezionata: Spesa | null = null;

  mostraCalendario = false;
  targetData: 'filtro' | 'popup' = 'filtro';
  dataVisualizzata: Date = new Date();
  giorniDelMese: number[] = [];
  giorniVuoti: number[] = [];

  get isAggiungi(): boolean { return this.modalMode === 'aggiungi'; }
  get isVisualizza(): boolean { return this.modalMode === 'visualizza'; }
  get isModifica(): boolean { return this.modalMode === 'modifica'; }

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.generaCalendario();
    this.loadClienti();
    this.loadSpese();
    this.resetNuovaSpesa();
  }

  visualizzaDettaglio(spesa: Spesa): void {
    this.rigaSelezionata = spesa;
    this.caricaDatiNellaModal(spesa);
    this.apriModalConModalita('visualizza');
  }

  apriModifica(spesa: Spesa): void {
    this.rigaSelezionata = spesa;
    this.caricaDatiNellaModal(spesa);
    this.apriModalConModalita('modifica');
  }

  eliminaSpesa(indexTable: number): void {
    const spesaDaEliminare = this.speseFiltrate[indexTable];
    const indexReale = this.listaSpese.indexOf(spesaDaEliminare);
    if (confirm("Sei sicuro di voler eliminare questa nota spesa?")) {
      this.listaSpese.splice(indexReale, 1);
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
      this.http.post<boolean>('http://localhost:5000/api/SpesaNota/Utente/AddSpesa', payload).subscribe({
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
  }

  get totaleCalcolato(): number {
    return this.dettagliSpesa.reduce((acc, dett) => acc + this.sommaDettaglio(dett), 0);
  }

  toggleCalendario(target: 'filtro' | 'popup'): void {
    if (this.isVisualizza && target === 'popup') return;
    const opening = !this.mostraCalendario || this.targetData !== target;
    this.targetData = target;

    if (opening) {
      this.syncCalendarioConData(target);
      this.mostraCalendario = true;
    } else {
      this.mostraCalendario = false;
    }
  }

  generaCalendario(): void {
    const anno = this.dataVisualizzata.getFullYear();
    const mese = this.dataVisualizzata.getMonth();
    let primoGiorno = new Date(anno, mese, 1).getDay();
    primoGiorno = primoGiorno === 0 ? 6 : primoGiorno - 1;
    this.giorniVuoti = Array(primoGiorno).fill(0);
    const numGiorni = new Date(anno, mese + 1, 0).getDate();
    this.giorniDelMese = Array.from({ length: numGiorni }, (_, i) => i + 1);
  }

  selezionaGiorno(g: number): void {
    const d = `${String(g).padStart(2, '0')}/${String(this.dataVisualizzata.getMonth() + 1).padStart(2, '0')}/${this.dataVisualizzata.getFullYear()}`;
    if (this.targetData === 'filtro') this.filtroData = d; else this.nuovaSpesaData = d;
    this.syncCalendarioConData(this.targetData);
    this.mostraCalendario = false;
  }

  cambiaMese(d: number): void {
    this.dataVisualizzata.setMonth(this.dataVisualizzata.getMonth() + d);
    this.generaCalendario();
  }

  isGiornoSelezionato(giorno: number, target: 'filtro' | 'popup'): boolean {
    const data = this.parseDataString(target === 'filtro' ? this.filtroData : this.nuovaSpesaData);
    if (!data) return false;
    return (
      data.getDate() === giorno &&
      data.getMonth() === this.dataVisualizzata.getMonth() &&
      data.getFullYear() === this.dataVisualizzata.getFullYear()
    );
  }

  formattaData(event: Event, campo: string): void {
    const target = event.target as HTMLInputElement;
    let v = target.value.replace(/\D/g, '');
    if (v.length > 8) v = v.substring(0, 8);
    if (v.length >= 5) v = v.replace(/(\d{2})(\d{2})(\d{1,4})/, '$1/$2/$3');
    else if (v.length >= 3) v = v.replace(/(\d{2})(\d{1,2})/, '$1/$2');
    if (campo === 'filtro') this.filtroData = v; else this.nuovaSpesaData = v;
  }

  get nomeMeseCorrente(): string { return this.dataVisualizzata.toLocaleString('it-IT', { month: 'long' }); }
  get annoVisualizzato(): number { return this.dataVisualizzata.getFullYear(); }

  get speseFiltrate(): Spesa[] {
    return this.listaSpese.filter((s) => {
      const mPagato = this.filtroPagate === this.filtroDefault || (this.filtroPagate === 'Si' ? s.pagato : !s.pagato);
      const mData = !this.filtroData || s.data === this.filtroData;
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

  private apriModalConModalita(mode: 'aggiungi' | 'visualizza' | 'modifica'): void {
    this.modalMode = mode;
    this.mostraModal = true;
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
      data: this.nuovaSpesaData,
      codice: dett.codiceOrdine,
      richiesto: totale,
      validato: '0,00€',
      pagato: false,
      idCliente: dett.idCliente ?? null,
    };
  }

  private loadSpese(year: number = new Date().getFullYear()): void {
    this.isSpeseLoading = true;
    const url = `http://localhost:5000/api/SpesaNota/Utente/GetSpeseByUserAndYear?year=${year}`;
    console.log('[NoteSpese] Loading spese from', url);
    this.http.get<any[]>(url).subscribe({
      next: (res) => {
        console.log('[NoteSpese] loadSpese response:', res);
        const mapped = (res || []).map(item => {
          const idCliente = item?.idCliente ?? item?.idClienteOrdine ?? item?.clienteId ?? null;
          return {
            data: this.formatDateIt(item.dataNotificazione),
            codice: item.codiceOrdine || '',
            richiesto: this.formattaTotaleNumber(item.totaleComplessivo || 0),
            validato: this.formattaTotaleNumber(item.totaleValidato || 0),
            pagato: Boolean(item.statoPagamento),
            idCliente,
          } as Spesa;
        });
        this.listaSpese = mapped;
        this.enrichSpeseWithClienti();
        this.rebuildFiltroOrdiniOptions();
      },
      error: (err) => {
        console.error('[NoteSpese] loadSpese error:', err);
        this.loadErrore = `Errore caricamento spese: ${err?.status || 'n/a'}`;
      },
      complete: () => {
        this.isSpeseLoading = false;
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
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) return 0;
    return n;
  }

  blockNegative(event: KeyboardEvent): void {
    const blockedKeys = ['-', '+', 'e', 'E'];
    if (blockedKeys.includes(event.key)) {
      event.preventDefault();
    }
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

  private parseDataString(valore: string): Date | null {
    if (!valore || valore.length !== 10) return null;
    const [giorno, mese, anno] = valore.split('/').map((part) => Number(part));
    if (!giorno || !mese || !anno) return null;
    const data = new Date(anno, mese - 1, giorno);
    return Number.isNaN(data.getTime()) ? null : data;
  }

  private syncCalendarioConData(target: 'filtro' | 'popup'): void {
    const data = this.parseDataString(target === 'filtro' ? this.filtroData : this.nuovaSpesaData) || new Date();
    this.dataVisualizzata = new Date(data.getFullYear(), data.getMonth(), 1);
    this.generaCalendario();
  }

  private formatDateIt(val: string | null | undefined): string {
    if (!val) return '';
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return '';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
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
    const url = `http://localhost:5000/api/Utente/utente/getClienteByUtente`;
    console.log('[NoteSpese] Loading clienti from', url);
    this.http.get<ClienteApiItem[]>(url).subscribe({
      next: (res) => {
        console.log('[NoteSpese] loadClienti response:', res);
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
      const url = `http://localhost:5000/api/Ordini?IdCliente=${idCliente}`;
      console.log('[NoteSpese] Loading ordini from', url);
      this.http.get<OrdineApiItem[]>(url).subscribe({
        next: (res) => {
          console.log('[NoteSpese] loadOrdini response for', idCliente, res);
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
    return cacheValues.find(o => o.codiceOrdine === codice);
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

  private buildAddPayload(): any {
    const dataNotificazione = this.formatDateISO(this.nuovaSpesaData);
    const dettagli = this.dettagliSpesa.map(d => ({
      dataDettaglio: this.formatDateISO(this.nuovaSpesaData),
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

  private formatDateISO(valore: string): string {
    const data = this.parseDataString(valore) || new Date();
    const yyyy = data.getFullYear();
    const mm = String(data.getMonth() + 1).padStart(2, '0');
    const dd = String(data.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}