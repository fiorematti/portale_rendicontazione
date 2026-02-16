import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AutomobileDto } from '../../dto/automobile.dto';

@Injectable({ providedIn: 'root' })
export class TariffaKmService {
  constructor(private readonly http: HttpClient) {}

  async getAllAutomobili(): Promise<AutomobileDto[]> {
    return firstValueFrom(
      this.http.get<AutomobileDto[]>('/api/Automobile/utente/getAllAutomobiliByUtente')
    );
  }
}
