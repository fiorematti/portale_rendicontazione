/** Rappresenta un ordine restituito dall'API utente */
export interface OrdineApiItem {
  codiceOrdine: string;
  idCliente: number;
  codiceOfferta?: string | null;
  descrizione?: string | null;
  /** Data inizio in formato ISO */
  dataInizio?: string | null;
  /** Data fine in formato ISO */
  dataFine?: string | null;
  /** true = Fatto, false = Ricevuto */
  fattoRicevuto?: boolean;
}
