import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AttivitaItem {
  idAttivita: number;
  codiceOrdine: string;
  nominativoCliente: string;
  location: string;
  ore: number;
  dataAttivita: string;
}

export interface AddAttivitaPayload {
  codiceOrdine: string;
  luogo: string;
  dataInizio: string; // YYYY-MM-DD
  dataFine: string; // YYYY-MM-DD
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
  luogo: string;
  dataAttivita: string; // YYYY-MM-DD
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

export interface ClienteApiItem {
  idCliente: number;
  nominativo: string;
}

export interface OrdineApiItem {
  codiceOrdine: string;
  idCliente: number;
  codiceOfferta?: string | null;
  descrizione?: string | null;
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
  private readonly baseUrl = 'http://localhost:5000/api/Attivita/utente'; // usa environment
  constructor(private http: HttpClient) {}

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

  getClienti(idCliente?: number): Observable<ClienteApiItem[]> {
    let params = new HttpParams();
    if (idCliente !== undefined && idCliente !== null) {
      params = params.set('IdCliente', idCliente.toString());
    }
    return this.http.get<ClienteApiItem[]>(`http://localhost:5000/api/Utente/utente/getClienteByUtente`, { params });
  }

  getOrdini(idCliente?: number): Observable<OrdineApiItem[]> {
    let params = new HttpParams();
    if (idCliente !== undefined && idCliente !== null) {
      params = params.set('IdCliente', idCliente.toString());
    }
    return this.http.get<OrdineApiItem[]>(`http://localhost:5000/api/Ordini`, { params });
  }
}
