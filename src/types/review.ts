export interface Review {
  review_id: number;
  reviewer: string;
  score: number;
  comment: string;
  created_at: string;
}

export interface MyReview {
  review_id: number;
  restaurant_id: number;
  reviewer: string;
  score: number;
  comment: string;
  created_at: string;
}

export interface ReviewFormData {
  score: number;
  comment: string;
}

export type ReviewResponse = Review[];

export interface MyReviewsResponse {
  total_count: number;
  total_pages: number;
  current_page: number;
  items_per_page: number;
  reviews: MyReview[];
}
