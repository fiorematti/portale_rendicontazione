import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttivitaService, AttivitaItem, AddAttivitaPayload, UpdateAttivitaPayload } from './attivitaservice';
import { ClientiOrdiniService } from '../../shared/services/clienti-ordini.service';
import { ClienteApiItem } from '../../dto/cliente.dto';
import { OrdineApiItem } from '../../dto/ordine.dto';
import { LuogoApiItem } from '../../dto/luogo.dto';
import { clampNonNegative, blockNegative } from '../../shared/utils/input.utils';
import { creaIntervalloAnni } from '../../shared/utils/date.utils';
import { AuthService } from '../../auth/auth.service';

type FormatoExport = 'PDF' | 'EXCEL';

/** Rappresenta un giorno nella griglia del calendario */
interface GiornoCalendario {
  valore: number;
  corrente: boolean;
}

@Component({
  selector: 'app-attivita',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgFor],
  templateUrl: './attivita.html',
  styleUrls: ['./attivita.css'],
})
/**
 * Componente per la gestione delle attività lavorative giornaliere.
 * Permette di visualizzare, aggiungere, modificare ed eliminare attività
 * associate a ordini e clienti, con un limite massimo di 8 ore al giorno.
 */
export class Attivita implements OnInit {
  /** Abbreviazioni dei mesi per il selettore calendario */
  readonly listaMesi = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  private readonly annoInizio = 2020;
  private readonly annoFine = 2030;
  /** Limite massimo di ore lavorative inseribili per un singolo giorno */
  private readonly maxOreGiornaliere = 8;

  /** Giorno attualmente selezionato nel calendario */
  giornoSelezionato = 1;
  meseCorrente = 0;
  annoCorrente = 2000;

  /** Griglia dei giorni del calendario corrente */
  giorniCalendario: GiornoCalendario[] = [];
  /** Anni disponibili nel selettore */
  listaAnni: number[] = [];
  /** Attività caricate per il giorno selezionato */
  listaAttivita: AttivitaItem[] = [];
  /** Opzioni disponibili per il luogo di lavoro */
  locationOptions: LuogoApiItem[] = [];

  /** Opzioni per il dropdown dei clienti */
  clientiOptions: ClienteApiItem[] = [];
  /** Opzioni per il dropdown degli ordini (filtrate per cliente) */
  ordiniOptions: OrdineApiItem[] = [];
  selectedClienteId: number | null = null;
  selectedCodice: string | null = null;
  selectedLocationId: number | null = null;
  /** Flag per evitare ricaricamenti multipli dei dati */
  private clientiLoaded = false;
  private ordiniLoaded = false;
  private locationLoaded = false;

  isLoading = false;
  errorMsg = '';

  // Export popup state (allineato a Registro Attività)
  showExportPopup = false;
  exportMese: number = new Date().getMonth();
  exportUtente: string = '';
  formatoSelezionato: FormatoExport | null = null;

  /** Attività in fase di creazione o modifica nel form */
  nuovaAttivita: AttivitaItem = this.creaAttivitaVuota();
  mostraModal = false;
  isModifica = false;
  indiceInModifica = -1;
  mostraErrore = false;
  /** Indica se è aperta la vista dettaglio di un'attività */
  isDettaglioOpen = false;
  attivitaDettaglio: AttivitaItem | null = null;

  constructor(
    private readonly attivitaService: AttivitaService,
    private readonly clientiOrdiniService: ClientiOrdiniService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.impostaDataOggi();
    this.listaAnni = creaIntervalloAnni(this.annoInizio, this.annoFine);
    this.generaCalendario();
    this.loadClienti();
    this.loadLocation();
    this.loadAttivita();
  }

  /** Apre la modale in modalità creazione, resettando il form */
  apriModal(): void {
    this.isModifica = false;
    this.mostraErrore = false;
    this.nuovaAttivita = this.creaAttivitaVuota();
    this.selectedClienteId = null;
    this.selectedCodice = null;
    this.selectedLocationId = null;
    this.errorMsg = '';
    this.mostraModal = true;
  }

