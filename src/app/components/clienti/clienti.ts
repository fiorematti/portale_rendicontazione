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

type ModalMode = 'aggiungi' | 'modifica' | 'dettaglio';
type FiltroStatoCliente = 'tutti' | 'attivo' | 'non-attivo';
type FiltroStatoOrdini = 'tutti' | 'ok' | 'ko';

const STATO_ORDINE_BY_FILTRO: Record<FiltroStatoOrdini, Ordine['stato'] | undefined> = {
  tutti: undefined,
  ok: 'completato',
  ko: 'problema',
};

@Component({
  selector: 'app-clienti',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clienti.html',
  styleUrls: ['./clienti.css']
})
export class ClientiComponent implements OnInit {
  readonly filtroStatoClienteDefault: FiltroStatoCliente = 'tutti';
  readonly filtroStatoOrdiniDefault: FiltroStatoOrdini = 'tutti';

  listaClienti: Cliente[] = [
    { id: 1, nome: 'Cliente 1', statoAttivo: true, ordini: [{ codice: 'AAAA/xxxx', stato: 'completato' }] },
    { id: 2, nome: 'Cliente 2', statoAttivo: true, ordini: [{ codice: 'BBBB/yyyy', stato: 'problema' }] },
  ];

  listaClientiFiltrata: Cliente[] = [];
  clienteSelezionato: Cliente = this.creaClienteVuoto();
  mostraModal = false;
  mostraErrore = false;
  ordineInput = '';
  private modalMode: ModalMode = 'aggiungi';

  filtroTesto = '';
  filtroStatoCliente: FiltroStatoCliente = this.filtroStatoClienteDefault;
  filtroStatoOrdini: FiltroStatoOrdini = this.filtroStatoOrdiniDefault;

  ngOnInit(): void {
    this.applicaFiltri();
  }

  applicaFiltri(): void {
    this.listaClientiFiltrata = this.listaClienti.filter((cliente) => this.isClienteVisibile(cliente));
  }

  cercaCliente(event: Event): void {
    const valore = (event.target as HTMLInputElement | null)?.value ?? '';
    this.aggiornaFiltroTesto(valore);
  }

  filtraPerStato(event: Event): void {
    const valore = (event.target as HTMLSelectElement | null)?.value as FiltroStatoCliente;
    this.aggiornaFiltroStatoCliente(valore);
  }

  filtraPerOrdini(event: Event): void {
    const valore = (event.target as HTMLSelectElement | null)?.value as FiltroStatoOrdini;
    this.aggiornaFiltroStatoOrdini(valore);
  }

  aggiungiCliente(): void {
    this.apriModal('aggiungi', this.creaClienteVuoto());
  }

  visualizzaDettaglio(cliente: Cliente): void {
    this.apriModal('dettaglio', cliente);
  }

  modificaCliente(cliente: Cliente): void {
    this.apriModal('modifica', cliente);
  }

  passaAModifica(): void {
    this.apriModal('modifica', this.clienteSelezionato);
  }

  salvaModifica(): void {
    const nomePulito = this.clienteSelezionato.nome.trim();

    if (!this.isNomeValido(nomePulito)) {
      this.mostraErrore = true;
      setTimeout(() => (this.mostraErrore = false), 4000);
      return;
    }

    this.clienteSelezionato.nome = nomePulito;
    this.clienteSelezionato.ordini = this.creaListaOrdini();

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
    this.resetModal();
  }

  eliminaCliente(id: number): void {
    if (confirm('Sei sicuro?')) {
      this.listaClienti = this.listaClienti.filter((c) => c.id !== id);
      this.applicaFiltri();
    }
  }

  get isModifica(): boolean {
    return this.modalMode === 'modifica';
  }

  get isDettaglio(): boolean {
    return this.modalMode === 'dettaglio';
  }

  get titoloModal(): string {
    switch (this.modalMode) {
      case 'dettaglio':
        return 'Dettaglio Cliente';
      case 'modifica':
        return 'Modifica Cliente';
      default:
        return 'Aggiungi Cliente';
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
    return this.filtroStatoCliente === this.filtroStatoClienteDefault || this.getStatoCliente(cliente) === this.filtroStatoCliente;
  }

  private matchStatoOrdini(cliente: Cliente): boolean {
    const statoRichiesto = STATO_ORDINE_BY_FILTRO[this.filtroStatoOrdini];
    if (!statoRichiesto) {
      return true;
    }
    return cliente.ordini.some((ordine) => ordine.stato === statoRichiesto);
  }

  private isClienteVisibile(cliente: Cliente): boolean {
    return this.matchNome(cliente) && this.matchStatoCliente(cliente) && this.matchStatoOrdini(cliente);
  }

  private aggiornaFiltroTesto(valore: string): void {
    this.filtroTesto = valore;
    this.applicaFiltri();
  }

  private aggiornaFiltroStatoCliente(valore: FiltroStatoCliente): void {
    this.filtroStatoCliente = valore;
    this.applicaFiltri();
  }

  private aggiornaFiltroStatoOrdini(valore: FiltroStatoOrdini): void {
    this.filtroStatoOrdini = valore;
    this.applicaFiltri();
  }

  private creaListaOrdini(): Ordine[] {
    const codice = this.ordineInput.trim();
    return codice ? [{ codice, stato: 'completato' }] : [];
  }

  private getStatoCliente(cliente: Cliente): FiltroStatoCliente {
    return cliente.statoAttivo ? 'attivo' : 'non-attivo';
  }

  private apriModal(modalMode: ModalMode, cliente: Cliente): void {
    this.modalMode = modalMode;
    this.mostraErrore = false;
    this.clienteSelezionato = this.cloneCliente(cliente);
    this.ordineInput = this.clienteSelezionato.ordini[0]?.codice ?? '';
    this.mostraModal = true;
  }

  private resetModal(): void {
    this.mostraModal = false;
    this.modalMode = 'aggiungi';
    this.mostraErrore = false;
    this.ordineInput = '';
    this.clienteSelezionato = this.creaClienteVuoto();
  }

  private cloneCliente(cliente: Cliente): Cliente {
    return JSON.parse(JSON.stringify(cliente));
  }
}