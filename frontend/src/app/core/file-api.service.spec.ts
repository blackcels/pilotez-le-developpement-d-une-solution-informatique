import { FileApiService } from './file-api.service';
import { TestBed } from '@angular/core/testing';
declare function spyOn(obj: any, method: string): any;
// ...existing code...
declare const jasmine: any;

describe('FileApiService', () => {
  let service: FileApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have upload method', () => {
    expect(typeof service.upload).toBe('function');
  });

  it('should throw error if not connected for upload', () => {
    service['authApi'].getToken = () => null;
    expect(() => service.upload(new File([''], 'test.txt'))).toThrowError('Utilisateur non connecté');
  });

  it('should append password and expiresInDays to FormData', () => {
    service['authApi'].getToken = () => 'token';
    const file = new File(['content'], 'file.txt');
    const calls: any[] = [];
    const formData = {
      append: (name: string, value: string | Blob, filename?: string) => {
        calls.push([name, value, filename]);
      }
    };
    const originalFormData = window.FormData;
    (window as any).FormData = function() { return formData; };
    service.upload(file, 5, 'secret');
    expect(calls.find(call => JSON.stringify(call) === JSON.stringify(['expiresInDays', '5', undefined]))).toEqual(['expiresInDays', '5', undefined]);
    expect(calls.find(call => JSON.stringify(call) === JSON.stringify(['password', 'secret', undefined]))).toEqual(['password', 'secret', undefined]);
    (window as any).FormData = originalFormData;
  });

  it('should call getDownloadMetadata with correct token', () => {
    const httpSpy = vi.spyOn(service['http'], 'get');
    service.getDownloadMetadata('abc123');
    expect(httpSpy).toHaveBeenCalledWith('http://localhost:8080/api/download/abc123/metadata');
  });

  it('should call verifyDownloadPassword with correct token and password', () => {
    const httpSpy = vi.spyOn(service['http'], 'post');
    service.verifyDownloadPassword('abc123', 'secret');
    expect(httpSpy).toHaveBeenCalledWith('http://localhost:8080/api/download/abc123/verify-password', { password: 'secret' });
  });

  it('should call downloadFile with correct token and no password', () => {
    const httpSpy = vi.spyOn(service['http'], 'get');
    service.downloadFile('abc123');
    expect(httpSpy).toHaveBeenCalledWith('http://localhost:8080/api/download/abc123/file', { responseType: 'blob' });
  });

  it('should call downloadFile with password', () => {
    const httpSpy = vi.spyOn(service['http'], 'get');
    service.downloadFile('abc123', 'secret');
    expect(httpSpy).toHaveBeenCalledWith('http://localhost:8080/api/download/abc123/file?password=secret', { responseType: 'blob' });
  });

  it('should throw error if not connected for listFiles', () => {
    service['authApi'].getToken = () => null;
    expect(() => service.listFiles()).toThrowError('Utilisateur non connecté');
  });

  it('should call listFiles with correct status and token', () => {
    service['authApi'].getToken = () => 'token';
    const httpSpy = vi.spyOn(service['http'], 'get');
    service.listFiles('active');
    expect(httpSpy).toHaveBeenCalledWith('http://localhost:8080/api/files?status=active', expect.any(Object));
  });

  it('should throw error if not connected for deleteFile', () => {
    service['authApi'].getToken = () => null;
    expect(() => service.deleteFile('id')).toThrowError('Utilisateur non connecté');
  });

  it('should call deleteFile with correct id and token', () => {
    service['authApi'].getToken = () => 'token';
    const httpSpy = vi.spyOn(service['http'], 'delete');
    service.deleteFile('id123');
    expect(httpSpy).toHaveBeenCalledWith('http://localhost:8080/api/files/id123', expect.any(Object));
  });
});
/* global spyOn */
declare function spyOn(obj: any, method: string): any;
