import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DownloadMetadataResponse, FileApiService } from '../core/file-api.service';
import { NavbarComponent } from '../shared/navbar.component';

@Component({
  selector: 'app-download-page',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, NavbarComponent],
  template: `
    <div class="ds-shell">
      <app-navbar />
      <main class="ds-main">
        <section class="ds-card ds-card-sm">
          <h2 class="ds-title">Télécharger un fichier</h2>

          @if (loadingMetadata()) {
            <p class="ds-muted">Chargement des informations du fichier...</p>
          }

          @if (error()) {
            <p class="ds-error">{{ error() }}</p>
          }

          @if (metadata()) {
            <div class="ds-field">
              <div><strong>{{ metadata()!.originalName }}</strong></div>
              <div class="ds-muted">Taille: {{ metadata()!.sizeBytes }} octets</div>
              <div class="ds-muted">Ce fichier expirera le {{ metadata()!.expiresAt }}</div>
            </div>

            @if (metadata()!.passwordRequired) {
              <form class="ds-form" [formGroup]="passwordForm" (ngSubmit)="download()">
                <div class="ds-field">
                  <label class="ds-label" for="download-password">Mot de passe</label>
                  <input id="download-password" class="ds-input" type="password" formControlName="password" placeholder="Saisissez le mot de passe" />
                </div>
                <button class="ds-btn ds-btn-primary" type="submit" [disabled]="downloading()">Télécharger</button>
              </form>
            } @else {
              <button class="ds-btn ds-btn-primary" type="button" (click)="download()" [disabled]="downloading()">Télécharger</button>
            }
          }
          <div class="ds-footer-note">Copyright DataShare © 2026</div>
        </section>
      </main>
    </div>
  `
})
export class DownloadPageComponent {
  private readonly fileApi = inject(FileApiService);
  private readonly formBuilder = inject(FormBuilder);

  token = '';
  readonly metadata = signal<DownloadMetadataResponse | null>(null);
  readonly error = signal('');
  readonly loadingMetadata = signal(true);
  readonly downloading = signal(false);

  readonly passwordForm = this.formBuilder.nonNullable.group({
    password: ['', [Validators.minLength(6)]]
  });

  constructor(route: ActivatedRoute) {
    this.token = route.snapshot.paramMap.get('token') ?? '';
    this.loadMetadata();
  }

  private loadMetadata() {
    this.loadingMetadata.set(true);
    this.error.set('');
    this.fileApi.getDownloadMetadata(this.token).subscribe({
      next: (response) => this.metadata.set(response),
      error: (err) => {
        if (err?.status === 410) {
          this.error.set('Ce fichier n’est plus disponible car il a expiré.');
        } else {
          this.error.set('Lien invalide ou fichier indisponible.');
        }
        this.loadingMetadata.set(false);
      },
      complete: () => this.loadingMetadata.set(false)
    });
  }

  download() {
    if (!this.metadata()) {
      return;
    }

    const password = this.passwordForm.controls.password.value;
    if (this.metadata()!.passwordRequired && (!password || password.length < 6)) {
      this.error.set('Mot de passe requis (minimum 6 caractères).');
      return;
    }

    this.error.set('');
    this.downloading.set(true);

    const startDownload = () => {
      this.fileApi.downloadFile(this.token, password).subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = this.metadata()?.originalName ?? 'download.bin';
          anchor.click();
          URL.revokeObjectURL(url);
        },
        error: () => {
          this.error.set('Téléchargement impossible. Vérifie le mot de passe ou le lien.');
          this.downloading.set(false);
        },
        complete: () => this.downloading.set(false)
      });
    };

    if (this.metadata()!.passwordRequired) {
      this.fileApi.verifyDownloadPassword(this.token, password).subscribe({
        next: (response) => {
          if (response.valid) {
            startDownload();
          } else {
            this.error.set('Mot de passe invalide.');
            this.downloading.set(false);
          }
        },
        error: () => {
          this.error.set('Mot de passe invalide.');
          this.downloading.set(false);
        }
      });
      return;
    }

    startDownload();
  }
}
