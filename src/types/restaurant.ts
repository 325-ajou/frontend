import type { Menu } from './menu';

export interface Restaurant {
  restaurant_id: number;
  name: string;
  address: string;
  phone: string;
  category: string;
  lat: string;
  lng: string;
  local_currency: boolean;
  goodness: boolean;
  kind_price: boolean;
  review_count: number;
  visit_count: number;
  restaurant_score: number;
  avg_score: number;
}

export interface RestaurantDetail extends Restaurant {
  menus: Menu[];
  one_line_comment: string;
}

export interface RestaurantsResponse {
  total_count: number;
  total_pages: number;
  current_page: number;
  items_per_page: number;
  restaurants: Restaurant[];
}

export const FOOD_CATEGORIES = [
  '한식',
  '중식',
  '양식',
  '일식',
  '아시아',
  '패스트푸드',
  '분식',
  '카페',
  '치킨',
  '술집',
  '간식',
  '뷔페',
] as const;

export interface RestaurantRecommendation extends Restaurant {
  monthly_visits: number;
  weekly_visits: number;
  daily_visits: number;
  recommendation_reason: string;
}

export interface AIRecommendationRequest {
  situation: string;
  category?: string;
}

export interface AIRecommendationResponse {
  recommendations: RestaurantRecommendation[];
}

export type FoodCategory = (typeof FOOD_CATEGORIES)[number];

export type RankingPeriod = 'daily' | 'weekly' | 'monthly';

export interface RankingRestaurant extends Restaurant {
  period_visit_count: number;
}

export interface VisitRankingResponse {
  period: RankingPeriod;
  category?: string;
  start_time: string;
  restaurants: RankingRestaurant[];
}
