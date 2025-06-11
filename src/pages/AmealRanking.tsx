import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { MapPin, Trophy, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { RatingDisplay } from '@/components/ui/rating-display';
import { FOOD_CATEGORIES } from '@/types/restaurant';
import type { Restaurant, VisitRankingResponse, FoodCategory } from '@/types/restaurant';

export default function AmealRanking() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | 'Random'>('Random');

  const fetchRankings = async (category?: FoodCategory | 'Random') => {
    setError(null);

    try {
      const params = new URLSearchParams();
      if (category && category !== 'Random') {
        params.append('category', category);
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/restaurants?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`${response.status} Error`);
      }
      const data: VisitRankingResponse = await response.json();
      setRestaurants(data.restaurants);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('데이터를 불러오는 중 알 수 없는 오류가 발생했습니다.');
      }
      setRestaurants([]);
    }
  };

  useEffect(() => {
    fetchRankings(selectedCategory === 'Random' ? undefined : selectedCategory);
  }, [selectedCategory]);

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen p-4">
        <p className="text-lg text-red-500">오류가 발생했습니다 - {error}</p>
        <Button
          onClick={() => {
            setError(null);
          }}
          variant="secondary"
          className="mt-2"
        >
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <header className="mb-8 pt-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">👑 아주한끼 가이드</h1>
          <p className="text-gray-600">아주대 최고의 인기 맛집을 확인해보세요</p>
        </div>
      </header>

      <div className="flex flex-col gap-2 mb-3">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Button
            variant={selectedCategory === 'Random' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('Random')}
            className="flex-shrink-0"
          >
            전체
          </Button>
          {FOOD_CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
              className="flex-shrink-0"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {restaurants.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg">랭킹 정보가 없습니다.</p>
          <p className="text-sm text-gray-400 mt-1">다른 기간이나 카테고리를 선택해보세요.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {restaurants.map((restaurant, index) => (
            <Link className="block" key={restaurant.restaurant_id} to={`/restaurant/${restaurant.restaurant_id}`}>
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardContent>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <Badge
                            variant={index < 3 ? 'default' : 'secondary'}
                            className={`text-lg px-3 py-1 font-bold ${
                              index === 0
                                ? 'bg-yellow-500 text-white'
                                : index === 1
                                ? 'bg-gray-400 text-white'
                                : index === 2
                                ? 'bg-orange-900 text-white'
                                : ''
                            }`}
                          >
                            {index + 1}위
                          </Badge>
                        </div>

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

                          <div className="text-xs text-gray-500 mt-1">
                            <span>
                              누적 방문 {restaurant.visit_count.toLocaleString()}회 • 리뷰 {restaurant.review_count}개
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <RatingDisplay rating={Math.round(restaurant.avg_score)} size="lg" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
