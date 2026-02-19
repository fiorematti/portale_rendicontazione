import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AutomobileDto } from '../../dto/automobile.dto';


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
  costoKilometri: number;
  totale: number;
  
}


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
}


export interface AddSpesaRequest {
  codiceOrdine: string;
  dataNotificazione: string;
  dettagli: AddSpesaDettaglio[];
}


export interface UpdateSpesaDettaglio {
  idDettaglio: number;
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


export interface UpdateSpesaRequest {
  codiceOrdine: string;
  idSpesa: number;
  dettagli: UpdateSpesaDettaglio[];
}


export interface UpdateSpesaResponse {
  esito: string;
  motivazione: string;
}


export interface DeleteSpesaResponse {
  esito: string;
  motivazione?: string;
}


@Injectable({ providedIn: 'root' })
export class NoteSpeseService {
  private readonly baseUrl = '/api/SpesaNota/Utente';


  constructor(private readonly http: HttpClient) {}


  getSpeseByYear(year: number, month: number): Observable<SpesaNotaResponse[]> {
    const params = new HttpParams().set('year', year.toString()).set('month', month.toString());
    return this.http.get<SpesaNotaResponse[]>(`${this.baseUrl}/GetSpeseByUserAndYearAndMonth`, { params });
  }


  getDettagliBySpesa(idSpesa: number): Observable<DettaglioApiResponse[]> {
    const params = new HttpParams()
      .set('idSpesa', idSpesa.toString())
      .set('idSpesaNota', idSpesa.toString());
    return this.http.get<DettaglioApiResponse[]>('/api/Dettaglio/getDettagliBySpesa', { params });
  }


  addSpesa(request: AddSpesaRequest): Observable<boolean> {
    return this.http.post<boolean>(`${this.baseUrl}/AddSpesa`, request);
  }


  updateSpesa(request: UpdateSpesaRequest): Observable<UpdateSpesaResponse> {
    return this.http.put<UpdateSpesaResponse>(`${this.baseUrl}/UpdateSpesa`, request);
  }


  deleteSpesa(id: number): Observable<DeleteSpesaResponse> {
    const params = new HttpParams().set('id', id.toString());
    return this.http.delete<DeleteSpesaResponse>(`${this.baseUrl}/DeleteSpesa`, { params });
  }


  getAutomobili(): Observable<AutomobileDto[]> {
    return this.http.get<AutomobileDto[]>('/api/Automobile/utente/getAllAutomobiliByUtente');
  }
}
