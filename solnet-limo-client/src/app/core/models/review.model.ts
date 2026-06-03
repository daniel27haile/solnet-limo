export interface Review {
  _id: string;
  bookingId: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  comment?: string;
  vehicleType?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface PublicReview {
  _id: string;
  customerName: string;
  rating: number;
  comment?: string;
  vehicleType?: string;
  createdAt: string;
}

export interface CreateReviewDto {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  comment?: string;
  vehicleType?: string;
}
