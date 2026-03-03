import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LuogoApiItem } from '../../dto/luogo.dto';

/** Rappresenta una singola attività lavorativa giornaliera. */
export interface AttivitaItem {
  idAttivita: number;
  codiceOrdine: string;
  nominativoCliente: string;
  /** Location di lavoro (es. "In sede", "Trasferta"). */
  location: string;
  /** Ore lavorate nella giornata. */
  ore: number;
  /** Data dell'attività in formato ISO (yyyy-MM-dd). */
  dataAttivita: string;
  stato?: string;
}

/** Payload per la creazione di una o più attività (anche ricorrenti). */
export interface AddAttivitaPayload {
  codiceOrdine: string;
  /** ID del luogo di lavoro. */
  luogo: number;
  dataInizio: string;
  dataFine: string;
  /** Giorni della settimana per la ricorrenza (0=Dom … 6=Sab). Array vuoto = singola data. */
  ricorrenza: number[];
  oreLavoro: number;
}

/** Risposta della creazione attività: indica l'esito e le eventuali date saltate. */
export interface AddAttivitaResponse {
  esito: string;
  skippedDates: string[];
  motivazione?: string | null;
}

/** Payload per l'aggiornamento di un'attività esistente. */
export interface UpdateAttivitaPayload {
  idAttivita: number;
  codiceOrdine: string;
  luogo: number;
  dataAttivita: string;
  oreLavoro: number;
}

/** Risposta dell'aggiornamento attività. */
export interface UpdateAttivitaResponse {
  esito: string;
  motivazione: string | null;
}

/** Risposta dell'eliminazione attività. */
export interface DeleteAttivitaResponse {
  esito: string;
  skippedDates: string[];
  motivazione: string | null;
}

/**
 * Servizio per le operazioni CRUD sulle attività dell'utente autenticato.
 * Tutte le richieste utilizzano URL relativi; il base URL viene aggiunto dall'interceptor.
 */
@Injectable({ providedIn: 'root' })
export class AttivitaService {
  private readonly baseUrl = '/api/Attivita/utente';
  constructor(private readonly http: HttpClient) {}

  /** Recupera le attività dell'utente per una data specifica (formato ISO). */
  getAttivita(data: string): Observable<AttivitaItem[]> {
    const params = new HttpParams().set('data', data);
    return this.http.get<AttivitaItem[]>(`${this.baseUrl}/getAttivitaById`, { params });
  }

  /** Crea una nuova attività (o più attività in caso di ricorrenza). */
  addAttivita(payload: AddAttivitaPayload): Observable<AddAttivitaResponse> {
    return this.http.post<AddAttivitaResponse>(`${this.baseUrl}/addAttivita`, payload);
  }

  /** Aggiorna un'attività esistente. */
  updateAttivita(payload: UpdateAttivitaPayload): Observable<UpdateAttivitaResponse> {
    return this.http.put<UpdateAttivitaResponse>(`${this.baseUrl}/UpdateAttivita`, payload);
  }

  /** Elimina un'attività identificata dal suo ID. */
  deleteAttivita(idAttivita: number): Observable<DeleteAttivitaResponse> {
    const params = new HttpParams().set('IdAttivita', idAttivita.toString());
    return this.http.delete<DeleteAttivitaResponse>(`${this.baseUrl}/DeleteAttivita`, { params });
  }

  /** Recupera l'elenco di tutti i luoghi di lavoro disponibili. */
  getLocation(): Observable<LuogoApiItem[]> {
    return this.http.get<LuogoApiItem[]>('/api/Luogo/getAllLuoghi');
  }
}