  /** Apre la modale in modalità modifica, precaricando i dati dell'attività selezionata */
  modificaAttivita(index: number): void {
    this.isModifica = true;
    this.indiceInModifica = index;
    this.nuovaAttivita = { ...this.listaAttivita[index] };
    this.selectedClienteId = this.findClienteIdByNome(this.nuovaAttivita.nominativoCliente);
    this.selectedCodice = this.nuovaAttivita.codiceOrdine || null;
    this.selectedLocationId = this.findLocationIdByNome(this.nuovaAttivita.location);
    this.mostraModal = true;
  }

  /** Apre il pannello dettaglio per un'attività specifica */
  apriDettaglio(attivita: AttivitaItem, index: number): void {
    this.attivitaDettaglio = attivita;
    this.indiceInModifica = index;
    this.isDettaglioOpen = true;
  }

  chiudiDettaglio(): void {
    this.isDettaglioOpen = false;
    this.attivitaDettaglio = null;
  }

  modificaDaDettaglio(): void {
    if (this.indiceInModifica < 0) return;
    this.isDettaglioOpen = false;
    this.modificaAttivita(this.indiceInModifica);
  }

  chiudiModal(): void {
    this.mostraModal = false;
    this.isModifica = false;
    this.mostraErrore = false;
  }

  /**
   * Conferma l'aggiunta o la modifica di un'attività.
   * Valida i campi obbligatori e controlla il limite ore giornaliere
   * prima di inviare la richiesta al backend.
   */
  confermaAggiunta(): void {
    if (!this.isAttivitaValida(this.nuovaAttivita)) {
      this.mostraErrore = true;
      setTimeout(() => (this.mostraErrore = false), 4000);
      return;
    }

    const oreRichieste = Number(this.nuovaAttivita.ore) || 0;
    const totaleGiorno = this.totaleOreGiornata();
    if (this.eccedeLimiteGiornaliero(oreRichieste, -1)) {
      this.setLimiteOreMsg(totaleGiorno, oreRichieste);
      return;
    }

    if (this.isModifica) {
      this.confermaModifica();
      return;
    }

    const payload = this.buildAddPayload();

    this.attivitaService.addAttivita(payload).subscribe({
      next: (res: any) => {
        if (res && res.esito) {
          this.chiudiModal();
          this.aggiornaAttivitaPerData();
        } else {
          this.errorMsg = 'Errore nella creazione dell\'attività';
        }
        if (res?.skippedDates && res.skippedDates.length) {
          this.errorMsg = `Alcune date non sono state aggiunte: ${res.skippedDates.join(', ')}`;
        }
      },
      error: (err: any) => {
        console.error('addAttivita error:', err);
        this.errorMsg = 'Errore durante la creazione dell\'attività';
      }
    });
  }

