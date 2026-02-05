import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AttivitaItem {
  idAttivita: number; 
  codiceOrdine: string;
  nominativoCliente: string;
  stato_Approvazione?: string;
  approvato?: boolean;
  location: string;
  ore: number;
  dataAttivita: string;
}

// "idAttivita": 1,
//     "codiceOrdine": "1234",
//     "nominativoCliente": "cliente1",
//     "stato_Approvazione": "non validato",
//     "location": "sede",
//     "ore": 8,
//     "dataAttivita": "2026-02-05"

@Injectable({ providedIn: 'root' })
export class AttivitaService {
  private apiUrl = 'http://localhost:5000/api/Attivita/utente/getAttivitaById'; // usa environment
  constructor(private http: HttpClient) {}
  getAttivita(data: string): Observable<AttivitaItem[]> {
    const params = new HttpParams().set('data', data);
    return this.http.get<AttivitaItem[]>(this.apiUrl, { params });
  }
}