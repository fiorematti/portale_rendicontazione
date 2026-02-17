import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LuogoApiItem } from '../../dto/luogo.dto';

export interface AttivitaItem {
  idAttivita: number;
  codiceOrdine: string;
  nominativoCliente: string;
  location: string;
  ore: number;
  dataAttivita: string;
  stato?: string;
}

export interface AddAttivitaPayload {
  codiceOrdine: string;
  luogo: number;
  dataInizio: string;
  dataFine: string;
  ricorrenza: number[];
  oreLavoro: number;
}

export interface AddAttivitaResponse {
  esito: string;
  skippedDates: string[];
  motivazione?: string | null;
}

export interface UpdateAttivitaPayload {
  idAttivita: number;
  codiceOrdine: string;
  luogo: number;
  dataAttivita: string;
  oreLavoro: number;
}

export interface UpdateAttivitaResponse {
  esito: string;
  motivazione: string | null;
}

export interface DeleteAttivitaResponse {
  esito: string;
  skippedDates: string[];
  motivazione: string | null;
}

@Injectable({ providedIn: 'root' })
export class AttivitaService {
  private readonly baseUrl = '/api/Attivita/utente';
  constructor(private readonly http: HttpClient) {}

  getAttivita(data: string): Observable<AttivitaItem[]> {
    const params = new HttpParams().set('data', data);
    return this.http.get<AttivitaItem[]>(`${this.baseUrl}/getAttivitaById`, { params });
  }

  addAttivita(payload: AddAttivitaPayload): Observable<AddAttivitaResponse> {
    return this.http.post<AddAttivitaResponse>(`${this.baseUrl}/addAttivita`, payload);
  }

  updateAttivita(payload: UpdateAttivitaPayload): Observable<UpdateAttivitaResponse> {
    return this.http.put<UpdateAttivitaResponse>(`${this.baseUrl}/UpdateAttivita`, payload);
  }

  deleteAttivita(idAttivita: number): Observable<DeleteAttivitaResponse> {
    const params = new HttpParams().set('IdAttivita', idAttivita.toString());
    return this.http.delete<DeleteAttivitaResponse>(`${this.baseUrl}/DeleteAttivita`, { params });
  }

  getLocation(): Observable<LuogoApiItem[]> {
    return this.http.get<LuogoApiItem[]>('/api/Luogo/getAllLuoghi');
  }
}
