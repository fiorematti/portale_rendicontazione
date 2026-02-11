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

@Injectable({ providedIn: 'root' })
export class NoteSpeseService {
  private readonly baseUrl = '/api/SpesaNota/Utente';

  constructor(private readonly http: HttpClient) {}

  getSpeseByYear(year: number): Observable<SpesaNotaResponse[]> {
    const params = new HttpParams().set('year', year.toString());
    return this.http.get<SpesaNotaResponse[]>(`${this.baseUrl}/GetSpeseByUserAndYear`, { params });
  }
}
