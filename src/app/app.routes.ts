import { Routes } from '@angular/router';
import { Attivita } from './components/attivita/attivita';
import { NoteSpese } from './components/note-spese/note-spese';
import { UtentiComponent } from './components/utenti/utenti';
import { ClientiComponent } from './components/clienti/clienti';
import { OrdiniComponent } from './components/ordini/ordini';
import { RegistroAttivitaComponent } from './components/registro-attivita/registro-attivita';
import { RegistroNoteComponent } from './components/registro-note/registro-note';
import { TariffaKmComponent } from './components/tariffa-km/tariffa-km';
import { LoginComponent } from './auth/login';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'attivita', component: Attivita, canActivate: [authGuard] }, 
  { path: 'note-spese', component: NoteSpese, canActivate: [authGuard]},
  { path: 'utenti', component: UtentiComponent, canActivate: [authGuard] },
  { path: 'clienti', component: ClientiComponent, canActivate: [authGuard] },
  { path: 'tariffa-km', component: TariffaKmComponent, canActivate: [authGuard] },
  { path: 'ordini', component: OrdiniComponent, canActivate: [authGuard] },
  { path: 'registro-attivita', component: RegistroAttivitaComponent, canActivate: [authGuard] },
  { path: 'registro-note', component: RegistroNoteComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' }
];