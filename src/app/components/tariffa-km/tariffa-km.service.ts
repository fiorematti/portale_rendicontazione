import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AutomobileDto } from '../../dto/automobile.dto';

@Injectable({ providedIn: 'root' })
export class TariffaKmService {
	constructor(private readonly http: HttpClient) {}

	getAllAutomobili(): Observable<AutomobileDto[]> {
		return this.http.get<AutomobileDto[]>('/api/Automobile/utente/getAllAutomobiliByUtente');
	}
}
