import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Spesa {
  data: string;
  codice: string;
  richiesto: string;
  validato: string;
  pagato: boolean;
}

interface DettaglioSpesa {
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
  imports: [CommonModule, FormsModule],
  templateUrl: './note-spese.html',
  styleUrl: './note-spese.css',
})
export class NoteSpese implements OnInit {
  listaSpese: Spesa[] = [
    { data: '14/01/2026', codice: 'AAAA/xxxx', richiesto: '215,00€', validato: '190,00€', pagato: true },
    { data: '15/01/2026', codice: 'BBBB/yyyy', richiesto: '120,00€', validato: '120,00€', pagato: true },
    { data: '16/01/2026', codice: 'CCCC/zzzz', richiesto: '45,00€',  validato: '40,00€',  pagato: false },
  ];

  filtroPagate: string = 'Tutti';
  filtroData: string = '';
  filtroOrdine: string = 'Tutti';

  mostraModal: boolean = false;
  modalMode: 'aggiungi' | 'visualizza' | 'modifica' = 'aggiungi'; 
  nuovaSpesaData: string = '';
  tabAttiva: number = 0;
  dettagliSpesa: DettaglioSpesa[] = [];
  mostraErrore: boolean = false;
  
  rigaSelezionata: any = null;

  mostraCalendario: boolean = false;
  targetData: 'filtro' | 'popup' = 'filtro'; 
  dataVisualizzata: Date = new Date();
  giorniDelMese: number[] = [];
  giorniVuoti: number[] = [];

  get isAggiungi(): boolean { return this.modalMode === 'aggiungi'; }
  get isVisualizza(): boolean { return this.modalMode === 'visualizza'; }
  get isModifica(): boolean { return this.modalMode === 'modifica'; }

  ngOnInit(): void {
    this.generaCalendario();
    this.resetNuovaSpesa();
  }

  visualizzaDettaglio(spesa: any): void {
    this.rigaSelezionata = spesa;
    this.caricaDatiNellaModal(spesa);
    this.apriModalConModalita('visualizza');
  }

  apriModifica(spesa: any): void {
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

  private caricaDatiNellaModal(spesa: Spesa) {
    this.nuovaSpesaData = spesa.data;

    const importoPulito = parseFloat(
      spesa.richiesto
        .replace(/\./g, '')
        .replace(',', '.')
        .replace(/[^\d.]/g, '')
    ) || 0;
    
    this.dettagliSpesa = [{
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

    const totaleStringa = this.totaleCalcolato.toFixed(2).replace('.', ',') + '€';

    if (this.isAggiungi) {
      this.listaSpese.unshift(this.creaSpesaDaDettaglio(dett, totaleStringa));
    } else if (this.rigaSelezionata) {
      this.rigaSelezionata.data = this.nuovaSpesaData;
      this.rigaSelezionata.codice = dett.codiceOrdine;
      this.rigaSelezionata.richiesto = totaleStringa;
    }

    this.chiudiModal();
  }

  resetNuovaSpesa(): void {
    this.nuovaSpesaData = '';
    this.dettagliSpesa = [{ codiceOrdine: 'AAAA/xxxx', vitto: null, auto: 'Modello auto' }];
    this.tabAttiva = 0;
    this.rigaSelezionata = null;
    this.mostraErrore = false;
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
    return this.dettagliSpesa.reduce((acc, dett) => {
      return acc + (
        Number(dett.vitto || 0) + Number(dett.alloggio || 0) + Number(dett.hotel || 0) +
        Number(dett.trasporti || 0) + Number(dett.aereo || 0) + Number(dett.varie || 0) +
        Number(dett.parking || 0) + Number(dett.telepass || 0) + Number(dett.costo || 0)
      );
    }, 0);
  }

  toggleCalendario(target: 'filtro' | 'popup'): void {
    if (this.isVisualizza && target === 'popup') return;
    this.targetData = target;
    this.mostraCalendario = !this.mostraCalendario;
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
    const d = `${String(g).padStart(2,'0')}/${String(this.dataVisualizzata.getMonth()+1).padStart(2,'0')}/${this.dataVisualizzata.getFullYear()}`;
    if (this.targetData === 'filtro') this.filtroData = d; else this.nuovaSpesaData = d;
    this.mostraCalendario = false;
  }

  cambiaMese(d: number): void { 
    this.dataVisualizzata.setMonth(this.dataVisualizzata.getMonth() + d); 
    this.generaCalendario(); 
  }

  formattaData(event: any, campo: string): void {
    let v = event.target.value.replace(/\D/g, '');
    if (v.length > 8) v = v.substring(0, 8);
    if (v.length >= 5) v = v.replace(/(\d{2})(\d{2})(\d{1,4})/, "$1/$2/$3");
    else if (v.length >= 3) v = v.replace(/(\d{2})(\d{1,2})/, "$1/$2");
    if (campo === 'filtro') this.filtroData = v; else this.nuovaSpesaData = v;
  }

  get nomeMeseCorrente(): string { return this.dataVisualizzata.toLocaleString('it-IT', { month: 'long' }); }
  get annoVisualizzato(): number { return this.dataVisualizzata.getFullYear(); }

  get speseFiltrate() {
    return this.listaSpese.filter(s => {
      const mPagato = this.filtroPagate === 'Tutti' || (this.filtroPagate === 'Si' ? s.pagato : !s.pagato);
      const mData = !this.filtroData || s.data === this.filtroData;
      const mOrdine = this.filtroOrdine === 'Tutti' || s.codice === this.filtroOrdine;
      return mPagato && mData && mOrdine;
    });
  }

  selezionaTab(i: number): void { this.tabAttiva = i; }
  aggiungiTab(): void { this.dettagliSpesa.push({ codiceOrdine: this.dettagliSpesa[0].codiceOrdine, vitto: 0 }); }
  eliminaDettaglioCorrente(): void {
    this.dettagliSpesa.splice(this.tabAttiva, 1);
    if (this.dettagliSpesa.length === 0) this.chiudiModal();
    else this.tabAttiva = 0;
  }

  private apriModalConModalita(mode: 'aggiungi' | 'visualizza' | 'modifica'): void {
    this.modalMode = mode;
    this.mostraModal = true;
  }

  private isDettaglioValido(dett: DettaglioSpesa | undefined): boolean {
    if (!dett) return false;
    const dataValida = this.nuovaSpesaData.trim().length > 0;
    const codiceValido = dett.codiceOrdine?.toString().trim().length > 0;
    const hasImporto = [dett.vitto, dett.alloggio, dett.hotel, dett.trasporti, dett.aereo, dett.varie, dett.parking, dett.telepass, dett.costo]
      .some(v => Number(v || 0) > 0);
    return Boolean(dataValida && codiceValido && hasImporto);
  }

  private creaSpesaDaDettaglio(dett: DettaglioSpesa, totale: string): Spesa {
    return {
      data: this.nuovaSpesaData,
      codice: dett.codiceOrdine,
      richiesto: totale,
      validato: '0,00€',
      pagato: false,
    };
  }
}