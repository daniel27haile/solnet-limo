import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.model';
import { Review, PublicReview, CreateReviewDto } from '../models/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/reviews`;

  createReview(data: CreateReviewDto): Observable<Review> {
    return this.http
      .post<ApiResponse<Review>>(this.base, data)
      .pipe(map((res) => res.data));
  }

  getPublicReviews(): Observable<PublicReview[]> {
    return this.http
      .get<ApiResponse<PublicReview[]>>(`${this.base}/public`)
      .pipe(map((res) => res.data));
  }

  getAllReviewsAdmin(): Observable<Review[]> {
    return this.http
      .get<ApiResponse<Review[]>>(`${this.base}/admin`)
      .pipe(map((res) => res.data));
  }

  updateStatus(id: string, status: 'pending' | 'approved' | 'rejected'): Observable<Review> {
    return this.http
      .patch<ApiResponse<Review>>(`${this.base}/admin/${id}/status`, { status })
      .pipe(map((res) => res.data));
  }
}
