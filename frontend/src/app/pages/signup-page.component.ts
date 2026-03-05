import { NavbarComponent } from '../shared/navbar.component';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthApiService } from '../core/auth-api.service';

@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, NavbarComponent],
  template: `
    <div class="ds-shell">
      <app-navbar />
      <main class="ds-main">
        <section class="ds-card ds-card-sm">
          <h2 class="ds-title">Créer un compte</h2>
          <form class="ds-form" [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="ds-field">
              <label class="ds-label" for="email">Email</label>
              <input id="email" class="ds-input" type="email" formControlName="email" placeholder="Saisissez votre email" />
            </div>

            <div class="ds-field">
              <label class="ds-label" for="password">Mot de passe</label>
              <input id="password" class="ds-input" type="password" formControlName="password" placeholder="Saisissez votre mot de passe" />
            </div>

            <div class="ds-field">
              <label class="ds-label" for="confirmPassword">Vérification du mot de passe</label>
              <input id="confirmPassword" class="ds-input" type="password" formControlName="confirmPassword" placeholder="Saisissez-le à nouveau" />
            </div>

            <a routerLink="/login" class="ds-muted">J'ai déjà un compte</a>
            <button class="ds-btn ds-btn-primary" type="submit" [disabled]="loading() || form.invalid">Créer mon compte</button>
          </form>

          @if (error()) {
            <p class="ds-error">{{ error() }}</p>
          }
          <div class="ds-footer-note">Copyright DataShare © 2026</div>
        </section>
      </main>
    </div>
  `
})
export class SignupPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal('');

  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  });

  onSubmit() {
    if (this.form.invalid || this.loading()) {
      return;
    }

    const { email, password, confirmPassword } = this.form.getRawValue();
    if (password !== confirmPassword) {
      this.error.set('Les mots de passe ne correspondent pas.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authApi.signup(email, password).subscribe({
      next: (response) => {
        this.authApi.saveToken(response.token, response.user);
        this.router.navigateByUrl('/mes-fichiers');
      },
      error: () => {
        this.error.set('Inscription impossible. Vérifie les informations saisies.');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false)
    });
  }
}
