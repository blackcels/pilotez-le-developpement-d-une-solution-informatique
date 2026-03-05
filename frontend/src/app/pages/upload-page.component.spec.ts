import { of, throwError } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from '../shared/navbar.component';
import { UploadPageComponent } from './upload-page.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthApiService } from '../core/auth-api.service';
import { FileApiService } from '../core/file-api.service';

describe('UploadPageComponent', () => {
  let mockRouter: any;
  let authApiMock: any;
  let fileApiMock: any;
  let mockActivatedRoute: any;

  beforeEach(() => {
    mockRouter = {
      navigate: vi.fn(),
      events: of(),
      createUrlTree: vi.fn(() => ({})),
      navigateByUrl: vi.fn(),
      serializeUrl: vi.fn(() => ''),
    };
    authApiMock = { getToken: () => 'token', logout: vi.fn() };
    fileApiMock = { upload: vi.fn() };
    mockActivatedRoute = { snapshot: { params: {} } };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([]), CommonModule, ReactiveFormsModule, NavbarComponent, RouterLink],
      providers: [
        { provide: AuthApiService, useValue: authApiMock },
        { provide: Router, useValue: mockRouter },
        { provide: FileApiService, useValue: fileApiMock },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    });
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(UploadPageComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should disable button if loading is true', () => {
    const fixture = TestBed.createComponent(UploadPageComponent);
    const component = fixture.componentInstance;
    component.loading.set(true);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button.disabled).toBe(true);
  });

  it('should navigate to /login if not connected (constructor)', () => {
    authApiMock.getToken = () => null;
    const fixture = TestBed.createComponent(UploadPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('should logout and navigate to /login', () => {
    const fixture = TestBed.createComponent(UploadPageComponent);
    const component = fixture.componentInstance;
    component.logout();
    expect(authApiMock.logout).toHaveBeenCalled();
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('should set selectedFileName and selectedFileSize on file select', () => {
    const fixture = TestBed.createComponent(UploadPageComponent);
    const component = fixture.componentInstance;
    const file = new File(['abc'], 'file.txt');
    const event = { target: { files: [file] } } as any;
    component.onFileSelected(event);
    expect(component.selectedFileName()).toBe('file.txt');
    expect(component.selectedFileSize()).toBe(3);
  });

  // it('should set copyMessage signal', () => {
  //   const fixture = TestBed.createComponent(UploadPageComponent);
  //   const component = fixture.componentInstance;
  //   component.copyMessage.set('copied!');
  //   expect(component.copyMessage()).toBe('copied!');
  // });

  it('should show error if no file selected', () => {
    const fixture = TestBed.createComponent(UploadPageComponent);
    const component = fixture.componentInstance;
    component.selectedFile.set(null);
    component.onSubmit();
    expect(component.error()).toBe('Sélectionne un fichier avant de téléverser.');
  });

  it('should show error if password too short', () => {
    const fixture = TestBed.createComponent(UploadPageComponent);
    const component = fixture.componentInstance;
    component.selectedFile.set(new File([''], 'test.txt'));
    component.form.controls.password.setValue('123');
    component.onSubmit();
    expect(component.error()).toBe('Le mot de passe doit contenir au moins 6 caractères.');
  });

  it('should show error if API fails', () => {
    const fixture = TestBed.createComponent(UploadPageComponent);
    const component = fixture.componentInstance;
    component.selectedFile.set(new File([''], 'test.txt'));
    component.form.controls.password.setValue('123456');
    component.fileApi.upload = () => throwError(() => new Error('Upload impossible. Vérifie ta connexion et les données saisies.'));
    component.onSubmit();
    expect(component.error()).toBe('Upload impossible. Vérifie ta connexion et les données saisies.');
  });

  it('should set uploadResult on success', () => {
    const fixture = TestBed.createComponent(UploadPageComponent);
    const component = fixture.componentInstance;
    component.selectedFile.set(new File([''], 'test.txt'));
    component.form.controls.password.setValue('123456');
    const result = {
      id: '1',
      originalName: 'test.txt',
      sizeBytes: 123,
      expiresAt: '2026-03-04',
      downloadUrl: 'url',
      passwordProtected: false
    };
    component.fileApi.upload = () => of(result);
    component.onSubmit();
    expect(component.uploadResult()).toEqual(result);
  });

  it('should set loading to false on complete', () => {
    const fixture = TestBed.createComponent(UploadPageComponent);
    const component = fixture.componentInstance;
    component.selectedFile.set(new File([''], 'test.txt'));
    component.form.controls.password.setValue('123456');
    const result = {
      id: '1',
      originalName: 'test.txt',
      sizeBytes: 123,
      expiresAt: '2026-03-04',
      downloadUrl: 'url',
      passwordProtected: false
    };
    component.fileApi.upload = () => of(result);
    component.onSubmit();
    expect(component.loading()).toBe(false);
  });

  it('should show error message in template', () => {
    const fixture = TestBed.createComponent(UploadPageComponent);
    const component = fixture.componentInstance;
    component.error.set('Erreur upload');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Erreur upload');
  });

  it('should show error if upload throws (catch)', () => {
    const fixture = TestBed.createComponent(UploadPageComponent);
    const component = fixture.componentInstance;
    component.selectedFile.set(new File([''], 'test.txt'));
    component.form.controls.password.setValue('123456');
    component.fileApi.upload = () => { throw new Error('not connected'); };
    component.onSubmit();
    expect(component.error()).toBe('Tu dois être connecté pour téléverser un fichier.');
    expect(component.loading()).toBe(false);
  });

  it('should copy link to clipboard', async () => {
    const fixture = TestBed.createComponent(UploadPageComponent);
    const component = fixture.componentInstance;
    const link = 'url';
    component.uploadResult.set({
      id: '1',
      originalName: 'test.txt',
      sizeBytes: 123,
      expiresAt: '2026-03-04',
      downloadUrl: link,
      passwordProtected: false
    });
    let copied = false;
    if (!navigator.clipboard) {
      (navigator as any).clipboard = {};
    }
    (navigator.clipboard as any).writeText = (text: string) => {
      copied = text === link;
      return Promise.resolve();
    };
    await component.copyLink();
    expect(copied).toBe(true);
  });

});