/** DTO della risposta di autenticazione restituita dall'API al login. */
export type AuthResponse = {
  idUtente: number;
  email: string;
  nome: string;
  cognome: string;
  ruolo: string;
};
 