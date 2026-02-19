import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AutomobileDto } from '../../dto/automobile.dto';

export interface AddAutomobileRequest {
	marca: string;
	modello: string;
	targa: string;
	tariffaChilometrica: number;
	cilindrata: number;
	idUtente: number;
}

export interface AddAutomobileResponse {
	esito: string;
	skippedDates: string[];
	motivazione: string | null;
}

export interface AutomobiliAdminResponse {
	idUtente: number;
	nomeUtente: string;
	cognomeUtente: string;
	automobili: AutomobileDto[];
}

export interface UpdateAutomobileRequest {
	idAuto: number;
	marca: string;
	modello: string;
	targa: string;
	tariffaChilometrica: number;
	cilindrata: number;
}

export interface UpdateAutomobileResponse {
	esito: string;
	motivazione: string | null;
}

// export interface AddSpesaDettaglio {
//   dataDettaglio: string;
//   vitto: number;
//   hotel: number;
//   trasportiLocali: number;
//   aereo: number;
//   spesaVaria: number;
//   idAuto: number | null;
//   km: number;
//   telepass: number;
//   parking: number;
// }



@Injectable({ providedIn: 'root' })
export class TariffaKmService {
	constructor(private readonly http: HttpClient) {}

	

	getAllAutomobiliAdmin(): Observable<AutomobiliAdminResponse[]> {
		return this.http.get<AutomobiliAdminResponse[]>('/api/Automobile/admin/getAllAutomobili');
	}

	addAutomobile(request: AddAutomobileRequest): Observable<AddAutomobileResponse> {
		return this.http.post<AddAutomobileResponse>('/api/Automobile/admin/addAutomobile', request);
	}

	updateAutomobile(request: UpdateAutomobileRequest): Observable<UpdateAutomobileResponse> {
		return this.http.put<UpdateAutomobileResponse>('/api/Automobile/admin/updateAutomobile', request);
	}

	deleteAutomobile(id: number): Observable<boolean> {
		const params = new HttpParams().set('id', id.toString());
		return this.http.delete<boolean>('/api/Automobile/admin/deleteAutomobile', { params });
	}

	// addSpesa(request: AddSpesaRequest): Observable<boolean> {
	// 	return this.http.post<boolean>(`${this.baseUrl}/AddSpesa`, request);
	//   }
}
