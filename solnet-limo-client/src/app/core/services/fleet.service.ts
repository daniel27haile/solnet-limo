import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.model';
import { FleetVehicle } from '../models/fleet.model';

@Injectable({ providedIn: 'root' })
export class FleetService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/fleet`;

  getFleet(): Observable<FleetVehicle[]> {
    return this.http
      .get<ApiResponse<FleetVehicle[]>>(this.base)
      .pipe(map((res) => res.data));
  }

  getAllFleetAdmin(): Observable<FleetVehicle[]> {
    return this.http
      .get<ApiResponse<FleetVehicle[]>>(`${this.base}/admin`)
      .pipe(map((res) => res.data));
  }

  createVehicle(data: Partial<FleetVehicle>): Observable<FleetVehicle> {
    return this.http
      .post<ApiResponse<FleetVehicle>>(this.base, data)
      .pipe(map((res) => res.data));
  }

  updateVehicle(id: string, data: Partial<FleetVehicle>): Observable<FleetVehicle> {
    return this.http
      .patch<ApiResponse<FleetVehicle>>(`${this.base}/${id}`, data)
      .pipe(map((res) => res.data));
  }

  deleteVehicle(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<null>>(`${this.base}/${id}`)
      .pipe(map(() => undefined));
  }
}
