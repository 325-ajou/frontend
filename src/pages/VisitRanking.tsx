import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Calendar, Clock, Users, MapPin, Trophy, Utensils, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { RatingDisplay } from '@/components/ui/rating-display';
import { FOOD_CATEGORIES } from '@/types/restaurant';
import type { RankingRestaurant, VisitRankingResponse, RankingPeriod, FoodCategory } from '@/types/restaurant';

const PERIOD_OPTIONS = [
  { value: 'daily' as RankingPeriod, label: '일별', icon: Clock },
  { value: 'weekly' as RankingPeriod, label: '주별', icon: CalendarDays },
  { value: 'monthly' as RankingPeriod, label: '월별', icon: Calendar },
];

export default function VisitRanking() {
  const [restaurants, setRestaurants] = useState<RankingRestaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<RankingPeriod>('daily');
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | 'Random'>('Random');

  const fetchRankings = async (period: RankingPeriod, category?: FoodCategory | 'Random') => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ period });
      if (category && category !== 'Random') {
        params.append('category', category);
      }

      const response = await fetch(`/api/restaurants/rankings/visits?${params.toString()}`);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings(selectedPeriod, selectedCategory === 'Random' ? undefined : selectedCategory);
  }, [selectedPeriod, selectedCategory]);

  const getPeriodLabel = () => {
    const option = PERIOD_OPTIONS.find((opt) => opt.value === selectedPeriod);
    return option?.label || '일별';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-md text-muted-foreground">랭킹 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen p-4">
        <p className="text-lg text-red-500">오류가 발생했습니다 - {error}</p>
        <Button
          onClick={() => {
            setError(null);
            fetchRankings(selectedPeriod, selectedCategory === 'Random' ? undefined : selectedCategory);
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
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🏆 방문 랭킹</h1>
          <p className="text-gray-600">{getPeriodLabel()} 인기 맛집을 확인해보세요</p>
        </div>
      </header>

      <div className="mb-6">
        <div className="flex justify-center gap-2">
          {PERIOD_OPTIONS.map((option) => {
            const IconComponent = option.icon;
            return (
              <Button
                key={option.value}
                variant={selectedPeriod === option.value ? 'default' : 'outline'}
                onClick={() => setSelectedPeriod(option.value)}
                className="flex items-center gap-2"
              >
                <IconComponent className="w-4 h-4" />
                {option.label}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="mb-8">
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
                    <div className="flex-1 min-w-0">
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

                          <div className="flex items-center mt-2">
                            <div className="flex items-center gap-2">
                              {restaurant.avg_score > 0 && (
                                <>
                                  <RatingDisplay rating={Math.round(restaurant.avg_score)} size="sm" />
                                  <span className="text-sm text-gray-600">{restaurant.avg_score.toFixed(1)}</span>
                                </>
                              )}
                            </div>

                            <div className="text-xs text-gray-500">
                              <span>
                                누적 방문 {restaurant.visit_count.toLocaleString()}회 • 리뷰 {restaurant.review_count}개
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0 text-center">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        <span className="text-2xl font-bold text-blue-600">
                          {restaurant.period_visit_count.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{getPeriodLabel()} 방문</p>
                    </div>
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
