import { Routes } from '@angular/router';
import { Attivita } from './components/attivita/attivita';
import { NoteSpese } from './components/note-spese/note-spese';
import { UtentiComponent } from './components/utenti/utenti';
import { ClientiComponent } from './components/clienti/clienti';
import { OrdiniComponent } from './components/ordini/ordini';
import { TariffaKm } from './components/tariffa-km/tariffa-km';
import { RegistroAttivitaComponent } from './components/registro-attivita/registro-attivita';
import { RegistroNoteComponent } from './components/registro-note/registro-note';

export const routes: Routes = [
  { path: 'attivita', component: Attivita },
  { path: 'note-spese', component: NoteSpese},
  { path: 'utenti', component: UtentiComponent },
  { path: 'clienti', component: ClientiComponent },
  { path: 'ordini', component: OrdiniComponent },
  { path: 'tariffa-km', component: TariffaKm },
  { path: 'registro-attivita', component: RegistroAttivitaComponent },
  { path: 'registro-note', component: RegistroNoteComponent },
  // Quando apri il sito, ti manda automaticamente su attività
  { path: '', redirectTo: '/attivita', pathMatch: 'full' } 
];