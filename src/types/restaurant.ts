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
  menus: string[]; // 메뉴 배열
  one_line_comment: string; // AI 요약 코멘트
}

export interface RestaurantsResponse {
  total_count: number;
  total_pages: number;
  current_page: number;
  items_per_page: number;
  restaurants: Restaurant[];
}
