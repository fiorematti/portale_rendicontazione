import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SpesaNotaResponse {
  idSpesa: number;
  codiceOrdine: string;
  dataNotificazione: string;
  statoPagamento: boolean;
  totaleComplessivo: number;
}

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
}

@Injectable({ providedIn: 'root' })
export class NoteSpeseService {
  private readonly baseUrl = '/api/SpesaNota/Utente';

  constructor(private readonly http: HttpClient) {}

  getSpeseByYear(year: number): Observable<SpesaNotaResponse[]> {
    const params = new HttpParams().set('year', year.toString());
    return this.http.get<SpesaNotaResponse[]>(`${this.baseUrl}/GetSpeseByUserAndYear`, { params });
  }

  getDettagliBySpesa(idSpesa: number): Observable<DettaglioApiResponse[]> {
    const params = new HttpParams().set('idSpesa', idSpesa.toString());
    return this.http.get<DettaglioApiResponse[]>('/api/Dettaglio/getDettagliBySpesa', { params });
  }
}
