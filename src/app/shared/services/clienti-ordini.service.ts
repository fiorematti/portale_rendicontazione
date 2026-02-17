import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClienteApiItem } from '../../dto/cliente.dto';

@Injectable({ providedIn: 'root' })
export class ClientiOrdiniService {
  constructor(private readonly http: HttpClient) {}

  getClienti(idCliente?: number): Observable<ClienteApiItem[]> {
    let params = new HttpParams();
    if (idCliente !== undefined && idCliente !== null) {
      params = params.set('IdCliente', idCliente.toString());
    }
    return this.http.get<ClienteApiItem[]>('/api/Utente/utente/getClienteByUtente', { params });
  }
}
