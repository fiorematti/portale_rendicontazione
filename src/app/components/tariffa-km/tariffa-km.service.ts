import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

	getAllAutomobili(): Observable<AutomobileDto[]> {
		return this.http.get<AutomobileDto[]>('/api/Automobile/utente/getAllAutomobiliByUtente');
	}

	addAutomobile(request: AddAutomobileRequest): Observable<AddAutomobileResponse> {
		return this.http.post<AddAutomobileResponse>('/api/Automobile/admin/addAutomobile', request);
	}

	// addSpesa(request: AddSpesaRequest): Observable<boolean> {
	// 	return this.http.post<boolean>(`${this.baseUrl}/AddSpesa`, request);
	//   }
}
