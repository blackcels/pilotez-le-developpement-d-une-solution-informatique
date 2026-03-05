import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthApiService } from '../core/auth-api.service';
import { RouterLink } from '@angular/router';
import { FileApiService, FileItemResponse } from '../core/file-api.service';

@Component({
  selector: 'app-files-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="ds-shell">
      <header class="ds-topbar">
        <div class="ds-brand">DataShare</div>
        <div class="ds-row">
          <a class="ds-top-action" routerLink="/upload">Ajouter des fichiers</a>
          <button class="ds-top-action" type="button" (click)="logout()">Déconnexion</button>
        </div>
      </header>
      <section class="ds-layout-files">
        <aside class="ds-sidebar">
          <div class="ds-sidebar-pill">Mes fichiers</div>
        </aside>

        <main class="ds-files-main">
          <h2 class="ds-title" style="margin-top:0;">Mes fichiers</h2>

          <section class="ds-switch-row">
            <button class="ds-btn ds-btn-secondary" type="button" (click)="setStatus('all')">Tous</button>
            <button class="ds-btn ds-btn-secondary" type="button" (click)="setStatus('active')">Actifs</button>
            <button class="ds-btn ds-btn-secondary" type="button" (click)="setStatus('expired')">Expirés</button>
          </section>

          @if (loading()) {
            <p class="ds-muted">Chargement...</p>
          }

          @if (error()) {
            <p class="ds-error">{{ error() }}</p>
          }

          @if (!loading() && files().length === 0) {
            <p class="ds-muted">Aucun fichier trouvé.</p>
          }

          <ul class="ds-list">
            @for (item of files(); track item.id) {
              <li class="ds-list-item">
                <div class="ds-list-top">
                  <strong>{{ item.originalName }}</strong>
                  <span class="ds-pill">{{ statusLabel(item.status) }}</span>
                </div>
                <div class="ds-muted">Expire le: {{ item.expiresAt }}</div>
                <div class="ds-row" style="margin-top:8px; justify-content:flex-end;">
                  <button class="ds-btn ds-btn-danger" type="button" (click)="delete(item)">Supprimer</button>
                  <a [routerLink]="toDownloadRoute(item.downloadUrl)">Accéder</a>
                </div>
              </li>
            }
          </ul>
        </main>
      </section>
    </div>
  `
})
export class FilesPageComponent {
    readonly authApi: AuthApiService = inject(AuthApiService);
    readonly router: Router = inject(Router);
    logout() {
      (this.authApi as AuthApiService).logout();
      (this.router as Router).navigateByUrl('/login');
    }
  private readonly fileApi = inject(FileApiService);

  readonly files = signal<FileItemResponse[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly status = signal<'all' | 'active' | 'expired'>('all');

  constructor() {
    this.load();
  }

  setStatus(status: 'all' | 'active' | 'expired') {
    this.status.set(status);
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set('');

    try {
      this.fileApi.listFiles(this.status()).subscribe({
        next: (data) => this.files.set(data),
        error: () => {
          this.error.set('Impossible de charger les fichiers. Vérifie ta connexion.');
          this.loading.set(false);
        },
        complete: () => this.loading.set(false)
      });
    } catch {
      this.error.set('Tu dois être connecté pour voir tes fichiers.');
      this.loading.set(false);
    }
  }

  delete(item: FileItemResponse) {
    const confirmed = window.confirm(`Supprimer définitivement ${item.originalName} ?`);
    if (!confirmed) {
      return;
    }

    try {
      this.fileApi.deleteFile(item.id).subscribe({
        next: () => this.load(),
        error: () => {
          this.error.set('Suppression impossible.');
        }
      });
    } catch {
      this.error.set('Tu dois être connecté pour supprimer un fichier.');
    }
  }

  toDownloadRoute(downloadUrl: string) {
    const marker = '/download/';
    const index = downloadUrl.indexOf(marker);
    if (index < 0) {
      return '/upload';
    }
    const tokenAndSuffix = downloadUrl.substring(index + marker.length);
    const token = tokenAndSuffix.split('/')[0];
    return `/download/${token}`;
  }

  statusLabel(status: FileItemResponse['status']) {
    return status === 'active' ? 'Actif' : 'Expiré';
  }
}
