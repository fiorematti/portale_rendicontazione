import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ClienteApiItem } from '../../dto/cliente.dto';
import { OrdineApiItem } from '../../dto/ordine.dto';

@Injectable({ providedIn: 'root' })
export class ClientiOrdiniService {
  constructor(private readonly http: HttpClient) {}

  /**
   * GET /api/Utente/utente/getClienteByUtente
   * L'API ritorna { id, nominativo } — mappiamo id -> idCliente per il DTO.
   */
  getClienti(): Observable<ClienteApiItem[]> {
    return this.http.get<any[]>('/api/Utente/utente/getClienteByUtente').pipe(
      map(res => (res || []).map(item => ({
        idCliente: item.id ?? item.idCliente,
        nominativo: item.nominativo
      } as ClienteApiItem)))
    );
  }

  /**
   * GET /api/Utente/utente/getOrdiniByUtenteAndCliente?clienteId=X
   */
  getOrdiniByUtenteAndCliente(clienteId: number): Observable<OrdineApiItem[]> {
    const params = new HttpParams().set('clienteId', clienteId.toString());
    return this.http.get<OrdineApiItem[]>('/api/Utente/utente/getOrdiniByUtenteAndCliente', { params });
  }
}