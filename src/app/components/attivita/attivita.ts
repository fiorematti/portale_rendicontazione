import { Component, OnInit } from '@angular/core';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttivitaService, AttivitaItem, AddAttivitaPayload, UpdateAttivitaPayload, ClienteApiItem, OrdineApiItem } from './attivitaservice';


// Rappresenta una singola cella del mini-calendario
// `valore`: giorno del mese
// `corrente`: true se il giorno appartiene al mese visualizzato
interface GiornoCalendario {
  valore: number;
  corrente: boolean;
}

@Component({
  selector: 'app-attivita',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgForOf],
  templateUrl: './attivita.html',
  styleUrls: ['./attivita.css'],
})
export class Attivita implements OnInit {
  readonly listaMesi = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  private readonly annoInizio = 2020;
  private readonly annoFine = 2030;
  private readonly maxOreGiornaliere = 8;

  giornoSelezionato = 1;
  meseCorrente = 0; // verrà aggiornato a runtime
  annoCorrente = 2000; // verrà aggiornato a runtime

  // Stato e dati della UI
  giorniCalendario: GiornoCalendario[] = [];
  listaAnni: number[] = [];
  listaAttivita: AttivitaItem[] = [];

  // Opzioni caricate dal backend per i select nel modal
  clientiOptions: ClienteApiItem[] = [];
  ordiniOptions: OrdineApiItem[] = [];
  // Selezioni correnti nel form/modal
  selectedClienteId: number | null = null;
  selectedCodice: string | null = null;
  private clientiLoaded = false;   // evita ricariche ridondanti della lista clienti


  isLoading = false;
  errorMsg = '';

  nuovaAttivita: AttivitaItem = this.creaAttivitaVuota();
  mostraModal = false;
  isModifica = false;
  indiceInModifica = -1;
  mostraErrore = false;
  isDettaglioOpen = false;
  attivitaDettaglio: AttivitaItem | null = null;

  // Il service inietta l'HTTP layer
  constructor(private attivitaService: AttivitaService) {}

  ngOnInit(): void {
    // Inizializza data e visualizzazione, poi carica dati necessari
    this.impostaDataOggi();
    this.listaAnni = this.creaIntervalloAnni();
    this.generaCalendario();
    this.loadClienti();// carico i clienti per popolare il select del modal
    this.loadAttivita(); // carico le attività per la data attuale
  }

  apriModal(): void {
    this.isModifica = false;
    this.mostraErrore = false;
    this.nuovaAttivita = this.creaAttivitaVuota();
    this.selectedClienteId = null;
    this.selectedCodice = null;
    this.ordiniOptions = [];
    this.errorMsg = '';
    this.mostraModal = true;
  }

  // Apre il modal per la creazione di una nuova attività e resetta i campi del form e i select collegati.

  modificaAttivita(index: number): void {
    this.isModifica = true;
    this.indiceInModifica = index;
    this.nuovaAttivita = { ...this.listaAttivita[index] };
    // Preimposto i select nel modal in base all'attività da modificare
    this.selectedClienteId = this.findClienteIdByNome(this.nuovaAttivita.nominativoCliente);
    this.selectedCodice = this.nuovaAttivita.codiceOrdine || null;
    // Carico gli ordini del cliente; `keepSelection=true` mantiene il codice se ancora presente
    this.loadOrdiniByCliente(this.selectedClienteId, true);
    this.mostraModal = true;
  }

