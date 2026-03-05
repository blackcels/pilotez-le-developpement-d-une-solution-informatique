import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NavbarComponent } from './navbar.component';
import { Router } from '@angular/router';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let authApiMock: any;
  let routerMock: any;

  beforeEach(() => {
    authApiMock = {
      getToken: () => null,
      logout: () => {}
    };
    routerMock = {
      navigateByUrl: () => {}
    };
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, NavbarComponent],
      providers: [
        { provide: 'authApi', useValue: authApiMock },
        { provide: ActivatedRoute, useValue: {} },
      ]
    });
    const fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    // Remplace les injections directes
    (component as any).authApi = authApiMock;
    // (component as any).router = routerMock;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getUserProfile returns null if no token', () => {
    authApiMock.getToken = () => null;
    expect(component.getUserProfile()).toBeNull();
  });

  it('getUserProfile returns null if token is malformed', () => {
    // token with invalid base64
    authApiMock.getToken = () => 'bad.token.value';
    expect(component.getUserProfile()).toBeNull();
  });

  it('getUserProfile returns null if atob throws (malformed token)', () => {
    // token with invalid base64 payload (atob will throw)
    authApiMock.getToken = () => 'header.@@@.sig';
    expect(component.getUserProfile()).toBeNull();
  });

  it('getUserProfile returns email if token is valid', () => {
    // token with valid base64 payload
    const payload = { sub: 'test@example.com' };
    const base64 = btoa(JSON.stringify(payload));
    authApiMock.getToken = () => 'header.' + base64 + '.sig';
    expect(component.getUserProfile()).toEqual({ email: 'test@example.com' });
  });

  it('logout calls authApi.logout and router.navigateByUrl', () => {
    let logoutCalled = false;
    let navigateCalled = false;
    let navigateArg = '';
    authApiMock.logout = () => { logoutCalled = true; };
    const router = TestBed.inject(Router);
    router.navigateByUrl = (url: string) => { navigateCalled = true; navigateArg = url; return Promise.resolve(true); };
    component.logout();
    expect(logoutCalled).toBe(true);
    expect(navigateCalled).toBe(true);
    expect(navigateArg).toBe('/login');
  });

  it('affiche le lien Se connecter si getUserProfile retourne null', () => {
    authApiMock.getToken = () => null;
    const fixture = TestBed.createComponent(NavbarComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Se connecter');
  });
});