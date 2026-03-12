import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AttivitaApi {
  idAttivita: number;
  name: string;
  codiceOrdine: string;
  nominativoCliente: string;
  stato_Approvazione: string;
  location: string;
  ore: number;
  dataAttivita: string;
}

export interface UtenteExport {
  id: number;
  nome: string;
  cognome: string;
}

@Injectable({ providedIn: 'root' })
export class RegistroAttivitaService {

  constructor(private readonly http: HttpClient) {}

  getAllAttivita(data: string): Observable<AttivitaApi[]> {
    return this.http.get<AttivitaApi[]>('/api/Attivita/admin/getAllAttivita', {
      params: { data }
    });
  }

  validaAttivita(ids: number[]): Observable<any> {
    return this.http.put('/api/Attivita/admin/validaAttivita', ids, { observe: 'response' });
  }

  rifiutaAttivita(ids: number[]): Observable<any> {
    return this.http.put('/api/Attivita/admin/rifiutaAttivita', ids, { observe: 'response' });
  }

  getAllUtenti(): Observable<any[]> {
    return this.http.get<any[]>('/api/Utente/admin/getAllUtenti');
  }

  exportPdfMensile(userId: number, year: number, month: string): Observable<Blob> {
    return this.http.get('/api/Attivita/admin/pdfMensile', {
      params: { userId: userId.toString(), year: year.toString(), month },
      responseType: 'blob'
    });
  }

  exportExcelMensile(userId: number, year: number, month: string): Observable<Blob> {
    return this.http.get('/api/Attivita/admin/excelMensile', {
      params: { userId: userId.toString(), year: year.toString(), month },
      responseType: 'blob'
    });
  }
}
