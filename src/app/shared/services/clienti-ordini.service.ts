import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClienteApiItem } from '../../dto/cliente.dto';
import { OrdineApiItem } from '../../dto/ordine.dto';

@Injectable({ providedIn: 'root' })
export class ClientiOrdiniService {
  constructor(private readonly http: HttpClient) {}

  getClienti(idCliente?: number): Observable<ClienteApiItem[]> {
    let params = new HttpParams();
    if (idCliente !== undefined && idCliente !== null) {
      params = params.set('IdCliente', idCliente.toString());
    }
    let result = this.http.get<ClienteApiItem[]>('/api/Utente/utente/getClienteByUtente');
    return result;
  }

  getOrdini(idCliente?: number): Observable<OrdineApiItem[]> {
    let params = new HttpParams();
    if (idCliente !== undefined && idCliente !== null) {
      params = params.set('IdCliente', idCliente.toString());
    }
    return this.http.get<OrdineApiItem[]>('/api/Ordini', { params });
  }

  getOrdiniByUtenteAndCliente(clienteId: number): Observable<OrdineApiItem[]> {
    const params = new HttpParams().set('clienteId', clienteId.toString());
    let result = this.http.get<OrdineApiItem[]>('/api/Ordini/getOrdiniByUtenteAndCliente', { params });
    return result;
  }
}
