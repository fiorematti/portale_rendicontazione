/** Rappresenta un ordine come restituito dall'API. */
export interface OrdineApiItem {
  codiceOrdine: string;
  idCliente: number;
  codiceOfferta?: string | null;
  descrizione?: string | null;
  /** Data di inizio ordine in formato ISO. */
  dataInizio?: string | null;
  /** Data di fine ordine in formato ISO. */
  dataFine?: string | null;
  fattoRicevuto?: boolean;
}
