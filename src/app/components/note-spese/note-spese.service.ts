import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AutomobileDto } from '../../dto/automobile.dto';

/** Risposta API per una nota spesa (riga nella lista principale) */
export interface SpesaNotaResponse {
  idSpesa: number;
  codiceOrdine: string;
  /** Data in formato ISO */
  dataNotificazione: string;
  statoPagamento: boolean;
  totaleComplessivo: number;
}

/** Risposta API per un singolo dettaglio di una nota spesa */
export interface DettaglioApiResponse {
  idDettaglio: number;
  idSpesa: number;
  dataDettaglio: string;
  statoApprovazione: string;
  vitto: number;
  hotel: number;
  trasportiLocali: number;
  aereo: number;
  spesaVaria: number;
  idAuto: number | null;
  km: number;
  telepass: number;
  parking: number;
  idAutoNavigation: any;
  idSpesaNavigation: any;
  /** Costo chilometrico calcolato dal backend */
  costoKilometri: number;
  totale: number;
}

/** Struttura allegato per l'aggiunta di una spesa */
export interface AddSpesaAllegato {
  scontrino: string;
  categoriaSpesa: string;
  pathAllegato: string;
}

/** Struttura dettaglio per l'aggiunta di una spesa */
export interface AddSpesaDettaglio {
  dataDettaglio: string;
  vitto: number;
  hotel: number;
  trasportiLocali: number;
  aereo: number;
  spesaVaria: number;
  idAuto: number | null;
  km: number;
  telepass: number;
  parking: number;
  allegati: AddSpesaAllegato[];
}

/** Struttura dettaglio per l'aggiornamento di una spesa esistente */
export interface UpdateSpesaDettaglio {
  idDettaglio: number;
  /** Se true, il dettaglio verrà eliminato durante l'aggiornamento */
  daEliminare: boolean;
  dataDettaglio: string;
  vitto: number;
  hotel: number;
  trasportiLocali: number;
  aereo: number;
  spesaVaria: number;
  idAuto: number | null;
  km: number;
  telepass: number;
  parking: number;
}

/** Payload per l'aggiornamento di una nota spesa */
export interface UpdateSpesaRequest {
  codiceOrdine: string;
  idSpesa: number;
  dettagli: UpdateSpesaDettaglio[];
}

/** Risposta API all'aggiornamento di una nota spesa */
export interface UpdateSpesaResponse {
  esito: string;
  motivazione: string;
}

/** Risposta API all'eliminazione di una nota spesa */
export interface DeleteSpesaResponse {
  esito: string;
  motivazione?: string;
}

/**
 * Service per le operazioni CRUD sulle note spese dell'utente.
 * Gestisce anche il recupero dei dettagli e delle automobili associate.
 */
@Injectable({ providedIn: 'root' })
export class NoteSpeseService {
  private readonly baseUrl = '/api/SpesaNota/Utente';

  constructor(private readonly http: HttpClient) {}

  /** Recupera le note spese dell'utente per anno e mese */
  getSpeseByYear(year: number, month: number): Observable<SpesaNotaResponse[]> {
    const params = new HttpParams().set('year', year.toString()).set('month', month.toString());
    return this.http.get<SpesaNotaResponse[]>(`${this.baseUrl}/GetSpeseByUserAndYearAndMonth`, { params });
  }

  /** Recupera i dettagli (voci di spesa) di una nota spesa specifica */
  getDettagliBySpesa(idSpesa: number): Observable<DettaglioApiResponse[]> {
    const params = new HttpParams()
      .set('idSpesa', idSpesa.toString())
      .set('idSpesaNota', idSpesa.toString());
    return this.http.get<DettaglioApiResponse[]>('/api/Dettaglio/getDettagliBySpesa', { params });
  }

  /** Crea una nuova nota spesa con allegati (FormData) */
  addSpesa(form: FormData): Observable<boolean> {
    return this.http.post<boolean>(`${this.baseUrl}/AddSpesa`, form);
  }

  /** Aggiorna una nota spesa esistente */
  updateSpesa(request: UpdateSpesaRequest): Observable<UpdateSpesaResponse> {
    return this.http.put<UpdateSpesaResponse>(`${this.baseUrl}/UpdateSpesa`, request);
  }

  /** Elimina una nota spesa tramite il suo ID */
  deleteSpesa(id: number): Observable<DeleteSpesaResponse> {
    const params = new HttpParams().set('id', id.toString());
    return this.http.delete<DeleteSpesaResponse>(`${this.baseUrl}/DeleteSpesa`, { params });
  }

  /** Recupera le automobili associate all'utente corrente */
  getAutomobili(): Observable<AutomobileDto[]> {
    return this.http.get<AutomobileDto[]>('/api/Automobile/utente/getAllAutomobiliByUtente');
  }
}
