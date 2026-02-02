import { Routes } from '@angular/router';
import { Attivita } from './components/attivita/attivita';
import { NoteSpese } from './components/note-spese/note-spese';
import { UtentiComponent } from './components/utenti/utenti';
import { ClientiComponent } from './components/clienti/clienti';
import { OrdiniComponent } from './components/ordini/ordini';
import { RegistroAttivitaComponent } from './components/registro-attivita/registro-attivita';
import { RegistroNoteComponent } from './components/registro-note/registro-note';
import { TariffaKmComponent } from './components/tariffa-km/tariffa-km';

export const routes: Routes = [
  { path: '', redirectTo: 'attivita', pathMatch: 'full' },
  { path: 'attivita', component: Attivita }, 
  { path: 'note-spese', component: NoteSpese},
  { path: 'utenti', component: UtentiComponent },
  { path: 'clienti', component: ClientiComponent },
  { path: 'tariffa-km', component: TariffaKmComponent },
  { path: 'ordini', component: OrdiniComponent },
  { path: 'registro-attivita', component: RegistroAttivitaComponent },
  { path: 'registro-note', component: RegistroNoteComponent },
  // Quando apri il sito, viene reindirizzato alla pagina di login
  { path: '**', redirectTo: 'attivita' }

];