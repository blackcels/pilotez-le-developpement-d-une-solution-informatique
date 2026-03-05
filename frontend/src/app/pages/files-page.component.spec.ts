
import { FilesPageComponent } from './files-page.component';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('FilesPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilesPageComponent],
      providers: [{ provide: ActivatedRoute, useValue: {} }],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(FilesPageComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
  it('devrait changer le statut et recharger', () => {
    const fixture = TestBed.createComponent(FilesPageComponent);
    const component = fixture.componentInstance;
    const originalLoad = component.load;
    let called = false;
    component.load = function() { called = true; originalLoad.apply(component); };
    component.setStatus('expired');
    expect(component.status()).toBe('expired');
    expect(called).toBe(true);
  });

  it('devrait afficher Aucun fichier trouvé si files est vide', () => {
    const fixture = TestBed.createComponent(FilesPageComponent);
    const component = fixture.componentInstance;
    component.files.set([]);
    component.loading.set(false);
    const compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
    expect(compiled.textContent).toContain('Aucun fichier trouvé');
  });

  it('affiche le message de chargement quand loading est true', () => {
    const fixture = TestBed.createComponent(FilesPageComponent);
    const component = fixture.componentInstance;
    component.loading.set(true);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Chargement...');
  });

    it('should show status pills for each file', () => {
      const fixture = TestBed.createComponent(FilesPageComponent);
      const component = fixture.componentInstance;
      component.files.set([
        { id: '1', originalName: 'file1.txt', sizeBytes: 123, createdAt: '', expiresAt: '', status: 'active', downloadUrl: '/api/download/abc123/suffix' },
        { id: '2', originalName: 'file2.txt', sizeBytes: 456, createdAt: '', expiresAt: '', status: 'expired', downloadUrl: '/api/download/def456/suffix' }
      ]);
      component.loading.set(false);
      fixture.detectChanges();
      const pills = fixture.nativeElement.querySelectorAll('.ds-pill');
      expect(pills.length).toBe(2);
      expect(pills[0].textContent).toContain('Actif');
      expect(pills[1].textContent).toContain('Expiré');
    });

    it('should show delete button and download link for each file', () => {
      const fixture = TestBed.createComponent(FilesPageComponent);
      const component = fixture.componentInstance;
      component.files.set([
        { id: '1', originalName: 'file1.txt', sizeBytes: 123, createdAt: '', expiresAt: '', status: 'active', downloadUrl: '/api/download/abc123/suffix' }
      ]);
      component.loading.set(false);
      fixture.detectChanges();
      const deleteBtn = fixture.nativeElement.querySelector('button.ds-btn-danger');
      const downloadLink = fixture.nativeElement.querySelector('a[routerLink]');
      expect(deleteBtn).toBeTruthy();
      expect(downloadLink).toBeTruthy();
    });

  it('load gère une erreur de subscribe', () => {
    const fixture = TestBed.createComponent(FilesPageComponent);
    const component = fixture.componentInstance;
    component['fileApi'].listFiles = () => throwError(() => new Error('Impossible de charger les fichiers.'));
    component.load();
    expect(component.error()).toContain('Impossible de charger les fichiers');
    expect(component.loading()).toBe(false);
  });

  it('delete gère une erreur de subscribe', () => {
    const fixture = TestBed.createComponent(FilesPageComponent);
    const component = fixture.componentInstance;
    (window as any).confirm = () => true;
    component['fileApi'].deleteFile = () => throwError(() => new Error('Suppression impossible.'));
    component.delete({ id: '1', originalName: 'file.txt', sizeBytes: 123, createdAt: '', expiresAt: '', status: 'active', downloadUrl: '' });
    expect(component.error()).toContain('Suppression impossible');
  });

  it('delete ne fait rien si non confirmé', () => {
    const fixture = TestBed.createComponent(FilesPageComponent);
    const component = fixture.componentInstance;
    (window as any).confirm = () => false;
    let called = false;
    component['fileApi'].deleteFile = () => { called = true; return of(void 0); };
    component.delete({ id: '1', originalName: 'file.txt', sizeBytes: 123, createdAt: '', expiresAt: '', status: 'active', downloadUrl: '' });
      expect(called).toBe(false);
    });

    it('devrait supprimer un fichier avec succès', () => {
      const fixture = TestBed.createComponent(FilesPageComponent);
      const component = fixture.componentInstance;
      (window as any).confirm = () => true;
      let deleted = false;
      component['fileApi'].deleteFile = () => {
        deleted = true;
        return of(void 0);
      };
      const originalLoad2 = component.load;
      let called2 = false;
      component.load = function() { called2 = true; originalLoad2.apply(component); };
      component.delete({ id: '1', originalName: 'file.txt', sizeBytes: 123, createdAt: '', expiresAt: '', status: 'active', downloadUrl: '' });
      expect(deleted).toBe(true);
      expect(called2).toBe(true);
    });

    it('statusLabel retourne le bon libellé', () => {
      const fixture = TestBed.createComponent(FilesPageComponent);
      const component = fixture.componentInstance;
      expect(component.statusLabel('active')).toBe('Actif');
      expect(component.statusLabel('expired')).toBe('Expiré');
    });

    it('toDownloadRoute retourne la bonne route', () => {
      const fixture = TestBed.createComponent(FilesPageComponent);
      const component = fixture.componentInstance;
      const url = '/api/download/abc123/suffix';
      expect(component.toDownloadRoute(url)).toBe('/download/abc123');
      expect(component.toDownloadRoute('/api/other')).toBe('/upload');
    });

    it('logout appelle logout et navigateByUrl', () => {
      const fixture = TestBed.createComponent(FilesPageComponent);
      const component = fixture.componentInstance;
      let logoutCalled = false;
      let navigateCalled = false;
      (component.authApi as any).logout = () => { logoutCalled = true; };
      (component.router as any).navigateByUrl = (url: string) => { navigateCalled = true; return Promise.resolve(true); };
      component.logout();
      expect(logoutCalled).toBe(true);
      expect(navigateCalled).toBe(true);
    });
    it('should show error if not connected for load', () => {
      const fixture = TestBed.createComponent(FilesPageComponent);
      const component = fixture.componentInstance;
      component['fileApi'].listFiles = () => { throw new Error('Tu dois être connecté pour voir tes fichiers.'); };
      component.load();
      expect(component.error()).toContain('Tu dois être connecté');
    });

    it('should show error if delete fails', () => {
      const fixture = TestBed.createComponent(FilesPageComponent);
      const component = fixture.componentInstance;
      (window as any).confirm = () => true;
      component['fileApi'].deleteFile = () => { throw new Error('Tu dois être connecté pour supprimer un fichier.'); };
      component.delete({ id: '1', originalName: 'file.txt', sizeBytes: 123, createdAt: '', expiresAt: '', status: 'active', downloadUrl: '' });
      expect(component.error()).toContain('Tu dois être connecté');
    });

    it('load gère le cas où fileApi.listFiles renvoie une erreur synchronement', () => {
      const fixture = TestBed.createComponent(FilesPageComponent);
      const component = fixture.componentInstance;
      component['fileApi'].listFiles = () => { throw new Error('Erreur sync'); };
      component.load();
      expect(component.error()).toBe('Tu dois être connecté pour voir tes fichiers.');
      expect(component.loading()).toBe(false);
    });

    it('delete gère le cas où fileApi.deleteFile renvoie une erreur synchronement', () => {
      const fixture = TestBed.createComponent(FilesPageComponent);
      const component = fixture.componentInstance;
      (window as any).confirm = () => true;
      component['fileApi'].deleteFile = () => { throw new Error('Erreur sync suppression'); };
      component.delete({ id: '1', originalName: 'file.txt', sizeBytes: 123, createdAt: '', expiresAt: '', status: 'active', downloadUrl: '' });
      expect(component.error()).toBe('Tu dois être connecté pour supprimer un fichier.');
    });

    it('delete gère le cas où fileApi.deleteFile renvoie un Observable qui appelle next', () => {
      const fixture = TestBed.createComponent(FilesPageComponent);
      const component = fixture.componentInstance;
      (window as any).confirm = () => true;
      let loaded = false;
      const originalLoad = component.load;
      let called = false;
      component.load = function() { called = true; originalLoad.apply(component); };
      component['fileApi'].deleteFile = () => {
        loaded = true;
        return of(void 0);
      };
      component.delete({ id: '1', originalName: 'file.txt', sizeBytes: 123, createdAt: '', expiresAt: '', status: 'active', downloadUrl: '' });
      expect(loaded).toBe(true);
      expect(called).toBe(true);
    });
});
