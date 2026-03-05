import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AutomobileDto } from '../../dto/automobile.dto';

/** Payload per l'aggiunta di un nuovo veicolo */
export interface AddAutomobileRequest {
	marca: string;
	modello: string;
	targa: string;
	tariffaChilometrica: number;
	cilindrata: number;
	idUtente: number;
}

/** Risposta API all'aggiunta di un veicolo */
export interface AddAutomobileResponse {
	esito: string;
	skippedDates: string[];
	motivazione: string | null;
}

/** Risposta API per la lista automobili (raggruppate per utente) */
export interface AutomobiliAdminResponse {
	idUtente: number;
	nomeUtente: string;
	cognomeUtente: string;
	automobili: AutomobileDto[];
}

/** DTO utente restituito dall'endpoint admin */
export interface UtenteDto {
	idUtente: number;
	nome: string | null;
	cognome: string | null;
	email: string | null;
	ruolo: string | null;
	stato: boolean;
}

/** Payload per l'aggiornamento di un veicolo esistente */
export interface UpdateAutomobileRequest {
	idAuto: number;
	marca: string;
	modello: string;
	targa: string;
	tariffaChilometrica: number;
	cilindrata: number;
}

/** Risposta API all'aggiornamento di un veicolo */
export interface UpdateAutomobileResponse {
	esito: string;
	motivazione: string | null;
}

/**
 * Service per la gestione delle automobili e tariffe chilometriche (admin).
 * Fornisce operazioni CRUD sui veicoli e il recupero della lista utenti.
 */
@Injectable({ providedIn: 'root' })
export class TariffaKmService {
	constructor(private readonly http: HttpClient) {}

	/** Recupera tutte le automobili (endpoint admin, raggruppate per utente) */
	getAllAutomobiliAdmin(): Observable<AutomobiliAdminResponse[]> {
		return this.http.get<AutomobiliAdminResponse[]>('/api/Automobile/admin/getAllAutomobili');
	}

	/** Recupera la lista di tutti gli utenti (endpoint admin) */
	getAllUtenti(): Observable<UtenteDto[]> {
		return this.http.get<UtenteDto[]>('/api/Utente/admin/getAllUtenti');
	}

	/** Aggiunge un nuovo veicolo associato a un utente */
	addAutomobile(request: AddAutomobileRequest): Observable<AddAutomobileResponse> {
		return this.http.post<AddAutomobileResponse>('/api/Automobile/admin/addAutomobile', request);
	}

	/** Aggiorna i dati di un veicolo esistente */
	updateAutomobile(request: UpdateAutomobileRequest): Observable<UpdateAutomobileResponse> {
		return this.http.put<UpdateAutomobileResponse>('/api/Automobile/admin/updateAutomobile', request);
	}

	/** Elimina un veicolo tramite il suo ID */
	deleteAutomobile(id: number): Observable<boolean> {
		const params = new HttpParams().set('id', id.toString());
		return this.http.delete<boolean>('/api/Automobile/admin/deleteAutomobile', { params });
	}
}
