import { useState, useEffect } from 'react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';
import { Phone, MapPin, Utensils, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { RatingDisplay } from '@/components/ui/rating-display';
import { ReviewForm } from '@/components/ReviewForm';
import { ReviewList } from '@/components/ReviewList';
import { MenuList } from '@/components/MenuList';
import type { RestaurantDetail } from '@/types/restaurant';

export default function RestaurantDetail({ restaurantId }: { restaurantId: string }) {
  const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisiting, setIsVisiting] = useState(false);
  const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!restaurantId) return;

    fetch(`${import.meta.env.VITE_API_BASE_URL}/restaurants/${restaurantId}`, {
      credentials: 'include',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`데이터를 불러오는 데 실패했습니다: ${response.status}`);
        }
        return response.json();
      })
      .then((data: RestaurantDetail) => {
        setRestaurant(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [restaurantId]);

  const handleVisit = async () => {
    if (!restaurant) return;
    setIsVisiting(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/restaurants/${restaurant.restaurant_id}/visit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        if (response.status === 400) {
          toast.error('오늘 이미 방문한 식당입니다');
          return;
        }

        throw new Error(`${response.status}`);
      }

      toast.success('방문 기록이 저장되었습니다!');
      setRestaurant((prevRestaurant: RestaurantDetail | null) => {
        if (!prevRestaurant) return null;
        return { ...prevRestaurant, visit_count: prevRestaurant.visit_count + 1 };
      });
    } catch (err) {
      if (err instanceof Error) {
        console.error('Visit error:', err.message);
      } else {
        console.error('An unknown error occurred during visit:', err);
      }
    } finally {
      setIsVisiting(false);
    }
  };

  const handleReviewSubmitted = () => {
    setReviewRefreshTrigger((prev) => prev + 1);

    fetch(`${import.meta.env.VITE_API_BASE_URL}/restaurants/${restaurantId}`, {
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data: RestaurantDetail) => {
        setRestaurant(data);
      })
      .catch((err) => {
        console.error('식당 정보를 받아올 수 없습니다', err);
      });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-lg text-muted-foreground">로딩중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-4xl font-bold">오류 발생</h1>
        <p className="mt-2 text-lg text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-4xl font-bold">오류 발생</h1>
        <p className="mt-2 text-lg">식당 정보를 찾을 수 없습니다</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl overflow-y-auto">
      <Card className="mb-6 shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <CardTitle className="text-3xl md:text-4xl font-bold text-gray-800">{restaurant.name}</CardTitle>
              <CardDescription className="text-lg text-gray-600 mt-1">{restaurant.category}</CardDescription>
            </div>
            <RatingDisplay size="lg" rating={Math.round(restaurant.avg_score)} className="mt-3 md:mt-0" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-gray-700">
            <div className="flex items-center">
              <MapPin className="w-5 h-5 mr-3 text-blue-500" />
              <span>{restaurant.address}</span>
            </div>
            {restaurant.phone && (
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-green-500" />
                <span>{restaurant.phone}</span>
              </div>
            )}
            <div className="flex items-center">
              <Utensils className="w-5 h-5 mr-3 text-orange-500" />
              <span>{restaurant.category}</span>
            </div>
          </div>
          <div className="mt-4 flex space-x-4">
            {restaurant.local_currency && <Badge variant="secondary">지역화폐 가능</Badge>}
            {restaurant.goodness && <Badge variant="secondary">모범음식점</Badge>}
            {restaurant.kind_price && <Badge variant="secondary">착한가격업소</Badge>}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">위치</CardTitle>
          </CardHeader>
          <CardContent>
            <Map
              center={{ lat: parseFloat(restaurant.lat), lng: parseFloat(restaurant.lng) }}
              className="w-full h-64 rounded-md"
              level={3}
            >
              <MapMarker position={{ lat: parseFloat(restaurant.lat), lng: parseFloat(restaurant.lng) }}>
                <div className="p-2 text-xs text-center">{restaurant.name}</div>
              </MapMarker>
            </Map>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">통계</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">리뷰 수</span>
              <span className="font-semibold text-blue-600">{restaurant.review_count}개</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-gray-700">방문 횟수</span>
              <span className="font-semibold text-green-600">{restaurant.visit_count}회</span>
            </div>
            <Button onClick={handleVisit} disabled={isVisiting} className="w-full mt-4 bg-green-500 hover:bg-green-600">
              <CheckCircle />
              {isVisiting ? '처리 중...' : '방문했어요'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <MenuList menus={restaurant.menus} />

        <ReviewList
          restaurantId={restaurant.restaurant_id}
          refreshTrigger={reviewRefreshTrigger}
          oneLineComment={restaurant.one_line_comment}
        />

        <ReviewForm restaurantId={restaurant.restaurant_id} onReviewSubmitted={handleReviewSubmitted} />
      </div>
    </div>
  );
}
