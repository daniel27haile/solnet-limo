import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.model';
import { PricingSettings, PriceCalculation } from '../models/pricing.model';

@Injectable({ providedIn: 'root' })
export class PricingService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/pricing`;

  getSettings(): Observable<PricingSettings> {
    return this.http
      .get<ApiResponse<PricingSettings>>(`${this.base}/settings`)
      .pipe(map((res) => res.data));
  }

  calculatePrice(pickupLocation: string, dropoffLocation: string): Observable<PriceCalculation> {
    return this.http
      .post<ApiResponse<PriceCalculation>>(`${this.base}/calculate`, { pickupLocation, dropoffLocation })
      .pipe(map((res) => res.data));
  }

  updateSettings(data: Partial<PricingSettings>): Observable<PricingSettings> {
    return this.http
      .patch<ApiResponse<PricingSettings>>(`${this.base}/settings`, data)
      .pipe(map((res) => res.data));
  }
}
