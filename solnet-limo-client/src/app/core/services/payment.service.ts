import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.model';
import { PaymentConfirmation } from '../models/payment.model';
import { BookingDraft } from '../models/booking.model';

declare const Square: any;

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/payments`;

  private sdkLoaded = false;
  private sdkLoadPromise: Promise<void> | null = null;
  private squareCard: any = null;

  /** Dynamically loads the Square Web Payments SDK. */
  loadSquareSdk(): Promise<void> {
    if (this.sdkLoaded) return Promise.resolve();
    if (this.sdkLoadPromise) return this.sdkLoadPromise;

    this.sdkLoadPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${environment.squareSdkUrl}"]`);
      if (existing) {
        this.sdkLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = environment.squareSdkUrl;
      script.async = true;
      script.onload = () => {
        this.sdkLoaded = true;
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load payment SDK.'));
      document.head.appendChild(script);
    });

    return this.sdkLoadPromise;
  }

  /** Initializes the Square card payment form and attaches it to a container div. */
  async initCard(containerId: string): Promise<void> {
    if (!environment.squareAppId || environment.squareAppId.includes('REPLACE')) {
      throw new Error('Square App ID is not configured. Please set it in environment.ts.');
    }

    const payments = Square.payments(environment.squareAppId, environment.squareLocationId);
    this.squareCard = await payments.card();
    await this.squareCard.attach(`#${containerId}`);
  }

  /** Tokenizes the card and returns the sourceId. */
  async tokenize(): Promise<string> {
    if (!this.squareCard) {
      throw new Error('Payment form not initialized.');
    }
    const result = await this.squareCard.tokenize();
    if (result.status === 'OK') {
      return result.token;
    }
    const errorMessage =
      result.errors?.map((e: any) => e.message).join(', ') || 'Card tokenization failed.';
    throw new Error(errorMessage);
  }

  /** Destroys the card form (cleanup on navigation away). */
  async destroyCard(): Promise<void> {
    if (this.squareCard) {
      await this.squareCard.destroy();
      this.squareCard = null;
    }
  }

  /** Sends booking draft + Square sourceId to the backend to process payment and create booking. */
  createPayment(bookingDraft: BookingDraft, sourceId: string): Observable<PaymentConfirmation> {
    return this.http
      .post<ApiResponse<PaymentConfirmation>>(
        `${this.base}/create`,
        { bookingDraft, sourceId }
      )
      .pipe(map((res) => res.data));
  }
}
