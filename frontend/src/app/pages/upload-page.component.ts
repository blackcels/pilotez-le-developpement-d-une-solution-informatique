import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthApiService } from '../core/auth-api.service';
import { NavbarComponent } from '../shared/navbar.component';
import { CommonModule } from '@angular/common';
import { FileApiService, UploadResponse } from '../core/file-api.service';

@Component({
  selector: 'app-upload-page',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, NavbarComponent, CommonModule],
  template: `
    <div class="ds-shell">
      <app-navbar />
      <main class="ds-main">
        <section class="ds-card ds-card-md">
          <h2 class="ds-title">Téléverser un fichier</h2>
          <form class="ds-form" (ngSubmit)="onSubmit()" [formGroup]="form">
            <div class="ds-field">
              <label class="ds-label" for="file">Fichier</label>
              <input id="file" class="ds-input" type="file" (change)="onFileSelected($event)" />
              <span *ngIf="selectedFileName()">{{ selectedFileName() }} ({{ selectedFileSize() }} octets)</span>
            </div>
            <div class="ds-field">
              <label class="ds-label" for="password">Mot de passe</label>
              <input id="password" class="ds-input" type="password" formControlName="password" placeholder="Optionnel" />
            </div>
            <div class="ds-field">
              <label class="ds-label" for="expires">Expiration</label>
              <select id="expires" class="ds-select" formControlName="expiresInDays">
                <option [value]="1">Une journée</option>
                <option [value]="3">3 jours</option>
                <option [value]="7">Une semaine</option>
              </select>
            </div>
            <button class="ds-btn ds-btn-primary" type="submit" [disabled]="loading()">Téléverser</button>
          </form>
          <ng-container *ngIf="error()">
            <p class="ds-error">{{ error() }}</p>
          </ng-container>
          <ng-container *ngIf="uploadResult()">
            <section class="ds-success">
              <strong>Félicitations, ton fichier sera conservé chez nous pendant la durée choisie.</strong>
              <div style="margin-top:8px; word-break: break-all;">
                <a [href]="uploadResult()!.downloadUrl" target="_blank" rel="noopener">{{ uploadResult()!.downloadUrl }}</a>
              </div>
              <div class="ds-row" style="margin-top:8px;">
                <button class="ds-btn ds-btn-primary" type="button" (click)="copyLink()">Copier le lien</button>
                <ng-container *ngIf="copyMessage()">
                  <span class="ds-muted">{{ copyMessage() }}</span>
                </ng-container>
              </div>
            </section>
          </ng-container>
        </section>
      </main>
      <div class="ds-topbar" style="height:26px; align-items:flex-end; border-top:1px solid #e0a18b;">
        <div class="ds-footer-note">Copyright DataShare® 2025</div>
      </div>
    </div>
  `,
})

export class UploadPageComponent {
  readonly form = inject(FormBuilder).nonNullable.group({
    expiresInDays: [7, [Validators.required, Validators.min(1), Validators.max(7)]],
    password: ['']
  });

  readonly authApi = inject(AuthApiService);
  readonly router = inject(Router);
  readonly fileApi = inject(FileApiService);
  readonly selectedFile = signal<File | null>(null);
  readonly selectedFileName = signal('');
  readonly selectedFileSize = signal(0);
  readonly error = signal('');
  readonly loading = signal(false);
  readonly uploadResult = signal<UploadResponse | null>(null);
  readonly copyMessage = signal('');

  constructor() {
    if (!this.authApi.getToken()) {
      this.router.navigateByUrl('/login');
    }
  }

  logout() {
    this.authApi.logout();
    this.router.navigateByUrl('/login');
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files && target.files.length > 0 ? target.files[0] : null;
    this.selectedFile.set(file);
    this.selectedFileName.set(file?.name ?? '');
    this.selectedFileSize.set(file?.size ?? 0);
  }

  onSubmit() {
    this.error.set('');
    this.uploadResult.set(null);
    this.copyMessage.set('');
    const file = this.selectedFile();
    if (!file) {
      this.error.set('Sélectionne un fichier avant de téléverser.');
      return;
    }
    const password = this.form.controls.password.value;
    if (password && password.length > 0 && password.length < 6) {
      this.error.set('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    this.loading.set(true);
    try {
      this.fileApi
        .upload(file, this.form.controls.expiresInDays.value, password)
        .subscribe({
          next: (result) => this.uploadResult.set(result),
          error: () => {
            this.error.set('Upload impossible. Vérifie ta connexion et les données saisies.');
            this.loading.set(false);
          },
          complete: () => this.loading.set(false)
        });
    } catch {
      this.error.set('Tu dois être connecté pour téléverser un fichier.');
      this.loading.set(false);
    }
  }

  copyLink() {
    const link = this.uploadResult()?.downloadUrl;
    if (!link) {
      return;
    }
    navigator.clipboard.writeText(link)
      .then(() => this.copyMessage.set('Lien copié'))
      .catch(() => this.copyMessage.set('Copie impossible'));
  }
}