  /** Invia la richiesta di modifica al backend dopo validazione ore */
  private confermaModifica(): void {
    const idx = this.indiceInModifica;
    const target = this.listaAttivita[idx];
    if (!target) return;

    const oreRichieste = Number(this.nuovaAttivita.ore) || 0;
    const totaleGiorno = this.totaleOreGiornata(idx);
    if (this.eccedeLimiteGiornaliero(oreRichieste, idx)) {
      this.setLimiteOreMsg(totaleGiorno, oreRichieste);
      return;
    }

    const payload = this.buildUpdatePayload();
    const dataAttivita = payload.dataAttivita;
    console.log('Modifica Attività - Payload:', payload);
    this.isLoading = true;
    this.errorMsg = '';
    this.attivitaService.updateAttivita(payload).subscribe({
      next: (res) => {
        if (this.esitoRiuscito(res?.esito)) {
          this.listaAttivita[idx] = { ...this.nuovaAttivita, dataAttivita };
          this.chiudiModal();
          this.aggiornaAttivitaPerData();
        } else {
          this.errorMsg = res?.motivazione || 'Aggiornamento non riuscito';
        }
      },
      error: (err) => {
        console.error('updateAttivita error:', err);
        this.errorMsg = 'Errore durante la modifica dell\'attività';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  /** Elimina un'attività dopo conferma utente */
  eliminaAttivita(index: number): void {
    const target = this.listaAttivita[index];
    if (!target) return;
    if (!confirm('Sei sicuro di voler eliminare questa attività?')) return;

    this.isLoading = true;
    this.errorMsg = '';
    this.attivitaService.deleteAttivita(target.idAttivita).subscribe({
      next: (res) => {
        if (this.esitoRiuscito(res?.esito)) {
          this.listaAttivita.splice(index, 1);
        } else {
          this.errorMsg = res?.motivazione || 'Eliminazione non riuscita';
        }
      },
      error: (err) => {
        console.error('deleteAttivita error:', err);
        this.errorMsg = 'Errore durante l\'eliminazione dell\'attività';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  /** Totale ore formattato (es. "6:00") per il giorno selezionato */
  get totaleOreCalcolato(): string {
    const totale = this.totaleOreGiornata();
    return `${totale}:00`;
  }

  /**
   * Genera la griglia del calendario per il mese/anno corrente.
   * Include i giorni del mese precedente e successivo per riempire la griglia 6x7.
   */
  generaCalendario(): void {
    this.meseCorrente = Number(this.meseCorrente);
    this.annoCorrente = Number(this.annoCorrente);

    this.giorniCalendario = [];
    const primoGiornoMese = new Date(this.annoCorrente, this.meseCorrente, 1).getDay();
    const giorniTotaliMese = new Date(this.annoCorrente, this.meseCorrente + 1, 0).getDate();
    const giorniMesePrec = new Date(this.annoCorrente, this.meseCorrente, 0).getDate();

    for (let i = primoGiornoMese - 1; i >= 0; i--) {
      this.giorniCalendario.push({ valore: giorniMesePrec - i, corrente: false });
    }
    for (let i = 1; i <= giorniTotaliMese; i++) {
      this.giorniCalendario.push({ valore: i, corrente: true });
    }
    const celleRimanenti = 42 - this.giorniCalendario.length;
    for (let i = 1; i <= celleRimanenti; i++) {
      this.giorniCalendario.push({ valore: i, corrente: false });
    }

    if (this.giornoSelezionato > giorniTotaliMese) {
      this.giornoSelezionato = giorniTotaliMese;
    }
  }

  /** Avanza o retrocede di un giorno e ricarica le attività */
  cambiaGiorno(direzione: number): void {
    const data = new Date(this.annoCorrente, this.meseCorrente, this.giornoSelezionato);
    data.setDate(data.getDate() + direzione);
    this.giornoSelezionato = data.getDate();
    this.meseCorrente = data.getMonth();
    this.annoCorrente = data.getFullYear();
    this.generaCalendario();
    this.aggiornaAttivitaPerData();
  }

  selezionaGiorno(giorno: GiornoCalendario): void {
    if (giorno.corrente) {
      this.giornoSelezionato = giorno.valore;
      this.aggiornaAttivitaPerData();
    }
  }

  /** Crea un oggetto attività vuoto con valori di default */
  private creaAttivitaVuota(): AttivitaItem {
    return {
      idAttivita: 0,
      codiceOrdine: '',
      nominativoCliente: '',
      location: '',
      ore: 4,
      dataAttivita: this.dataSelezionataISO(),
    };
  }

  /** Imposta giorno, mese e anno alla data odierna */
  private impostaDataOggi(): void {
    const oggi = new Date();
    this.giornoSelezionato = oggi.getDate();
    this.meseCorrente = oggi.getMonth();
    this.annoCorrente = oggi.getFullYear();
  }

  /** Callback al cambio del selettore mese/anno */
  onCambioMeseAnno(): void {
    this.generaCalendario();
    this.aggiornaAttivitaPerData();
  }

  /** Valida che l'attività abbia codice ordine, luogo e ore > 0 */
  private isAttivitaValida(attivita: AttivitaItem): boolean {
    const { codiceOrdine, ore } = attivita;
    const hasLocation = this.selectedLocationId != null || Boolean(attivita.location.trim());
    return Boolean(codiceOrdine.trim() && hasLocation && Number(ore) > 0);
  }

  clampNonNegative(value: number | string | null | undefined): number {
    return clampNonNegative(value);
  }

  blockNegative(event: KeyboardEvent): void {
    blockNegative(event);
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
      alert('Seleziona il formato PDF o EXCEL per esportare.');
      return;
    }

    const userId = Number(this.authService.userSnapshot()?.id || 0);
    if (!userId) {
      alert('Impossibile recuperare l\'utente per l\'export.');
      return;
    }

    const year = Number(this.annoCorrente) || new Date().getFullYear();
    const monthNumber = (this.exportMese ?? new Date().getMonth()) + 1;
    const monthParam = monthNumber < 10 ? `0${monthNumber}` : `${monthNumber}`;
    const onSuccess = (blob: Blob, extension: string) => {
      const filename = `Riepilogo_${userId}_${year}_${monthParam}.${extension}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      this.showExportPopup = false;
      this.formatoSelezionato = null;
    };

    if (this.formatoSelezionato === 'EXCEL') {
      this.attivitaService.exportExcelMensile(userId, year, monthParam).subscribe({
        next: (blob) => onSuccess(blob, 'xlsx'),
        error: (err) => {
          console.error('exportExcelMensile error:', err);
          alert('Errore durante l\'export in Excel.');
        }
      });
    } else {
      this.attivitaService.exportPdfMensile(userId, year, monthParam).subscribe({
        next: (blob) => onSuccess(blob, 'pdf'),
        error: (err) => {
          console.error('exportPdfMensile error:', err);
          alert('Errore durante l\'export in PDF.');
        }
      });
    }
  }

  /** Restituisce la data selezionata in formato ISO yyyy-MM-dd */
  private dataSelezionataISO(): string {
    const month = this.meseCorrente + 1;
    const mm = month < 10 ? `0${month}` : `${month}`;
    const dd = this.giornoSelezionato < 10 ? `0${this.giornoSelezionato}` : `${this.giornoSelezionato}`;
    return `${this.annoCorrente}-${mm}-${dd}`;
  }

  private aggiornaAttivitaPerData(): void {
    this.loadAttivita();
  }

  private loadAttivita(): void {
    this.isLoading = true;
    this.errorMsg = '';
    const data = this.dataSelezionataISO();
    this.attivitaService.getAttivita(data).subscribe({
      next: (res: AttivitaItem[] | null) => {
        const selected = data;
        const items = (res ?? [])
          .filter((item: AttivitaItem) => (item.dataAttivita || '').slice(0, 10) === selected);
        this.listaAttivita = items;
      },
      error: (err: any) => { this.errorMsg = 'Errore caricamento dati'; console.error(err); },
      complete: () => { this.isLoading = false; }
    });
  }

  private loadLocation(): void {
    if (this.locationLoaded) return;
    this.attivitaService.getLocation().subscribe({
      next: (res) => {
        this.locationOptions = res || [];
        this.locationLoaded = true;
      },
      error: (err) => { console.error('getLocation error:', err); }
    });
  }

  /** Costruisce il payload per la creazione di una nuova attività */
  private buildAddPayload(): AddAttivitaPayload {
    const dataInizio = this.dataSelezionataISO();
    const luogoId = this.selectedLocationId ?? this.findLocationIdByNome(this.nuovaAttivita.location) ?? 0;
    return {
      codiceOrdine: this.nuovaAttivita.codiceOrdine,
      luogo: luogoId,
      dataInizio,
      dataFine: dataInizio,
      ricorrenza: [],
      oreLavoro: this.nuovaAttivita.ore,
    };
  }

  /** Costruisce il payload per l'aggiornamento di un'attività esistente */
  private buildUpdatePayload(): UpdateAttivitaPayload {
    const dataAttivita = (this.nuovaAttivita.dataAttivita || this.dataSelezionataISO()).slice(0, 10);
    const luogoId = this.selectedLocationId ?? this.findLocationIdByNome(this.nuovaAttivita.location) ?? 0;
    return {
      idAttivita: this.nuovaAttivita.idAttivita,
      codiceOrdine: this.nuovaAttivita.codiceOrdine,
      luogo: luogoId,
      dataAttivita,
      oreLavoro: this.nuovaAttivita.ore,
    };
  }

  /** Verifica se l'esito dell'API indica operazione riuscita */
  private esitoRiuscito(esito?: string): boolean {
    return (esito || '').toLowerCase().includes('riuscita');
  }

  /** Quando cambia il cliente selezionato, ricarica gli ordini associati */
  onClienteChange(): void {
    if (this.selectedClienteId == null) return;
    this.syncClienteFromId(this.selectedClienteId);
    // Ricarica ordini per il cliente selezionato
    this.ordiniLoaded = false;
    this.selectedCodice = null;
    this.nuovaAttivita.codiceOrdine = '';
    this.loadOrdini(this.selectedClienteId);
  }

  onCodiceChange(): void {
    if (!this.selectedCodice) return;
    this.nuovaAttivita.codiceOrdine = this.selectedCodice;
  }

  onLocationChange(): void {
    if (this.selectedLocationId == null) return;
    const found = this.locationOptions.find(l => l.idLuogo === this.selectedLocationId);
    if (found) this.nuovaAttivita.location = found.luogo;
  }

  private findClienteIdByNome(nome: string): number | null {
    const found = this.clientiOptions.find(c => c.nominativo === nome);
    return found ? found.idCliente : null;
  }

  private loadClienti(): void {
    if (this.clientiLoaded) return;
    this.clientiOrdiniService.getClienti().subscribe({
      next: (res) => {
        this.clientiOptions = res || [];
        this.clientiLoaded = true;
      },
      error: (err) => { console.error('getClienti error:', err); }
    });
  }

  private loadOrdini(clienteId?: number): void {
    if (clienteId == null) {
      this.ordiniOptions = [];
      return;
    }
    this.clientiOrdiniService.getOrdiniByUtenteAndCliente(clienteId).subscribe({
      next: (res) => {
        this.ordiniOptions = res || [];
        this.ordiniLoaded = true;
      },
      error: (err) => { console.error('getOrdiniByUtenteAndCliente error:', err); }
    });
  }

  private findLocationIdByNome(nome: string): number | null {
    const found = this.locationOptions.find(l => l.luogo === nome);
    return found ? found.idLuogo : null;
  }

  private syncClienteFromId(idCliente: number): void {
    const cliente = this.clientiOptions.find(c => c.idCliente === idCliente);
    if (!cliente) return;
    this.nuovaAttivita.nominativoCliente = cliente.nominativo;
  }

  /**
   * Calcola il totale ore del giorno, escludendo opzionalmente un'attività (utile in modifica).
   * @param excludeIndex - Indice dell'attività da escludere dal calcolo
   */
  private totaleOreGiornata(excludeIndex: number = -1): number {
    return this.listaAttivita.reduce((acc, item, idx) => {
      const ore = Number(item.ore) || 0;
      return idx === excludeIndex ? acc : acc + ore;
    }, 0);
  }

  /** Verifica se aggiungere le ore supererebbe il limite giornaliero */
  private eccedeLimiteGiornaliero(oreDaAggiungere: number, excludeIndex: number): boolean {
    return this.totaleOreGiornata(excludeIndex) + oreDaAggiungere > this.maxOreGiornaliere;
  }

  /** Imposta il messaggio di errore per superamento limite ore */
  private setLimiteOreMsg(totaleAttuale: number, oreRichieste: number): void {
    const restante = this.maxOreGiornaliere - totaleAttuale;
    this.errorMsg = restante <= 0
      ? `Hai già raggiunto il limite massimo di ${this.maxOreGiornaliere} ore per il giorno selezionato.`
      : `Limite giornaliero di ${this.maxOreGiornaliere} ore superato: ore già inserite ${totaleAttuale}. Ore disponibili: ${restante}.`;
    setTimeout(() => (this.errorMsg = ''), 10000);
  }

  clearErrorMsg(): void {
    this.errorMsg = '';
  }

}