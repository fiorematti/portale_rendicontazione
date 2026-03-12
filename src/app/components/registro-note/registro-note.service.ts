import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SpesaNotaApi {
  idSpesa?: number;
  idUtente?: number;
  nomeUtente?: string;
  idCliente?: number;
  codiceOrdine?: string;
  dataNotificazione?: string;
  data?: string;
  dataNota?: string;
  dataSpesa?: string;
  totaleComplessivo?: number | string;
  totaleValidato?: number | string;
  totale?: string | number;
  totaleRichiesto?: string | number;
  totaleNonValidato?: number | string;
  totaleNonVal?: string | number;
  totaleAnnullato?: number | string;
  annullato?: number | string;
  statoPagamento?: boolean;
  pagato?: boolean;
  isPagato?: boolean;
  paid?: boolean;
  nome?: string;
  cognome?: string;
  utente?: string;
}

export interface DettaglioSpesaApi {
  idDettaglio?: number;
  dataDettaglio?: string;
  vitto?: number;
  hotel?: number;
  trasportiLocali?: number;
  trasporti?: number;
  aereo?: number;
  spesaVaria?: number;
  varie?: number;
  auto?: string;
  km?: number;
  telepass?: number;
  parking?: number;
  totale?: number;
  costoKilometri?: number;
  statoApprovazione?: string;
  allegati?: any[];
}

export interface UtenteApi {
  idUtente: number;
  nome: string;
  cognome: string;
  email: string | null;
  ruolo: string;
  stato: boolean;
}

@Injectable({ providedIn: 'root' })
export class RegistroNoteService {
  private readonly jsonHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private readonly http: HttpClient) {}

  getSpeseByYearAndMonth(year: number, month: number): Observable<SpesaNotaApi[]> {
    return this.http.get<SpesaNotaApi[]>('/api/SpesaNota/Admin/GetSpeseByYearAndMonth', {
      params: { year, month }
    });
  }

  getDettagliBySpesa(idSpesa: number): Observable<DettaglioSpesaApi[]> {
    return this.http.get<DettaglioSpesaApi[]>('/api/Dettaglio/getDettagliBySpesa', {
      params: { idSpesa }
    });
  }

  getAllUtenti(): Observable<UtenteApi[]> {
    return this.http.get<UtenteApi[]>('/api/Utente/admin/getAllUtenti');
  }

  pagaSpese(spesaIds: number[]): Observable<HttpResponse<any>> {
    return this.http.put('/api/SpesaNota/admin/pagaSpese', spesaIds, {
      headers: this.jsonHeaders,
      observe: 'response'
    });
  }

  validaDettaglio(ids: number[]): Observable<HttpResponse<any>> {
    return this.http.put('/api/Dettaglio/admin/validaDettaglio', ids, {
      headers: this.jsonHeaders,
      observe: 'response'
    });
  }

  respingiDettaglio(ids: number[]): Observable<HttpResponse<any>> {
    return this.http.put('/api/Dettaglio/admin/respingiDettaglio', ids, {
      headers: this.jsonHeaders,
      observe: 'response'
    });
  }

  exportPdf(params: Record<string, any>): Observable<HttpResponse<Blob>> {
    return this.http.get('/api/SpesaNota/pdf', {
      params,
      observe: 'response',
      responseType: 'blob'
    });
  }
}
