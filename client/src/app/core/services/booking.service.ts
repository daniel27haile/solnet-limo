import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.model';
import { Booking, BookingFormData, BookingStats } from '../models/booking.model';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/bookings`;

  submitBooking(data: BookingFormData): Observable<Booking> {
    return this.http
      .post<ApiResponse<Booking>>(this.base, data)
      .pipe(map((res) => res.data));
  }

  getBookings(params?: { status?: string; page?: number; limit?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.page)   httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit)  httpParams = httpParams.set('limit', params.limit.toString());

    return this.http
      .get<ApiResponse<any>>(this.base, { params: httpParams })
      .pipe(map((res) => res.data));
  }

  getBookingById(id: string): Observable<Booking> {
    return this.http
      .get<ApiResponse<Booking>>(`${this.base}/${id}`)
      .pipe(map((res) => res.data));
  }

  updateStatus(id: string, status: string): Observable<Booking> {
    return this.http
      .patch<ApiResponse<Booking>>(`${this.base}/${id}/status`, { status })
      .pipe(map((res) => res.data));
  }

  deleteBooking(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<null>>(`${this.base}/${id}`)
      .pipe(map(() => undefined));
  }

  getStats(): Observable<BookingStats> {
    return this.http
      .get<ApiResponse<BookingStats>>(`${this.base}/stats`)
      .pipe(map((res) => res.data));
  }
}
