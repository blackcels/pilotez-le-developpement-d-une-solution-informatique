import { of, throwError } from 'rxjs';
declare function spyOn(obj: any, method: string): any;
import { TestBed } from '@angular/core/testing';
import { SignupPageComponent } from './signup-page.component';
import { ActivatedRoute } from '@angular/router';

describe('SignupPageComponent', () => {
  let component: SignupPageComponent;

  beforeEach(() => {
    TestBed.overrideComponent(SignupPageComponent, {
      set: {
        providers: [
          { provide: ActivatedRoute, useValue: {} },
          { provide: 'authApi', useValue: { signup: () => ({ subscribe: () => {} }), saveToken: () => {} } },
          { provide: 'router', useValue: { navigateByUrl: () => {} } },
        ],
      },
    });
    const fixture = TestBed.createComponent(SignupPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate form', () => {
    component.form.setValue({ email: 'test@test.com', password: '12345678', confirmPassword: '12345678' });
    expect(component.form.valid).toBe(true);
  });

    it('should show error if passwords do not match', () => {
      component.form.setValue({ email: 'test@test.com', password: '12345678', confirmPassword: 'wrongpass' });
      component.onSubmit();
      expect(component.error()).toBe('Les mots de passe ne correspondent pas.');
    });

    it('should show error if API fails', () => {
      // Mock API to fail
      component.form.setValue({ email: 'test@test.com', password: '12345678', confirmPassword: '12345678' });
      component['authApi'].signup = () => throwError(() => new Error('Inscription impossible. Vérifie les informations saisies.'));
      component.onSubmit();
      expect(component.error()).toBe('Inscription impossible. Vérifie les informations saisies.');
    });

    it('should navigate on successful signup', () => {
      let navigated = false;
      component['authApi'].signup = () => of({ token: 'tok', user: { id: '1', email: 'test@test.com', createdAt: '2026-03-04' } });
      component['authApi'].saveToken = () => {};
      component['router'].navigateByUrl = () => {
        navigated = true;
        return Promise.resolve(true);
      };
      component.form.setValue({ email: 'test@test.com', password: '12345678', confirmPassword: '12345678' });
      component.onSubmit();
      expect(navigated).toBe(true);
    });

    it('should set loading to false on complete', () => {
      component['authApi'].signup = () => of({ token: 'tok', user: { id: '1', email: 'test@test.com', createdAt: '2026-03-04' } });
      component.form.setValue({ email: 'test@test.com', password: '12345678', confirmPassword: '12345678' });
      component.onSubmit();
      expect(component.loading()).toBe(false);
    });

    it('should disable button if loading is true', () => {
      const fixture = TestBed.createComponent(SignupPageComponent);
      const component = fixture.componentInstance;
      component.loading.set(true);
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(button.disabled).toBe(true);
    });

      it('should disable submit button when form is invalid', () => {
        const fixture = TestBed.createComponent(SignupPageComponent);
        const component = fixture.componentInstance;
        component.form.setValue({ email: '', password: '', confirmPassword: '' });
        fixture.detectChanges();
        const button = fixture.nativeElement.querySelector('button[type="submit"]');
        expect(button.disabled).toBe(true);
      });

      it('should not show error message if error() is not set', () => {
        const fixture = TestBed.createComponent(SignupPageComponent);
        const component = fixture.componentInstance;
        component.error.set('');
        fixture.detectChanges();
        const errorMsg = fixture.nativeElement.querySelector('.ds-error');
        expect(errorMsg).toBeNull();
      });

        it('should show required error for all fields', () => {
          const fixture = TestBed.createComponent(SignupPageComponent);
          const component = fixture.componentInstance;
          const emailInput = fixture.nativeElement.querySelector('input[formControlName="email"]');
          const passwordInput = fixture.nativeElement.querySelector('input[formControlName="password"]');
          const confirmInput = fixture.nativeElement.querySelector('input[formControlName="confirmPassword"]');
          emailInput.value = '';
          passwordInput.value = '';
          confirmInput.value = '';
          emailInput.dispatchEvent(new Event('input'));
          passwordInput.dispatchEvent(new Event('input'));
          confirmInput.dispatchEvent(new Event('input'));
          component.form.controls['email'].markAsTouched();
          component.form.controls['password'].markAsTouched();
          component.form.controls['confirmPassword'].markAsTouched();
          fixture.detectChanges();
          expect(component.form.controls['email'].hasError('required')).toBe(true);
          expect(component.form.controls['password'].hasError('required')).toBe(true);
          expect(component.form.controls['confirmPassword'].hasError('required')).toBe(true);
        });

    it('should show error message in template', () => {
      const fixture = TestBed.createComponent(SignupPageComponent);
      const component = fixture.componentInstance;
      component.error.set('Erreur d\'inscription');
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Erreur d\'inscription');
    });
});
