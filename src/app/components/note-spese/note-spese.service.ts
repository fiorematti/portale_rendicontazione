import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DettaglioSpesaRequest {
  idDettaglio: number;
  daEliminare: boolean;
  dataDettaglio: string;
  vitto: number;
  hotel: number;
  trasportiLocali: number;
  aereo: number;
  spesaVaria: number;
  idAuto: number;
  km: number;
  telepass: number;
  parking: number;
}

export interface UpdateSpesaRequest {
  codiceOrdine: string;
  idSpesa: number;
  dettagli: DettaglioSpesaRequest[];
}

export interface UpdateSpesaResponse {
  esito: string;
  motivazione: string;
}

@Injectable({ providedIn: 'root' })
export class NoteSpeseService {
  constructor(private readonly http: HttpClient) {}

  updateSpesa(body: UpdateSpesaRequest): Observable<UpdateSpesaResponse> {
    return this.http.put<UpdateSpesaResponse>('/api/SpesaNota/Utente/UpdateSpesa', body);
  }
}
