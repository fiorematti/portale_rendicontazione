import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-attivita',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attivita.html',
  styleUrls: ['./attivita.css'],
})
export class Attivita implements OnInit {
  giornoSelezionato: number = 14;
  meseCorrente: number = 8; // Settembre (0-11)
  annoCorrente: number = 2025;
  
  giorniCalendario: { valore: number, corrente: boolean }[] = [];
  listaMesi = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  listaAnni: number[] = [];

  listaAttivita = [
    { codice: 'AAAA/xxxx', cliente: 'Nome cliente', location: 'Trasferta', ore: 6 }
  ];

  nuovaAttivita = { codice: 'AAAA/xxxx', cliente: 'Nome cliente', location: 'In sede', ore: 0 };
  mostraModal: boolean = false;
  isModifica: boolean = false;
  indiceInModifica: number = -1;

  apriModal() { 
    this.isModifica = false;
    this.nuovaAttivita = { codice: 'AAAA/xxxx', cliente: 'Nome cliente', location: 'In sede', ore: 0 };
    this.mostraModal = true; 
  }

  modificaAttivita(index: number) {
    this.isModifica = true;
    this.indiceInModifica = index;
    this.nuovaAttivita = { ...this.listaAttivita[index] };
    this.mostraModal = true;
  }

  chiudiModal() { 
    this.mostraModal = false; 
    this.isModifica = false;
  }

  confermaAggiunta() {
    if (this.nuovaAttivita.ore > 0) {
      if (this.isModifica) {
        this.listaAttivita[this.indiceInModifica] = { ...this.nuovaAttivita };
      } else {
        this.listaAttivita.push({ ...this.nuovaAttivita });
      }
      this.chiudiModal();
    } else {
      alert("Per favore, inserisci tutti i dati correttamente.");
    }
  }

  eliminaAttivita(index: number) {
    if (confirm("Sei sicuro di voler eliminare questa attività?")) {
      this.listaAttivita.splice(index, 1);
    }
  }

  ngOnInit() {
    for (let i = 2020; i <= 2030; i++) this.listaAnni.push(i);
    this.generaCalendario();
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

  selezionaGiorno(giorno: { valore: number, corrente: boolean }): void {
    if (giorno.corrente) this.giornoSelezionato = giorno.valore;
  }
}