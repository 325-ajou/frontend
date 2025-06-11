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

export interface RatingOption {
  label: string;
  emoji: string;
  description: string;
}

export const RATING_OPTIONS: RatingOption[] = [
  { label: '평가없음', emoji: '❓', description: '평가 없음' },
  { label: '화나요', emoji: '😡', description: '매우 불만족' },
  { label: '쏘쏘', emoji: '🤔', description: '아쉬움' },
  { label: '괜찮아요', emoji: '👍', description: '보통' },
  { label: '추천', emoji: '👍👍', description: '만족' },
  { label: '꼭 가세요', emoji: '👍👍👍', description: '매우 만족' },
];

export const isAnonymousUser = (reviewer: string): boolean => {
  return reviewer.includes('익명');
};
