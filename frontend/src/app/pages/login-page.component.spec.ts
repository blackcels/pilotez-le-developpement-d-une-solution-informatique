import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { LoginPageComponent } from './login-page.component';
import { ActivatedRoute } from '@angular/router';

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;

  let calledUrl: string | null = null;
  beforeEach(() => {
    calledUrl = null;
    TestBed.overrideComponent(LoginPageComponent, {
      set: {
        providers: [
          { provide: ActivatedRoute, useValue: {} },
          { provide: 'authApi', useValue: {
            login: () => ({ subscribe: ({ next, error, complete }: any) => next && next({ token: 'tok', user: { id: '1', email: 'test@test.com', createdAt: '2026-03-04' } }) }),
            saveToken: () => {}
          } },
          { provide: 'router', useValue: { navigateByUrl: (url: string) => { calledUrl = url; return Promise.resolve(true); } } },
        ],
      },
    });
    const fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate form', () => {
    component.form.setValue({ email: 'test@test.com', password: '12345678' });
    expect(component.form.valid).toBe(true);
  });

  it('should not submit if form is invalid', () => {
    component.form.setValue({ email: '', password: '' });
    component.onSubmit();
    expect(component.loading()).toBe(false);
  });

  it('should set error on login failure', () => {
    // Remplace le login pour simuler une erreur
    (component as any).authApi.login = () => ({ subscribe: ({ error }: any) => error && error() });
    component.form.setValue({ email: 'test@test.com', password: '12345678' });
    component.onSubmit();
    expect(component.error()).toContain('Connexion impossible');
    expect(component.loading()).toBe(false);
  });

  it('should navigate on success', async () => {
    calledUrl = null;
    component['authApi'].login = () => of({ token: 'tok', user: { id: '1', email: 'test@test.com', createdAt: '2026-03-04' } });
    component['router'].navigateByUrl = (url: string) => { calledUrl = url; return Promise.resolve(true); };
    component.form.setValue({ email: 'test@test.com', password: '12345678' });
    component.onSubmit();
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(calledUrl).not.toBeNull();
    expect(calledUrl).toBe('/mes-fichiers');
  });

    it('should set loading to false on complete', () => {
      component['authApi'].login = () => of({ token: 'tok', user: { id: '1', email: 'test@test.com', createdAt: '2026-03-04' } });
      component.form.setValue({ email: 'test@test.com', password: '12345678' });
      component.onSubmit();
      expect(component.loading()).toBe(false);
    });

    it('should disable button if loading is true', () => {
      const fixture = TestBed.createComponent(LoginPageComponent);
      const component = fixture.componentInstance;
      component.loading.set(true);
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(button.disabled).toBe(true);
    });

      it('should disable submit button when form is invalid', () => {
        const fixture = TestBed.createComponent(LoginPageComponent);
        const component = fixture.componentInstance;
        component.form.setValue({ email: '', password: '' });
        fixture.detectChanges();
        const button = fixture.nativeElement.querySelector('button[type="submit"]');
        expect(button.disabled).toBe(true);
      });

      it('should not show error message if error() is not set', () => {
        const fixture = TestBed.createComponent(LoginPageComponent);
        const component = fixture.componentInstance;
        component.error.set('');
        fixture.detectChanges();
        const errorMsg = fixture.nativeElement.querySelector('.ds-error');
        expect(errorMsg).toBeNull();
      });

        it('should show required error for email and password fields', () => {
          const fixture = TestBed.createComponent(LoginPageComponent);
          const component = fixture.componentInstance;
          const emailInput = fixture.nativeElement.querySelector('input[formControlName="email"]');
          const passwordInput = fixture.nativeElement.querySelector('input[formControlName="password"]');
          emailInput.value = '';
          passwordInput.value = '';
          emailInput.dispatchEvent(new Event('input'));
          passwordInput.dispatchEvent(new Event('input'));
          component.form.controls['email'].markAsTouched();
          component.form.controls['password'].markAsTouched();
          fixture.detectChanges();
          expect(component.form.controls['email'].hasError('required')).toBe(true);
          expect(component.form.controls['password'].hasError('required')).toBe(true);
        });

    it('should show error message in template', () => {
      const fixture = TestBed.createComponent(LoginPageComponent);
      const component = fixture.componentInstance;
      component.error.set('Erreur de connexion');
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Erreur de connexion');
    });
});
