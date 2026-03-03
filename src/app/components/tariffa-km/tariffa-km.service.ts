import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AutomobileDto } from '../../dto/automobile.dto';

/** Payload per la creazione di una nuova automobile. */
export interface AddAutomobileRequest {
	marca: string;
	modello: string;
	targa: string;
	tariffaChilometrica: number;
	cilindrata: number;
	/** ID dell'utente proprietario dell'automobile. */
	idUtente: number;
}

/** Risposta alla creazione di un'automobile. */
export interface AddAutomobileResponse {
	esito: string;
	skippedDates: string[];
	motivazione: string | null;
}

/** Risposta dell'endpoint admin che raggruppa le automobili per utente. */
export interface AutomobiliAdminResponse {
	idUtente: number;
	nomeUtente: string;
	cognomeUtente: string;
	automobili: AutomobileDto[];
}

/** DTO utente restituito dall'endpoint admin. */
export interface UtenteDto {
	idUtente: number;
	nome: string | null;
	cognome: string | null;
	email: string | null;
	ruolo: string | null;
	stato: boolean;
}

/** Payload per l'aggiornamento di un'automobile esistente. */
export interface UpdateAutomobileRequest {
	idAuto: number;
	marca: string;
	modello: string;
	targa: string;
	tariffaChilometrica: number;
	cilindrata: number;
}

/** Risposta all'aggiornamento di un'automobile. */
export interface UpdateAutomobileResponse {
	esito: string;
	motivazione: string | null;
}

/**
 * Servizio per le operazioni CRUD sulle automobili e gli utenti (sezione admin).
 * Tutte le richieste utilizzano URL relativi; il base URL viene aggiunto dall'interceptor.
 */
@Injectable({ providedIn: 'root' })
export class TariffaKmService {
	constructor(private readonly http: HttpClient) {}

	/** Recupera tutte le automobili raggruppate per utente (endpoint admin). */
	getAllAutomobiliAdmin(): Observable<AutomobiliAdminResponse[]> {
		return this.http.get<AutomobiliAdminResponse[]>('/api/Automobile/admin/getAllAutomobili');
	}

	/** Recupera la lista di tutti gli utenti (endpoint admin). */
	getAllUtenti(): Observable<UtenteDto[]> {
		return this.http.get<UtenteDto[]>('/api/Utente/admin/getAllUtenti');
	}

	/** Aggiunge una nuova automobile associata a un utente. */
	addAutomobile(request: AddAutomobileRequest): Observable<AddAutomobileResponse> {
		return this.http.post<AddAutomobileResponse>('/api/Automobile/admin/addAutomobile', request);
	}

	/** Aggiorna i dati di un'automobile esistente. */
	updateAutomobile(request: UpdateAutomobileRequest): Observable<UpdateAutomobileResponse> {
		return this.http.put<UpdateAutomobileResponse>('/api/Automobile/admin/updateAutomobile', request);
	}

	/** Elimina un'automobile per ID. */
	deleteAutomobile(id: number): Observable<boolean> {
		const params = new HttpParams().set('id', id.toString());
		return this.http.delete<boolean>('/api/Automobile/admin/deleteAutomobile', { params });
	}
}
