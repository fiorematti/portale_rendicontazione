import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NotaSpesaDTO {
  data: string;
  codice: string;
  richiesto: string;
  validato: string;
  pagato: boolean;
}

@Injectable({ providedIn: 'root' })
export class NoteSpeseService {
  private readonly apiUrl = '/api/NoteSpese';

  constructor(private readonly http: HttpClient) {}

  aggiornaNotaSpesa(codice: string, nota: NotaSpesaDTO): Observable<NotaSpesaDTO> {
    return this.http.put<NotaSpesaDTO>(`${this.apiUrl}/${codice}`, nota);
  }
}
