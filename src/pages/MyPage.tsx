import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router';
import { User, BadgeCheck, MessageSquare, LogOut, Calendar, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RatingDisplay } from '@/components/ui/rating-display';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { GoogleLoginButton } from '@/components/GoogleLoginButton';
import { VisitTimeline } from '@/components/VisitTimeline';
import { useAuth } from '@/contexts/AuthContext';
import type { MyReviewsResponse, MyReview } from '@/types/review';
import type { Restaurant } from '@/types/restaurant';
import type { VisitsResponse, VisitWithRestaurant } from '@/types/visit';

type TabType = 'reviews' | 'visits';

export default function MyPage() {
  const { user, isLoggedIn, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('reviews');

  const [reviews, setReviews] = useState<MyReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [visits, setVisits] = useState<VisitWithRestaurant[]>([]);
  const [visitsLoading, setVisitsLoading] = useState(false);
  const [visitsError, setVisitsError] = useState<string | null>(null);
  const [visitsCurrentPage, setVisitsCurrentPage] = useState(1);
  const [visitsTotalCount, setVisitsTotalCount] = useState(0);
  const [visitsHasMore, setVisitsHasMore] = useState(true);

  const [reviewsLoaded, setReviewsLoaded] = useState(false);
  const [visitsLoaded, setVisitsLoaded] = useState(false);

  const restaurantCache = useRef<Record<number, Restaurant>>({});

  const fetchRestaurantInfo = useCallback(async (restaurantId: number) => {
    if (restaurantCache.current[restaurantId]) return restaurantCache.current[restaurantId];

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/restaurants/${restaurantId}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const restaurant: Restaurant = await response.json();
        restaurantCache.current[restaurantId] = restaurant;
        return restaurant;
      }
    } catch (error) {
      console.error(`Failed to fetch restaurant ${restaurantId}:`, error);
    }
    return null;
  }, []);

  const fetchVisits = useCallback(
    async (page: number, append = false) => {
      setVisitsLoading(true);
      setVisitsError(null);

      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/me/visits?page=${page}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`방문 기록을 불러오는 데 실패했습니다: ${response.status}`);
        }

        const data: VisitsResponse = await response.json();

        const visitsWithRestaurant: VisitWithRestaurant[] = await Promise.all(
          data.visits.map(async (visit) => {
            const restaurant = await fetchRestaurantInfo(visit.restaurant_id);
            return {
              ...visit,
              restaurant_name: restaurant?.name,
              restaurant_category: restaurant?.category,
              restaurant_address: restaurant?.address,
            };
          })
        );

        if (append) {
          setVisits((prev) => [...prev, ...visitsWithRestaurant]);
        } else {
          setVisits(visitsWithRestaurant);
        }

        setVisitsTotalCount(data.total_count);
        setVisitsHasMore(page < data.total_pages);
        setVisitsLoaded(true);
      } catch (err) {
        setVisitsError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setVisitsLoading(false);
      }
    },
    [fetchRestaurantInfo]
  );

  const loadMoreVisits = () => {
    if (visitsHasMore && !visitsLoading) {
      const nextPage = visitsCurrentPage + 1;
      setVisitsCurrentPage(nextPage);
      fetchVisits(nextPage, true);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchMyReviews = async () => {
      setReviewsLoading(true);
      setReviewsError(null);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/me/reviews?page=${currentPage}`, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error(`리뷰를 불러오는 데 실패했습니다: ${response.status}`);
        }
        const data: MyReviewsResponse = await response.json();
        setReviews(data.reviews);
        setTotalPages(data.total_pages);
        setTotalCount(data.total_count);
        setReviewsLoaded(true);

        const missingRestaurantIds = data.reviews
          .map((review) => review.restaurant_id)
          .filter((id) => !restaurantCache.current[id]);
        if (missingRestaurantIds.length > 0) {
          await Promise.all(missingRestaurantIds.map((id) => fetchRestaurantInfo(id)));
        }
      } catch (err) {
        setReviewsError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setReviewsLoading(false);
      }
    };

    if (activeTab === 'reviews' && !reviewsLoaded) {
      fetchMyReviews();
    } else if (activeTab === 'visits' && !visitsLoaded) {
      fetchVisits(1);
    }
  }, [isLoggedIn, currentPage, activeTab, reviewsLoaded, visitsLoaded, fetchVisits, fetchRestaurantInfo]);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.reload();
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
                {user ? (
                  user.user_login_id ? (
                    <div className="flex items-center space-x-1">
                      <span className="text-lg font-semibold">{user.user_name}</span>
                      <Tooltip>
                        <TooltipTrigger>
                          <BadgeCheck className="size-5 fill-[#0066b3] text-white" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>아주대생 인증</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  ) : (
                    <span className="text-lg font-semibold">{user.user_name}</span>
                  )
                ) : (
                  <span className="text-lg font-semibold">익명의 아주대생</span>
                )}
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

      {isLoggedIn ? (
        <div className="space-y-3">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'reviews' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageSquare className="w-4 h-4 mr-2" />내 리뷰
            </button>
            <button
              onClick={() => setActiveTab('visits')}
              className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'visits' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="w-4 h-4 mr-2" />
              방문 기록
            </button>
          </div>

          {activeTab === 'reviews' ? (
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
                      const restaurant = restaurantCache.current[review.restaurant_id];
                      return (
                        <div key={review.review_id} className="border-b border-gray-100 last:border-b-0 pb-6 last:pb-0">
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

                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <RatingDisplay rating={review.score} size="sm" />
                              <div className="flex items-center text-xs text-gray-500">
                                <Calendar className="w-3 h-3 mr-1" />
                                {formatDate(review.created_at)}
                              </div>
                            </div>
                          </div>

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
            <VisitTimeline
              className="shadow-lg"
              visits={visits}
              loading={visitsLoading}
              error={visitsError}
              totalCount={visitsTotalCount}
              hasMore={visitsHasMore}
              onLoadMore={loadMoreVisits}
            />
          )}
        </div>
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
