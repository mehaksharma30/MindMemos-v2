import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  isMenuOpen = signal<boolean>(false);

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  toggleMenu(): void {
    this.isMenuOpen.set(!this.isMenuOpen());
  }

  logout(): void {
    this.authService.logout();
  }

  get currentUser() {
    return this.authService.currentUser();
  }

  get isAuthenticated() {
    return this.authService.isAuthenticated();
  }

  get username(): string {
    return this.currentUser?.username || '';
  }

  get tokens(): number {
    return this.currentUser?.tokens || 0;
  }

  get currentUserId(): string {
    return this.currentUser?.id || '';
  }
}
