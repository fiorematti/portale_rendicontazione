import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../dto/userdto';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar implements OnInit {
  // default: collapsed (icons only). Hover to expand.
  collapsed = true;
  showSidebar = true;
  userName = '';

  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  ngOnInit(): void {
    this.updateSidebar(this.router.url);
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.updateSidebar(e.urlAfterRedirects));

    	this.auth.userChanges().subscribe((user: User | null) => {
    		this.userName = user ? `${user.name} ${user.surname}` : '';
    	});
  }

  onSidebarEnter(): void {
    this.collapsed = false;
  }

  onSidebarLeave(): void {
    this.collapsed = true;
  }

  onLogout(event: Event): void {
    event.preventDefault();
    this.auth.logout();
  }

  private updateSidebar(url: string): void {
    this.showSidebar = !url.startsWith('/login');
  }
}