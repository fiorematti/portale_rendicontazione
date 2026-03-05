import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LuogoApiItem } from '../../dto/luogo.dto';

/** Rappresenta un'attività lavorativa restituita dall'API */
export interface AttivitaItem {
  idAttivita: number;
  codiceOrdine: string;
  nominativoCliente: string;
  location: string;
  ore: number;
  /** Data in formato ISO yyyy-MM-dd */
  dataAttivita: string;
  stato?: string;
}

/** Payload per la creazione di una nuova attività (supporta ricorrenza) */
export interface AddAttivitaPayload {
  codiceOrdine: string;
  luogo: number;
  dataInizio: string;
  dataFine: string;
  /** Giorni della settimana per la ricorrenza (0=Dom, 1=Lun, ...) */
  ricorrenza: number[];
  oreLavoro: number;
}

/** Risposta dell'API alla creazione di un'attività */
export interface AddAttivitaResponse {
  esito: string;
  /** Date saltate perché già al limite ore */
  skippedDates: string[];
  motivazione?: string | null;
}

/** Payload per l'aggiornamento di un'attività esistente */
export interface UpdateAttivitaPayload {
  idAttivita: number;
  codiceOrdine: string;
  luogo: number;
  dataAttivita: string;
  oreLavoro: number;
}

/** Risposta dell'API all'aggiornamento di un'attività */
export interface UpdateAttivitaResponse {
  esito: string;
  motivazione: string | null;
}

/** Risposta dell'API all'eliminazione di un'attività */
export interface DeleteAttivitaResponse {
  esito: string;
  skippedDates: string[];
  motivazione: string | null;
}

/**
 * Service per le operazioni CRUD sulle attività lavorative dell'utente.
 * Gestisce anche il recupero dei luoghi di lavoro disponibili.
 */
@Injectable({ providedIn: 'root' })
export class AttivitaService {
  private readonly baseUrl = '/api/Attivita/utente';
  constructor(private readonly http: HttpClient) {}

  /** Recupera le attività dell'utente per una data specifica */
  getAttivita(data: string): Observable<AttivitaItem[]> {
    const params = new HttpParams().set('data', data);
    return this.http.get<AttivitaItem[]>(`${this.baseUrl}/getAttivitaById`, { params });
  }

  /** Crea una nuova attività (con supporto ricorrenza) */
  addAttivita(payload: AddAttivitaPayload): Observable<AddAttivitaResponse> {
    return this.http.post<AddAttivitaResponse>(`${this.baseUrl}/addAttivita`, payload);
  }

  /** Aggiorna un'attività esistente */
  updateAttivita(payload: UpdateAttivitaPayload): Observable<UpdateAttivitaResponse> {
    return this.http.put<UpdateAttivitaResponse>(`${this.baseUrl}/UpdateAttivita`, payload);
  }

  /** Elimina un'attività tramite il suo ID */
  deleteAttivita(idAttivita: number): Observable<DeleteAttivitaResponse> {
    const params = new HttpParams().set('IdAttivita', idAttivita.toString());
    return this.http.delete<DeleteAttivitaResponse>(`${this.baseUrl}/DeleteAttivita`, { params });
  }

  /** Recupera tutti i luoghi di lavoro disponibili */
  getLocation(): Observable<LuogoApiItem[]> {
    return this.http.get<LuogoApiItem[]>('/api/Luogo/getAllLuoghi');
  }
}
