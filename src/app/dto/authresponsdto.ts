/** Risposta dell'API di autenticazione Microsoft */
export type AuthResponse = {
  idUtente: number;
  email: string;
  nome: string;
  cognome: string;
  /** Ruolo utente (es. "admin", "Utente") */
  ruolo: string;
};
 