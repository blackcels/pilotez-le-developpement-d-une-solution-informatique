import { signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

export interface UserProfile {
  id: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  readonly userProfile = signal<UserProfile | null>(null);
  readonly tokenSignal = signal<string | null>(null);
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = 'http://localhost:8080/api';
  private readonly tokenStorageKey = 'datashare_token';

  signup(email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.apiBaseUrl}/auth/signup`, { email, password });
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.apiBaseUrl}/auth/login`, { email, password });
  }

  saveToken(token: string, user?: UserProfile) {
    localStorage.setItem(this.tokenStorageKey, token);
    if (this.tokenSignal) this.tokenSignal.set(token);
    if (this.userProfile && user) this.userProfile.set(user);
  }

  getToken() {
    if (this.tokenSignal) return this.tokenSignal();
    return localStorage.getItem(this.tokenStorageKey);
  }

  clearToken() {
    localStorage.removeItem(this.tokenStorageKey);
    if (this.tokenSignal) this.tokenSignal.set(null);
    if (this.userProfile) this.userProfile.set(null);
  }

  logout() {
    this.clearToken();
  }
}
