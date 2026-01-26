import { Component, OnInit } from '@angular/core';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface AttivitaItem {
  codice: string;
  cliente: string;
  location: 'In sede' | 'Trasferta' | string;
  ore: number;
  approvato: boolean;
}

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

  giornoSelezionato = 14;
  meseCorrente = 8; // Settembre (0-11)
  annoCorrente = 2025;

  giorniCalendario: GiornoCalendario[] = [];
  listaAnni: number[] = [];
  listaAttivita: AttivitaItem[] = [
    { codice: 'AAAA/xxxx', cliente: 'Nome cliente', location: 'Trasferta', ore: 6, approvato: false },
  ];

  nuovaAttivita: AttivitaItem = this.creaAttivitaVuota();
  mostraModal = false;
  isModifica = false;
  indiceInModifica = -1;
  mostraErrore = false;
  isDettaglioOpen = false;
  attivitaDettaglio: AttivitaItem | null = null;

  ngOnInit(): void {
    this.listaAnni = this.creaIntervalloAnni();
    this.generaCalendario();
  }

  apriModal(): void {
    this.isModifica = false;
    this.mostraErrore = false;
    this.nuovaAttivita = this.creaAttivitaVuota();
    this.mostraModal = true;
  }

  modificaAttivita(index: number): void {
    this.isModifica = true;
    this.indiceInModifica = index;
    this.nuovaAttivita = { ...this.listaAttivita[index] };
    this.mostraModal = true;
  }

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

    if (this.isModifica) {
      this.listaAttivita[this.indiceInModifica] = { ...this.nuovaAttivita };
    } else {
      this.listaAttivita.push({ ...this.nuovaAttivita });
    }

    this.chiudiModal();
  }

  eliminaAttivita(index: number): void {
    if (confirm('Sei sicuro di voler eliminare questa attività?')) {
      this.listaAttivita.splice(index, 1);
    }
  }

  get totaleOreCalcolato(): string {
    const totale = this.listaAttivita.reduce((acc, item) => acc + item.ore, 0);
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
  }

  selezionaGiorno(giorno: GiornoCalendario): void {
    if (giorno.corrente) this.giornoSelezionato = giorno.valore;
  }

  private creaAttivitaVuota(): AttivitaItem {
    return { codice: '', cliente: '', location: '', ore: 0, approvato: false };
  }

  private creaIntervalloAnni(): number[] {
    const anni: number[] = [];
    for (let anno = this.annoInizio; anno <= this.annoFine; anno++) {
      anni.push(anno);
    }
    return anni;
  }

  private isAttivitaValida(attivita: AttivitaItem): boolean {
    const { codice, cliente, location, ore } = attivita;
    return Boolean(codice.trim() && cliente.trim() && location.trim() && Number(ore) > 0);
  }
}