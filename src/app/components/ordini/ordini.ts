import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ordini',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ordini.html',
  styleUrl: './ordini.css',
})
export class OrdiniComponent implements OnInit {
  filtroTesto: string = '';
  filtroStato: string = '';
  mostraModal: boolean = false;
  mostraCalendario: boolean = false;

  dataVisualizzata: Date = new Date();
  calendarioGiorni: (number | null)[] = [];

  nuovoOrdineDati = {
    id: '',
    cliente: '',
    dataInizio: '',
    stato: 'Ricevuto',
    codiceOfferta: ''
  };

  elencoOrdini = [
    { id: '1024', cliente: 'Azienda Alpha', dataInizio: '20/10/2025', codiceOfferta: '876702', stato: 'Fatto' },
    { id: '1025', cliente: 'Boutique Rossi', dataInizio: '30/09/2025', codiceOfferta: '213653', stato: 'Ricevuto' },
  ];

  ngOnInit(): void {
    this.generaCalendario();
  }

  generaCalendario(): void {
    const anno = this.dataVisualizzata.getFullYear();
    const mese = this.dataVisualizzata.getMonth();
    const primoGiornoMese = new Date(anno, mese, 1).getDay();
    const offset = primoGiornoMese === 0 ? 6 : primoGiornoMese - 1;
    const giorniNelMese = new Date(anno, mese + 1, 0).getDate();

    this.calendarioGiorni = [];
    for (let i = 0; i < offset; i++) {
      this.calendarioGiorni.push(null);
    }
    for (let i = 1; i <= giorniNelMese; i++) {
      this.calendarioGiorni.push(i);
    }
  }

  cambiaMese(delta: number): void {
    this.dataVisualizzata = new Date(
      this.dataVisualizzata.getFullYear(),
      this.dataVisualizzata.getMonth() + delta,
      1
    );
    this.generaCalendario();
  }

  get nomeMeseAnno(): string {
    const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
    const localeMese = this.dataVisualizzata.toLocaleString('it-IT', options);
    return localeMese.charAt(0).toUpperCase() + localeMese.slice(1);
  }

  selezionaGiorno(giorno: number | null): void {
    if (!giorno) return;
    const g = giorno.toString().padStart(2, '0');
    const m = (this.dataVisualizzata.getMonth() + 1).toString().padStart(2, '0');
    const a = this.dataVisualizzata.getFullYear();
    this.nuovoOrdineDati.dataInizio = `${g}/${m}/${a}`;
    this.mostraCalendario = false;
  }

  isGiornoSelezionato(giorno: number | null): boolean {
    if (!giorno) return false;
    const dataInput = this.nuovoOrdineDati.dataInizio;
    if (!dataInput || dataInput.length < 10) return false;
    const parti = dataInput.split('/');
    const d = parseInt(parti[0]);
    const m = parseInt(parti[1]);
    const a = parseInt(parti[2]);
    return d === giorno &&
           m === (this.dataVisualizzata.getMonth() + 1) &&
           a === this.dataVisualizzata.getFullYear();
  }

  formattaData(event: any): void {
    let v = event.target.value.replace(/\D/g, '');
    if (v.length > 8) v = v.substring(0, 8);
    let final = '';
    if (v.length > 0) final += v.substring(0, 2);
    if (v.length > 2) final += '/' + v.substring(2, 4);
    if (v.length > 4) final += '/' + v.substring(4, 8);
    this.nuovoOrdineDati.dataInizio = final;
  }

  nuovoOrdine(): void {
    this.mostraModal = true;
  }

  chiudiModal(): void {
    this.mostraModal = false;
    this.resetForm();
    this.mostraCalendario = false;
  }

  confermaOrdine(): void {
    if (this.nuovoOrdineDati.id && this.nuovoOrdineDati.cliente) {
      this.elencoOrdini.unshift({ ...this.nuovoOrdineDati });
      this.chiudiModal();
    }
  }

  resetForm(): void {
    this.nuovoOrdineDati = {
      id: '',
      cliente: '',
      dataInizio: '',
      stato: 'Ricevuto',
      codiceOfferta: ''
    };
  }

  get ordiniFiltrati() {
    return this.elencoOrdini.filter(o =>
      (o.cliente + o.id).toLowerCase().includes(this.filtroTesto.toLowerCase()) &&
      (this.filtroStato === '' || o.stato === this.filtroStato)
    );
  }

  getBadgeClass(stato: string): string {
    return stato === 'Fatto' ? 'badge-success' : 'badge-warning';
  }
}