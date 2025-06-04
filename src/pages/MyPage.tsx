import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { User, MessageSquare, LogOut, Calendar, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StarRating } from '@/components/ui/star-rating';
import { GoogleLoginButton } from '@/components/GoogleLoginButton';
import { useAuth } from '@/contexts/AuthContext';
import type { MyReviewsResponse, MyReview } from '@/types/review';
import type { Restaurant } from '@/types/restaurant';

export default function MyPage() {
  const { user, isLoggedIn, logout } = useAuth();
  const [reviews, setReviews] = useState<MyReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [restaurantCache, setRestaurantCache] = useState<Record<number, Restaurant>>({});

  const fetchRestaurantInfo = useCallback(
    async (restaurantId: number) => {
      if (restaurantCache[restaurantId]) return restaurantCache[restaurantId];

      try {
        const response = await fetch(`/api/restaurants/${restaurantId}`);
        if (response.ok) {
          const restaurant: Restaurant = await response.json();
          setRestaurantCache((prev) => ({ ...prev, [restaurantId]: restaurant }));
          return restaurant;
        }
      } catch (error) {
        console.error(`Failed to fetch restaurant ${restaurantId}:`, error);
      }
      return null;
    },
    [restaurantCache]
  );

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchMyReviews = async () => {
      try {
        setReviewsLoading(true);
        setReviewsError(null);

        const response = await fetch(`/api/users/me/reviews?page=${currentPage}`);

        if (!response.ok) {
          throw new Error(`리뷰를 불러오는 데 실패했습니다: ${response.status}`);
        }

        const data: MyReviewsResponse = await response.json();
        setReviews(data.reviews);
        setTotalPages(data.total_pages);
        setTotalCount(data.total_count);

        data.reviews.forEach((review) => {
          fetchRestaurantInfo(review.restaurant_id);
        });
      } catch (err) {
        setReviewsError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchMyReviews();
  }, [isLoggedIn, currentPage, fetchRestaurantInfo]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      <Card className="mb-6 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            <User className="w-6 h-6 mr-2 text-blue-500" />내 정보
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{user ? user.user_name : `익명의 아주대생`}</h3>
                {isLoggedIn && user && <p className="text-gray-600">@{user.user_login_id}</p>}
              </div>
              {isLoggedIn && (
                <Button onClick={handleLogout} variant="outline" size="sm">
                  <LogOut className="w-4 h-4 mr-1" />
                  로그아웃
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 내 리뷰 목록 */}
      {isLoggedIn ? (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center">
              <MessageSquare className="w-6 h-6 mr-2 text-indigo-500" />
              내가 작성한 리뷰 ({totalCount})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reviewsLoading ? (
              <div className="flex justify-center py-8">
                <p className="text-gray-500">리뷰를 불러오는 중...</p>
              </div>
            ) : reviewsError ? (
              <div className="flex justify-center py-8">
                <p className="text-red-500">{reviewsError}</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">아직 작성한 리뷰가 없습니다.</p>
                <Link to="/">
                  <Button variant="outline">맛집 찾아보기</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => {
                  const restaurant = restaurantCache[review.restaurant_id];
                  return (
                    <div key={review.review_id} className="border-b border-gray-100 last:border-b-0 pb-6 last:pb-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <StarRating rating={review.score} readonly size="sm" />
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(review.created_at)}
                          </div>
                        </div>
                      </div>

                      {restaurant && (
                        <div className="mb-3">
                          <Link to={`/restaurant/${review.restaurant_id}`}>
                            <div className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors">
                              <MapPin className="w-4 h-4" />
                              <span className="font-medium">{restaurant.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {restaurant.category}
                              </Badge>
                            </div>
                          </Link>
                        </div>
                      )}

                      <p className="text-gray-700 leading-relaxed mb-3">{review.comment}</p>
                    </div>
                  );
                })}

                {totalPages > 1 && (
                  <div className="flex justify-center space-x-2 pt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      이전
                    </Button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      다음
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold mb-2">로그인이 필요합니다</h3>
              <p className="text-gray-500 mb-6">내가 작성한 리뷰를 확인하려면 로그인해주세요.</p>
              <GoogleLoginButton size="lg">아주대 구글 계정으로 로그인</GoogleLoginButton>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
