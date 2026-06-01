import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';

import { AuthService } from './auth.service';
import { AdminUser, AuthResponse } from '../models/api.model';
import { environment } from '../../../environments/environment';
import { createMockAdminUser, createMockAuthResponse } from '../../testing/test-fixtures';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerNavigateSpy: jasmine.Spy;

  /** Must mirror the private constant in auth.service.ts. */
  const TOKEN_KEY = 'solnet_admin_token';
  const BASE = `${environment.apiUrl}/auth`;

  // Stable defaults shared across tests — override only the field under test.
  const mockAdmin: AdminUser = createMockAdminUser();
  const mockAuthResponse: AuthResponse = createMockAuthResponse({ admin: mockAdmin });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // RouterTestingModule provides a real Router.  We spy on navigate so that:
    //  (a) the async navigation fired by logout() does not outlive the TestBed
    //      instance, which would trigger NG0205 "Injector has already been
    //      destroyed", and
    //  (b) we can assert the navigation target without a real routing cycle.
    routerNavigateSpy = spyOn(TestBed.inject(Router), 'navigate').and.returnValue(
      Promise.resolve(true)
    );

    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  // -------------------------------------------------------------------------

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // -------------------------------------------------------------------------

  describe('login()', () => {
    it('POSTs credentials to /auth/login and returns the AuthResponse', fakeAsync(() => {
      let received: AuthResponse | undefined;
      service.login(mockAdmin.email, 'p@ssw0rd').subscribe((data) => (received = data));

      const req = httpMock.expectOne(`${BASE}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: mockAdmin.email, password: 'p@ssw0rd' });
      req.flush({ success: true, message: 'Login successful', data: mockAuthResponse });
      tick(); // flush tap() side-effects (localStorage write, signal update)

      expect(received!.token).toBe(mockAuthResponse.token);
      expect(received!.admin.email).toBe(mockAdmin.email);
    }));

    it('stores the JWT in localStorage on success', fakeAsync(() => {
      service.login(mockAdmin.email, 'p@ssw0rd').subscribe();

      const req = httpMock.expectOne(`${BASE}/login`);
      req.flush({ success: true, message: 'Login successful', data: mockAuthResponse });
      tick();

      expect(localStorage.getItem(TOKEN_KEY)).toBe(mockAuthResponse.token);
    }));

    it('updates the currentAdmin signal on success', fakeAsync(() => {
      service.login(mockAdmin.email, 'p@ssw0rd').subscribe();

      const req = httpMock.expectOne(`${BASE}/login`);
      req.flush({ success: true, message: 'Login successful', data: mockAuthResponse });
      tick();

      expect(service.currentAdmin()).toEqual(mockAdmin);
    }));
  });

  // -------------------------------------------------------------------------

  describe('logout()', () => {
    it('removes the token from localStorage', () => {
      localStorage.setItem(TOKEN_KEY, 'existing-token');
      service.logout();
      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    });

    it('resets currentAdmin signal to null', () => {
      service.logout();
      expect(service.currentAdmin()).toBeNull();
    });

    it('navigates to /admin/login', () => {
      service.logout();
      expect(routerNavigateSpy).toHaveBeenCalledOnceWith(['/admin/login']);
    });
  });

  // -------------------------------------------------------------------------

  describe('getToken()', () => {
    it('returns the stored token string', () => {
      localStorage.setItem(TOKEN_KEY, 'stored-token');
      expect(service.getToken()).toBe('stored-token');
    });

    it('returns null when no token is stored', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  // -------------------------------------------------------------------------

  describe('isAuthenticated()', () => {
    it('returns true when a token is present', () => {
      localStorage.setItem(TOKEN_KEY, 'valid-token');
      expect(service.isAuthenticated()).toBeTrue();
    });

    it('returns false when no token is present', () => {
      expect(service.isAuthenticated()).toBeFalse();
    });
  });

  // -------------------------------------------------------------------------

  describe('getMe()', () => {
    it('GETs /auth/me and returns the AdminUser', fakeAsync(() => {
      let received: AdminUser | undefined;
      service.getMe().subscribe((result) => (received = result));

      const req = httpMock.expectOne(`${BASE}/me`);
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, message: 'Success', data: mockAdmin });
      tick();

      expect(received).toEqual(mockAdmin);
    }));

    it('updates the currentAdmin signal', fakeAsync(() => {
      service.getMe().subscribe();

      const req = httpMock.expectOne(`${BASE}/me`);
      req.flush({ success: true, message: 'Success', data: mockAdmin });
      tick();

      expect(service.currentAdmin()).toEqual(mockAdmin);
    }));
  });
});
