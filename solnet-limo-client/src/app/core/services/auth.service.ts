import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, AdminUser, AuthResponse } from '../models/api.model';

const TOKEN_KEY = 'solnet_admin_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  currentAdmin = signal<AdminUser | null>(this.loadAdminFromStorage());

  private base = `${environment.apiUrl}/auth`;

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.base}/login`, { email, password })
      .pipe(
        map((res) => res.data),
        tap((data) => {
          localStorage.setItem(TOKEN_KEY, data.token);
          this.currentAdmin.set(data.admin);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
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
        tap((admin) => this.currentAdmin.set(admin))
      );
  }

  private loadAdminFromStorage(): AdminUser | null {
    // Validate token exists but defer full verification to server
    if (typeof localStorage === 'undefined') return null;
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? null : null; // Admin info loaded via getMe() on init
  }
}
