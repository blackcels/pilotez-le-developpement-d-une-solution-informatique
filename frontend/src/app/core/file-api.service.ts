import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { AuthApiService } from './auth-api.service';

export interface UploadResponse {
  id: string;
  originalName: string;
  sizeBytes: number;
  expiresAt: string;
  downloadUrl: string;
  passwordProtected: boolean;
}

export interface DownloadMetadataResponse {
  originalName: string;
  sizeBytes: number;
  expiresAt: string;
  passwordRequired: boolean;
}

export interface FileItemResponse {
  id: string;
  originalName: string;
  sizeBytes: number;
  createdAt: string;
  expiresAt: string;
  status: 'active' | 'expired';
  downloadUrl: string;
}

@Injectable({ providedIn: 'root' })
export class FileApiService {
  private readonly http = inject(HttpClient);
  private readonly authApi = inject(AuthApiService);
  private readonly apiBaseUrl = 'http://localhost:8080/api';

  upload(file: File, expiresInDays?: number, password?: string) {
    const token = this.authApi.getToken();
    if (!token) {
      throw new Error('Utilisateur non connecté');
    }

    const formData = new FormData();
    formData.append('file', file);
    if (expiresInDays != null) {
      formData.append('expiresInDays', String(expiresInDays));
    }
    if (password && password.trim().length > 0) {
      formData.append('password', password.trim());
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.post<UploadResponse>(`${this.apiBaseUrl}/files/upload`, formData, { headers });
  }

  getDownloadMetadata(token: string) {
    return this.http.get<DownloadMetadataResponse>(`${this.apiBaseUrl}/download/${token}/metadata`);
  }

  verifyDownloadPassword(token: string, password: string) {
    return this.http.post<{ valid: boolean }>(`${this.apiBaseUrl}/download/${token}/verify-password`, { password });
  }

  downloadFile(token: string, password?: string) {
    const query = password && password.trim().length > 0
      ? `?password=${encodeURIComponent(password.trim())}`
      : '';
    return this.http.get(`${this.apiBaseUrl}/download/${token}/file${query}`, { responseType: 'blob' });
  }

  listFiles(status: 'all' | 'active' | 'expired' = 'all') {
    const token = this.authApi.getToken();
    if (!token) {
      throw new Error('Utilisateur non connecté');
    }
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<FileItemResponse[]>(`${this.apiBaseUrl}/files?status=${status}`, { headers });
  }

  deleteFile(id: string) {
    const token = this.authApi.getToken();
    if (!token) {
      throw new Error('Utilisateur non connecté');
    }
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.delete<void>(`${this.apiBaseUrl}/files/${id}`, { headers });
  }
}
