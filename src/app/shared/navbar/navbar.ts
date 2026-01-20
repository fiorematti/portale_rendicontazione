import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // Importazione corretta

@Component({
  selector: 'app-navbar',
  standalone: true, // Assicurati che sia standalone se usi "imports"
  imports: [RouterModule], // Usa RouterModule per routerLink e router-outlet
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar { }