import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.model';
import { Service } from '../models/service.model';

@Injectable({ providedIn: 'root' })
export class ServicesDataService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/services`;

  getServices(): Observable<Service[]> {
    return this.http
      .get<ApiResponse<Service[]>>(this.base)
      .pipe(map((res) => res.data));
  }

  getAllServicesAdmin(): Observable<Service[]> {
    return this.http
      .get<ApiResponse<Service[]>>(`${this.base}/admin`)
      .pipe(map((res) => res.data));
  }

  createService(data: Partial<Service>): Observable<Service> {
    return this.http
      .post<ApiResponse<Service>>(this.base, data)
      .pipe(map((res) => res.data));
  }

  updateService(id: string, data: Partial<Service>): Observable<Service> {
    return this.http
      .patch<ApiResponse<Service>>(`${this.base}/${id}`, data)
      .pipe(map((res) => res.data));
  }

  deleteService(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<null>>(`${this.base}/${id}`)
      .pipe(map(() => undefined));
  }
}
