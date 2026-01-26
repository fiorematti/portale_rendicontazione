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
  readonly filtroStatoClienteDefault = 'tutti';
  readonly filtroStatoOrdiniDefault = 'tutti';

  listaClienti: Cliente[] = [
    { id: 1, nome: 'Cliente 1', statoAttivo: true, ordini: [{ codice: 'AAAA/xxxx', stato: 'completato' }, { codice: 'AAAA/xxxx', stato: 'completato' }, { codice: 'AAAA/xxxx', stato: 'problema' }] },
    { id: 2, nome: 'Cliente 2', statoAttivo: true, ordini: [{ codice: 'AAAA/xxxx', stato: 'problema' }] },
    { id: 3, nome: 'Cliente 3', statoAttivo: true, ordini: [{ codice: 'AAAA/xxxx', stato: 'completato' }] },
    { id: 4, nome: 'Cliente 4', statoAttivo: false, ordini: [{ codice: 'AAAA/xxxx', stato: 'problema' }] },
  ];

  listaClientiFiltrata: Cliente[] = [];
  clienteSelezionato: Cliente = this.creaClienteVuoto();
  mostraModal = false;
  isModifica = false;
  mostraErrore = false;

  filtroTesto = '';
  filtroStatoCliente = this.filtroStatoClienteDefault;
  filtroStatoOrdini = this.filtroStatoOrdiniDefault;

  ngOnInit(): void {
    this.applicaFiltri();
  }

  applicaFiltri(): void {
    this.listaClientiFiltrata = this.listaClienti.filter((cliente) => {
      const matchNome = this.matchNome(cliente);
      const matchStato = this.matchStatoCliente(cliente);
      const matchOrdini = this.matchStatoOrdini(cliente);
      return matchNome && matchStato && matchOrdini;
    });
  }

  cercaCliente(event: Event): void {
    this.filtroTesto = (event.target as HTMLInputElement).value;
    this.applicaFiltri();
  }

  filtraPerStato(event: Event): void {
    this.filtroStatoCliente = (event.target as HTMLSelectElement).value;
    this.applicaFiltri();
  }

  filtraPerOrdini(event: Event): void {
    this.filtroStatoOrdini = (event.target as HTMLSelectElement).value;
    this.applicaFiltri();
  }

  aggiungiCliente(): void {
    this.isModifica = false;
    this.mostraErrore = false;
    this.clienteSelezionato = this.creaClienteVuoto();
    this.mostraModal = true;
  }

  modificaCliente(cliente: Cliente): void {
    this.isModifica = true;
    this.mostraErrore = false;
    this.clienteSelezionato = { ...cliente };
    this.mostraModal = true;
  }

  salvaModifica(): void {
    if (!this.isNomeValido(this.clienteSelezionato.nome)) {
      this.mostraErrore = true;
      setTimeout(() => (this.mostraErrore = false), 4000);
      return;
    }

    if (this.clienteSelezionato.id === 0) {
      const nuovoId = this.generaNuovoId();
      this.listaClienti.push({ ...this.clienteSelezionato, id: nuovoId });
    } else {
      const index = this.listaClienti.findIndex((c) => c.id === this.clienteSelezionato.id);
      if (index !== -1) {
        this.listaClienti[index] = { ...this.clienteSelezionato };
      }
    }

    this.applicaFiltri();
    this.chiudiModal();
  }

  chiudiModal(): void {
    this.mostraModal = false;
    this.isModifica = false;
    this.mostraErrore = false;
  }

  eliminaCliente(id: number): void {
    if (confirm('Sei sicuro?')) {
      this.listaClienti = this.listaClienti.filter((c) => c.id !== id);
      this.applicaFiltri();
    }
  }

  private creaClienteVuoto(): Cliente {
    return { id: 0, nome: '', statoAttivo: true, ordini: [] };
  }

  private isNomeValido(nome: string): boolean {
    return Boolean(nome.trim());
  }

  private generaNuovoId(): number {
    if (this.listaClienti.length === 0) return 1;
    return Math.max(...this.listaClienti.map((c) => c.id)) + 1;
  }

  private matchNome(cliente: Cliente): boolean {
    return cliente.nome.toLowerCase().includes(this.filtroTesto.toLowerCase());
  }

  private matchStatoCliente(cliente: Cliente): boolean {
    const statoCliente = cliente.statoAttivo ? 'attivo' : 'non-attivo';
    return this.filtroStatoCliente === this.filtroStatoClienteDefault || statoCliente === this.filtroStatoCliente;
  }

  private matchStatoOrdini(cliente: Cliente): boolean {
    if (this.filtroStatoOrdini === this.filtroStatoOrdiniDefault) return true;
    return cliente.ordini.some((ordine) => {
      if (this.filtroStatoOrdini === 'ok') return ordine.stato === 'completato';
      if (this.filtroStatoOrdini === 'ko') return ordine.stato === 'problema';
      return true;
    });
  }
}