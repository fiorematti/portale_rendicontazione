import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 

export interface Ordine {
  codice: string;
  stato: 'completato' | 'problema';
}

export interface Cliente {
  id: number;
  nome: string;
  statoAttivo: boolean;
  ordini: Ordine[];
}

@Component({
  selector: 'app-clienti',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clienti.html',
  styleUrls: ['./clienti.css']
})
export class ClientiComponent implements OnInit {

  public listaClienti: Cliente[] = [
    { id: 1, nome: 'Cliente 1', statoAttivo: true, ordini: [{ codice: 'AAAA/xxxx', stato: 'completato' }, { codice: 'AAAA/xxxx', stato: 'completato' }, { codice: 'AAAA/xxxx', stato: 'problema' }] },
    { id: 2, nome: 'Cliente 2', statoAttivo: true, ordini: [{ codice: 'AAAA/xxxx', stato: 'problema' }] },
    { id: 3, nome: 'Cliente 3', statoAttivo: true, ordini: [{ codice: 'AAAA/xxxx', stato: 'completato' }] },
    { id: 4, nome: 'Cliente 4', statoAttivo: false, ordini: [{ codice: 'AAAA/xxxx', stato: 'problema' }] }
  ];

  public listaClientiFiltrata: Cliente[] = [];
  public clienteSelezionato: Cliente = { id: 0, nome: '', statoAttivo: true, ordini: [] };
  public mostraModal: boolean = false;
  public isModifica: boolean = false;

  public filtroTesto: string = '';
  public filtroStatoCliente: string = 'tutti';
  public filtroStatoOrdini: string = 'tutti';

  constructor() { }

  ngOnInit(): void {
    this.applicaFiltri();
  }

  public applicaFiltri(): void {
    this.listaClientiFiltrata = this.listaClienti.filter(cliente => {
      const matchNome = cliente.nome.toLowerCase().includes(this.filtroTesto.toLowerCase());
      const statoClienteTest = cliente.statoAttivo ? 'attivo' : 'non-attivo';
      const matchStato = this.filtroStatoCliente === 'tutti' || statoClienteTest === this.filtroStatoCliente;
      const matchOrdini = this.filtroStatoOrdini === 'tutti' || cliente.ordini.some(o => {
        if (this.filtroStatoOrdini === 'ok') return o.stato === 'completato';
        if (this.filtroStatoOrdini === 'ko') return o.stato === 'problema';
        return true;
      });
      return matchNome && matchStato && matchOrdini;
    });
  }

  public cercaCliente(event: Event): void {
    this.filtroTesto = (event.target as HTMLInputElement).value;
    this.applicaFiltri();
  }

  public filtraPerStato(event: Event): void {
    this.filtroStatoCliente = (event.target as HTMLSelectElement).value;
    this.applicaFiltri();
  }

  public filtraPerOrdini(event: Event): void {
    this.filtroStatoOrdini = (event.target as HTMLSelectElement).value;
    this.applicaFiltri();
  }

  public aggiungiCliente(): void {
    this.isModifica = false;
    this.clienteSelezionato = { id: 0, nome: '', statoAttivo: true, ordini: [] };
    this.mostraModal = true;
  }

  public modificaCliente(cliente: Cliente): void {
    this.isModifica = true;
    this.clienteSelezionato = { ...cliente };
    this.mostraModal = true;
  }

  public salvaModifica(): void {
    if (!this.clienteSelezionato.nome.trim()) {
      alert("Per favore, inserisci un nome valido.");
      return;
    }
    if (this.clienteSelezionato.id === 0) {
      const nuovoId = this.listaClienti.length > 0 ? Math.max(...this.listaClienti.map(c => c.id)) + 1 : 1;
      this.listaClienti.push({ ...this.clienteSelezionato, id: nuovoId });
    } else {
      const index = this.listaClienti.findIndex(c => c.id === this.clienteSelezionato.id);
      if (index !== -1) {
        this.listaClienti[index] = { ...this.clienteSelezionato };
      }
    }
    this.applicaFiltri();
    this.chiudiModal();
  }

  public chiudiModal(): void {
    this.mostraModal = false;
    this.isModifica = false;
  }

  public eliminaCliente(id: number): void {
    if (confirm('Sei sicuro?')) {
      this.listaClienti = this.listaClienti.filter(c => c.id !== id);
      this.applicaFiltri();
    }
  }
}