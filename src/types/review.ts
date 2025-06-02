export interface Review {
  review_id: number;
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
