import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthApiService } from '../core/auth-api.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <header class="ds-topbar">
      <a class="ds-brand" routerLink="/mes-fichiers" style="text-decoration:none; color:inherit;">DataShare</a>
      <ng-container *ngIf="getUserProfile() as user; else loginLink">
        <span class="ds-top-action">Connecté : {{ user.email }}</span>
        <button class="ds-btn ds-btn-secondary" type="button" (click)="logout()">Déconnexion</button>
      </ng-container>
      <ng-template #loginLink>
        <a class="ds-top-action" routerLink="/login">Se connecter</a>
      </ng-template>
    </header>
  `
})
export class NavbarComponent {
  private readonly authApi = inject(AuthApiService);
  private readonly router = inject(Router);

  getUserProfile() {
    const token = this.authApi.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { email: payload.sub };
    } catch {
      return null;
    }
  }

  logout() {
    this.authApi.logout();
    this.router.navigateByUrl('/login');
  }
}
