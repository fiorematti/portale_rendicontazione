export interface OrdineApiItem {
  codiceOrdine: string;
  idCliente: number;
  codiceOfferta?: string | null;
  descrizione?: string | null;
  dataInizio?: string | null;
  dataFine?: string | null;
  fattoRicevuto?: boolean;
}
