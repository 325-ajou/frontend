import { Link } from 'react-router';
import { Utensils, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { RatingDisplay } from '@/components/ui/rating-display';
import type { Restaurant } from '@/types/restaurant';

interface SearchResultListProps {
  restaurants: Restaurant[];
}

export function SearchResultList({ restaurants }: SearchResultListProps) {
  if (restaurants.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-10">
        <p className="text-lg">검색 결과가 없습니다.</p>
        <p className="text-sm text-gray-400 mt-1">다른 검색어를 입력해보세요.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl overflow-y-auto space-y-4">
      {restaurants.map((restaurant) => (
        <Link className="block" key={restaurant.restaurant_id} to={`/restaurant/${restaurant.restaurant_id}`}>
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardContent>
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <h2 className="text-xl font-bold text-gray-800 mb-1 truncate">{restaurant.name}</h2>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Utensils className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{restaurant.category}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{restaurant.address}</span>
                    </div>
                    <div className="flex items-center mt-2 gap-2">
                      {restaurant.avg_score > 0 && (
                        <RatingDisplay rating={Math.round(restaurant.avg_score)} size="sm" />
                      )}
                      <div className="text-xs text-gray-500">
                        <span>
                          누적 방문 {restaurant.visit_count.toLocaleString()}회 • 리뷰 {restaurant.review_count}개
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
