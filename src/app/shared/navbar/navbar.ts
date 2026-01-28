import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar implements OnInit {
  // default: collapsed (icons only). Hover to expand.
  collapsed = true;

  ngOnInit(): void {}

  onSidebarEnter(): void {
    this.collapsed = false;
  }

  onSidebarLeave(): void {
    this.collapsed = true;
  }

  onLogout(event: Event): void {
    event.preventDefault();
    // Prevent navigation; implement actual logout logic here if needed
    console.log('Logout clicked - navigation prevented');
  }
}