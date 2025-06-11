export interface Visit {
  visit_id: number;
  restaurant_id: number;
  created_at: string;
}

export interface VisitsResponse {
  total_count: number;
  total_pages: number;
  current_page: number;
  items_per_page: number;
  visits: Visit[];
}

export interface VisitWithRestaurant extends Visit {
  restaurant_name?: string;
  restaurant_category?: string;
  restaurant_address?: string;
}
