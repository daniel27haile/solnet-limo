import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.model';
import { ContactMessage, ContactFormData, MessageStats } from '../models/contact.model';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/contact`;

  submitMessage(data: ContactFormData): Observable<ContactMessage> {
    return this.http
      .post<ApiResponse<ContactMessage>>(this.base, data)
      .pipe(map((res) => res.data));
  }

  getMessages(params?: { isRead?: boolean; page?: number; limit?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.isRead !== undefined) httpParams = httpParams.set('isRead', params.isRead.toString());
    if (params?.page)  httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());

    return this.http
      .get<ApiResponse<any>>(this.base, { params: httpParams })
      .pipe(map((res) => res.data));
  }

  getMessageById(id: string): Observable<ContactMessage> {
    return this.http
      .get<ApiResponse<ContactMessage>>(`${this.base}/${id}`)
      .pipe(map((res) => res.data));
  }

  markAsRead(id: string): Observable<ContactMessage> {
    return this.http
      .patch<ApiResponse<ContactMessage>>(`${this.base}/${id}/read`, {})
      .pipe(map((res) => res.data));
  }

  deleteMessage(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<null>>(`${this.base}/${id}`)
      .pipe(map(() => undefined));
  }

  getStats(): Observable<MessageStats> {
    return this.http
      .get<ApiResponse<MessageStats>>(`${this.base}/stats`)
      .pipe(map((res) => res.data));
  }

  replyToMessage(id: string, replyBody: string): Observable<ContactMessage> {
    return this.http
      .post<ApiResponse<ContactMessage>>(`${this.base}/${id}/reply`, { replyBody })
      .pipe(map((res) => res.data));
  }
}
