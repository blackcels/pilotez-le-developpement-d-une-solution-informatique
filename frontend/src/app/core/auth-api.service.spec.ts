import { AuthApiService } from './auth-api.service';
import { TestBed } from '@angular/core/testing';

describe('AuthApiService', () => {
  let service: AuthApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have getToken method', () => {
    expect(typeof service.getToken).toBe('function');
  });

  it('should save and get token', () => {
    service.saveToken('test-token', { id: '1', email: 'test@test.com', createdAt: '2026-03-04' });
    expect(localStorage.getItem('datashare_token')).toBe('test-token');
    expect(service.getToken()).toBe('test-token');
  });

  it('should return null if no token', () => {
    localStorage.removeItem('datashare_token');
    expect(service.getToken()).toBeNull();
  });

  it('should call signup with email and password', () => {
    let called = false;
    let urlArg = '';
    let bodyArg: any = {};
    const httpSpy = {
      post: function(url: string, body: any) {
        called = true;
        urlArg = url;
        bodyArg = body;
      }
    };
    // @ts-ignore
    service['http'] = httpSpy;
    service.signup('test@test.com', 'password');
    expect(called).toBe(true);
    expect(urlArg).toContain('/auth/signup');
    expect(bodyArg).toEqual({ email: 'test@test.com', password: 'password' });
  });

  it('should call login with email and password', () => {
    let called = false;
    let urlArg = '';
    let bodyArg: any = {};
    const httpSpy = {
      post: function(url: string, body: any) {
        called = true;
        urlArg = url;
        bodyArg = body;
      }
    };
    // @ts-ignore
    service['http'] = httpSpy;
    service.login('test@test.com', 'password');
    expect(called).toBe(true);
    expect(urlArg).toContain('/auth/login');
    expect(bodyArg).toEqual({ email: 'test@test.com', password: 'password' });
  });

  it('should clear token and user', () => {
    service.saveToken('tok', { id: '1', email: 'test@test.com', createdAt: '2026-03-04' });
    service.clearToken();
    expect(localStorage.getItem('datashare_token')).toBeNull();
    expect(service.getToken()).toBeNull();
    expect(service.userProfile()).toBeNull();
  });

  it('should logout and remove token', () => {
    service.saveToken('tok');
    service.logout();
    expect(localStorage.getItem('datashare_token')).toBeNull();
  });
});