  // Apre il modal per modifica. Prepopola i select cliente/ordine e mantiene
  // la selezione del codice se ancora presente tra gli ordini del cliente.

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
        if (err && err.error) console.error('addAttivita error.body:', err.error);
        this.errorMsg = 'Errore durante la creazione dell\'attività';
      }
    });
  }

  // Conferma l'aggiunta: valida il form, costruisce il payload e chiama il POST.
  // Gestisce feedback di errore e messaggi di skippedDates (se presenti).

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

    // Effettua la chiamata al backend per aggiornare l'attività
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

  eliminaAttivita(index: number): void {
    const target = this.listaAttivita[index];
    if (!target) return;
    if (!confirm('Sei sicuro di voler eliminare questa attività?')) return;

    // Chiamata al backend per eliminare l'attività selezionata
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

  get totaleOreCalcolato(): string {
    const totale = this.totaleOreGiornata();
    return `${totale}:00`;
  }

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

  private creaAttivitaVuota(): AttivitaItem {
    return {
      idAttivita: 0,
      codiceOrdine: '',
      nominativoCliente: '',
      location: '',
      ore: 0,
      dataAttivita: this.dataSelezionataISO(),
    };
  }

  private creaIntervalloAnni(): number[] {
    const anni: number[] = [];
    for (let anno = this.annoInizio; anno <= this.annoFine; anno++) {
      anni.push(anno);
    }
    return anni;
  }

  private impostaDataOggi(): void {
    const oggi = new Date();
    this.giornoSelezionato = oggi.getDate();
    this.meseCorrente = oggi.getMonth();
    this.annoCorrente = oggi.getFullYear();
  }

  onCambioMeseAnno(): void {
    this.generaCalendario();
    this.aggiornaAttivitaPerData();
  }

  private isAttivitaValida(attivita: AttivitaItem): boolean {
    const { codiceOrdine, nominativoCliente, location, ore } = attivita;
    return Boolean(codiceOrdine.trim() && nominativoCliente.trim() && location.trim() && Number(ore) > 0);
  }

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
        this.listaAttivita = (res ?? [])
          .filter((item: AttivitaItem) => (item.dataAttivita || '').slice(0, 10) === selected);
      },
      error: (err: any) => { this.errorMsg = 'Errore caricamento dati'; console.error(err); },
      complete: () => { this.isLoading = false; }
    });
  }

  // Ritorna la data selezionata come stringa ISO (YYYY-MM-DD) usata per le query
  // Usata da `loadAttivita` e dai builders di payload per garantire coerenza


  private buildAddPayload(): AddAttivitaPayload {
    const dataInizio = this.dataSelezionataISO();
    return {
      codiceOrdine: this.nuovaAttivita.codiceOrdine,
      luogo: this.nuovaAttivita.location,
      dataInizio,
      dataFine: dataInizio, // dataFine deve essere valorizzata con dataInizio
      ricorrenza: [],
      oreLavoro: this.nuovaAttivita.ore,
    };
  }

  // Costruisce il payload per la chiamata POST di creazione e mappa i campi del form nella shape richiesta dal backend.  

  private buildUpdatePayload(): UpdateAttivitaPayload {
    const dataAttivita = (this.nuovaAttivita.dataAttivita || this.dataSelezionataISO()).slice(0, 10);
    return {
      idAttivita: this.nuovaAttivita.idAttivita,
      codiceOrdine: this.nuovaAttivita.codiceOrdine,
      luogo: this.nuovaAttivita.location,
      dataAttivita,
      oreLavoro: this.nuovaAttivita.ore,
    };
  }

  // Costruisce il payload per la chiamata PUT di aggiornamento e assicura che dataAttivita sia in formato YYYY-MM-DD. Il backend si aspetta questa forma per processare correttamente la data
  private esitoRiuscito(esito?: string): boolean {
    return (esito || '').toLowerCase().includes('riuscita');
  }

  onClienteChange(): void {
    if (this.selectedClienteId == null) return;
    // L'utente ha selezionato un cliente dal select: sincronizzo nominativo e carico ordini
    this.syncClienteFromId(this.selectedClienteId);
    this.loadOrdiniByCliente(this.selectedClienteId);
  }

  onCodiceChange(): void {
    if (!this.selectedCodice) return;
    const ordine = this.ordiniOptions.find(o => o.codiceOrdine === this.selectedCodice);
    this.nuovaAttivita.codiceOrdine = this.selectedCodice;
    if (ordine && ordine.idCliente) {
      // Se l'ordine selezionato porta con sé l'id cliente, sincronizzo anche il select cliente
      this.selectedClienteId = ordine.idCliente;
      this.syncClienteFromId(ordine.idCliente);
    }
  }

  private findClienteIdByNome(nome: string): number | null {
    const found = this.clientiOptions.find(c => c.nominativo === nome);
    return found ? found.idCliente : null;
  }

  private loadClienti(): void {
    if (this.clientiLoaded) return;
    this.attivitaService.getClienti().subscribe({
      next: (res) => {
        this.clientiOptions = res || [];
        this.clientiLoaded = true;
      },
      error: (err) => { console.error('getClienti error:', err); }
    });
  }

  private loadOrdiniByCliente(idCliente: number | null, keepSelection: boolean = false): void {
    this.ordiniOptions = [];
    if (idCliente == null) return;
    this.attivitaService.getOrdini(idCliente).subscribe({
      next: (res) => {
        // filtro e imposto le opzioni ordini nel select e non forzo selezioni automatiche
        // Shape attesa ordine: { codiceOrdine: string, idCliente: number, ... }
        const list = (res || []).filter(o => !idCliente || o.idCliente === idCliente);
        this.ordiniOptions = list;
        if (keepSelection && this.selectedCodice) {
          const exists = list.some(o => o.codiceOrdine === this.selectedCodice);
          if (!exists) this.selectedCodice = null;
        }
      },
      error: (err) => { console.error('getOrdini error:', err); }
    });
  }

  private syncClienteFromId(idCliente: number): void {
    // Aggiorna il campo `nominativoCliente` nell'oggetto attività a partire dall'id selezionato
    const cliente = this.clientiOptions.find(c => c.idCliente === idCliente);
    if (!cliente) return;
    this.nuovaAttivita.nominativoCliente = cliente.nominativo;
  }

  private totaleOreGiornata(excludeIndex: number = -1): number {
    return this.listaAttivita.reduce((acc, item, idx) => {
      const ore = Number(item.ore) || 0;
      return idx === excludeIndex ? acc : acc + ore;
    }, 0);
  }

  private eccedeLimiteGiornaliero(oreDaAggiungere: number, excludeIndex: number): boolean {
    return this.totaleOreGiornata(excludeIndex) + oreDaAggiungere > this.maxOreGiornaliere;
  }

  private setLimiteOreMsg(totaleAttuale: number, oreRichieste: number): void {
    const restante = this.maxOreGiornaliere - totaleAttuale;
    this.errorMsg = restante <= 0
      ? `Hai già raggiunto il limite massimo di ${this.maxOreGiornaliere} ore per il giorno selezionato.`
      : `Limite giornaliero di ${this.maxOreGiornaliere} ore superato: ore già inserite ${totaleAttuale}. Ore disponibili: ${restante}.`;
    // Mantieni il messaggio più visibile: dura 10 secondi o fino a chiusura manuale
    setTimeout(() => (this.errorMsg = ''), 10000);
  }

  clearErrorMsg(): void {
    this.errorMsg = '';
  }

}