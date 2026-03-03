import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AutomobileDto } from '../../dto/automobile.dto';

/** Nota spesa restituita dalla lista principale. */
export interface SpesaNotaResponse {
  idSpesa: number;
  codiceOrdine: string;
  /** Data della notifica in formato ISO. */
  dataNotificazione: string;
  statoPagamento: boolean;
  totaleComplessivo: number;
}

/** Singolo dettaglio di una nota spesa come restituito dall'API. */
export interface DettaglioApiResponse {
  idDettaglio: number;
  idSpesa: number;
  /** Data del dettaglio in formato ISO. */
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
  costoKilometri: number;
  totale: number;
}

/** Allegato associato a un dettaglio di spesa (per l'invio). */
export interface AddSpesaAllegato {
  scontrino: string;
  categoriaSpesa: string;
  pathAllegato: string;
}

/** Dettaglio di spesa nel payload di creazione. */
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

/** Dettaglio di spesa nel payload di aggiornamento. */
export interface UpdateSpesaDettaglio {
  idDettaglio: number;
  /** Se `true`, il dettaglio verrà eliminato durante l'aggiornamento. */
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

/** Payload per l'aggiornamento di una nota spesa esistente. */
export interface UpdateSpesaRequest {
  codiceOrdine: string;
  idSpesa: number;
  dettagli: UpdateSpesaDettaglio[];
}

/** Risposta dell'aggiornamento di una nota spesa. */
export interface UpdateSpesaResponse {
  esito: string;
  motivazione: string;
}

/** Risposta dell'eliminazione di una nota spesa. */
export interface DeleteSpesaResponse {
  esito: string;
  motivazione?: string;
}

/**
 * Servizio per le operazioni CRUD sulle note spese dell'utente autenticato.
 * Gestisce anche il recupero dei dettagli e delle automobili associate.
 */
@Injectable({ providedIn: 'root' })
export class NoteSpeseService {
  private readonly baseUrl = '/api/SpesaNota/Utente';

  constructor(private readonly http: HttpClient) {}

  /** Recupera le note spese dell'utente per anno e mese. */
  getSpeseByYear(year: number, month: number): Observable<SpesaNotaResponse[]> {
    const params = new HttpParams().set('year', year.toString()).set('month', month.toString());
    return this.http.get<SpesaNotaResponse[]>(`${this.baseUrl}/GetSpeseByUserAndYearAndMonth`, { params });
  }

  /** Recupera i dettagli di una specifica nota spesa. */
  getDettagliBySpesa(idSpesa: number): Observable<DettaglioApiResponse[]> {
    const params = new HttpParams()
      .set('idSpesa', idSpesa.toString())
      .set('idSpesaNota', idSpesa.toString());
    return this.http.get<DettaglioApiResponse[]>('/api/Dettaglio/getDettagliBySpesa', { params });
  }

  /** Crea una nuova nota spesa (multipart FormData con allegati). */
  addSpesa(form: FormData): Observable<boolean> {
    return this.http.post<boolean>(`${this.baseUrl}/AddSpesa`, form);
  }

  /** Aggiorna una nota spesa esistente con i nuovi dettagli. */
  updateSpesa(request: UpdateSpesaRequest): Observable<UpdateSpesaResponse> {
    return this.http.put<UpdateSpesaResponse>(`${this.baseUrl}/UpdateSpesa`, request);
  }

  /** Elimina una nota spesa per ID. */
  deleteSpesa(id: number): Observable<DeleteSpesaResponse> {
    const params = new HttpParams().set('id', id.toString());
    return this.http.delete<DeleteSpesaResponse>(`${this.baseUrl}/DeleteSpesa`, { params });
  }

  /** Recupera le automobili dell'utente autenticato (per il dropdown nel dettaglio spesa). */
  getAutomobili(): Observable<AutomobileDto[]> {
    return this.http.get<AutomobileDto[]>('/api/Automobile/utente/getAllAutomobiliByUtente');
  }
}
