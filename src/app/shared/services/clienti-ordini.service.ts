import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ClienteApiItem } from '../../dto/cliente.dto';
import { OrdineApiItem } from '../../dto/ordine.dto';

/**
 * Service condiviso per il recupero dei clienti e degli ordini dell'utente.
 * Utilizzato da più componenti (attivita, note-spese) per evitare duplicazione
 * delle chiamate API relative a clienti e ordini.
 */
@Injectable({ providedIn: 'root' })
export class ClientiOrdiniService {
  constructor(private readonly http: HttpClient) {}

  /**
   * Recupera i clienti associati all'utente corrente.
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
   * Recupera gli ordini di un utente filtrati per cliente specifico.
   * @param clienteId - ID del cliente per cui filtrare gli ordini
   */
  getOrdiniByUtenteAndCliente(clienteId: number): Observable<OrdineApiItem[]> {
    const params = new HttpParams().set('clienteId', clienteId.toString());
    return this.http.get<OrdineApiItem[]>('/api/Utente/utente/getOrdiniByUtenteAndCliente', { params });
  }
}