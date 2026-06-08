import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, AdminUser, AuthResponse } from '../models/api.model';

const TOKEN_KEY = 'solnet_admin_token';
const ADMIN_KEY  = 'solnet_admin_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Immediately restored from localStorage — non-null on refresh if previously logged in
  currentAdmin = signal<AdminUser | null>(this.loadAdminFromStorage());

  private base = `${environment.apiUrl}/auth`;

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.base}/login`, { email, password })
      .pipe(
        map((res) => res.data),
        tap((data) => {
          localStorage.setItem(TOKEN_KEY, data.token);
          this.persistAdmin(data.admin);
          this.currentAdmin.set(data.admin);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
    this.currentAdmin.set(null);
    this.router.navigate(['/admin/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getMe(): Observable<AdminUser> {
    return this.http
      .get<ApiResponse<AdminUser>>(`${this.base}/me`)
      .pipe(
        map((res) => res.data),
        tap((admin) => {
          this.currentAdmin.set(admin);
          this.persistAdmin(admin);
        })
      );
  }

  private persistAdmin(admin: AdminUser): void {
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
  }

  private loadAdminFromStorage(): AdminUser | null {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(ADMIN_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AdminUser;
    } catch {
      return null;
    }
  }
}
