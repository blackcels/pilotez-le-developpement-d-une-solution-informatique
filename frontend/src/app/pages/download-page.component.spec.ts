
import { DownloadPageComponent } from './download-page.component';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

describe('DownloadPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DownloadPageComponent],
      providers: [{
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            paramMap: {
              get: (key: string) => 'dummy-token'
            }
          }
        }
      }],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(DownloadPageComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should show error if password required and too short', () => {
    const fixture = TestBed.createComponent(DownloadPageComponent);
    const component = fixture.componentInstance;
    component.metadata.set({
      originalName: 'file.txt',
      sizeBytes: 123,
      expiresAt: '2026-03-04',
      passwordRequired: true
    });
    component.passwordForm.controls['password'].setValue('123');
    component.download();
    expect(component.error()).toContain('Mot de passe requis');
  });

  it('should show error if download fails', () => {
    const fixture = TestBed.createComponent(DownloadPageComponent);
    const component = fixture.componentInstance;
    component.metadata.set({
      originalName: 'file.txt',
      sizeBytes: 123,
      expiresAt: '2026-03-04',
      passwordRequired: false
    });
    component['fileApi'].downloadFile = () => ({
      subscribe: ({ error }: any) => error(),
      forEach: () => Promise.resolve(),
      lift: function<R>(operator?: any): any { return this; },
      operator: undefined,
      source: undefined,
      pipe: function() { return this; },
      toPromise: function() { return Promise.resolve(undefined as Blob | undefined); }
    });
    component.passwordForm.controls['password'].setValue('abcdef');
    component.download();
    expect(component.error()).toContain('Téléchargement impossible');
  });

    it('should set error if metadata expired (status 410)', () => {
      const fixture = TestBed.createComponent(DownloadPageComponent);
      const component = fixture.componentInstance;
      component['fileApi'].getDownloadMetadata = () => throwError(() => ({ status: 410 }));
      component['loadMetadata']();
      expect(component.error()).toBe('Ce fichier n’est plus disponible car il a expiré.');
    });

    it('should set error if metadata invalid', () => {
      const fixture = TestBed.createComponent(DownloadPageComponent);
      const component = fixture.componentInstance;
      component['fileApi'].getDownloadMetadata = () => throwError(() => ({ status: 404 }));
      component['loadMetadata']();
      expect(component.error()).toBe('Lien invalide ou fichier indisponible.');
    });

    it('should set error if verifyDownloadPassword fails', () => {
      const fixture = TestBed.createComponent(DownloadPageComponent);
      const component = fixture.componentInstance;
      component.metadata.set({
        originalName: 'file.txt',
        sizeBytes: 123,
        expiresAt: '2026-03-04',
        passwordRequired: true
      });
      component.passwordForm.controls['password'].setValue('abcdef');
      component['fileApi'].verifyDownloadPassword = () => throwError(() => ({}));
      component.download();
      expect(component.error()).toBe('Mot de passe invalide.');
    });

    it('should set error if verifyDownloadPassword returns invalid', () => {
      const fixture = TestBed.createComponent(DownloadPageComponent);
      const component = fixture.componentInstance;
      component.metadata.set({
        originalName: 'file.txt',
        sizeBytes: 123,
        expiresAt: '2026-03-04',
        passwordRequired: true
      });
      component.passwordForm.controls['password'].setValue('abcdef');
      component['fileApi'].verifyDownloadPassword = () => of({ valid: false });
      component.download();
      expect(component.error()).toBe('Mot de passe invalide.');
    });

    it('should start download if verifyDownloadPassword returns valid', () => {
      const fixture = TestBed.createComponent(DownloadPageComponent);
      const component = fixture.componentInstance;
      component.metadata.set({
        originalName: 'file.txt',
        sizeBytes: 123,
        expiresAt: '2026-03-04',
        passwordRequired: true
      });
      component.passwordForm.controls['password'].setValue('abcdef');
      let downloadCalled = false;
      component['fileApi'].verifyDownloadPassword = () => of({ valid: true });
      component['fileApi'].downloadFile = () => of(new Blob());
      // On surveille l'appel à downloadFile
      const oldDownloadFile = component['fileApi'].downloadFile;
      component['fileApi'].downloadFile = (...args: any[]) => {
        downloadCalled = true;
        return oldDownloadFile(...args as [any]);
      };
      component.download();
      expect(downloadCalled).toBe(true);
    });

    it('should start download if no password required', () => {
      const fixture = TestBed.createComponent(DownloadPageComponent);
      const component = fixture.componentInstance;
      component.metadata.set({
        originalName: 'file.txt',
        sizeBytes: 123,
        expiresAt: '2026-03-04',
        passwordRequired: false
      });
      let downloadCalled = false;
      component['fileApi'].downloadFile = () => of(new Blob());
      const oldDownloadFile = component['fileApi'].downloadFile;
      component['fileApi'].downloadFile = (...args: any[]) => {
        downloadCalled = true;
        return oldDownloadFile(...args as [any]);
      };
      component.download();
      expect(downloadCalled).toBe(true);
    });
});
