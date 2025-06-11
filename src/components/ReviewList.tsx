import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Sparkles, BadgeCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RatingDisplay } from '@/components/ui/rating-display';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { Review, ReviewResponse } from '@/types/review';
import { isAnonymousUser } from '@/types/review';

interface ReviewListProps {
  restaurantId: number;
  refreshTrigger: number;
  oneLineComment: string;
}

export function ReviewList({ restaurantId, refreshTrigger, oneLineComment }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/restaurants/${restaurantId}/reviews`);

      if (!response.ok) {
        throw new Error(`리뷰를 불러오는 데 실패했습니다: ${response.status}`);
      }

      const data: ReviewResponse = await response.json();
      setReviews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews, refreshTrigger]);

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

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="mt-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-red-500">{error}</p>
          <Button onClick={fetchReviews} className="w-full mt-4" variant="outline">
            다시 시도
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center">
            <MessageSquare className="w-6 h-6 mr-2 text-indigo-500" />
            리뷰 ({reviews.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500">아직 작성된 리뷰가 없습니다. 첫 번째 리뷰를 작성해보세요!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center">
            <MessageSquare className="w-6 h-6 mr-2 text-indigo-500" />
            리뷰 ({reviews.length})
          </CardTitle>
          <div className="mt-3 p-4 rounded-lg border border-blue-100 bg-blue-50">
            <div className="flex items-start gap-2">
              <Sparkles className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-800 mb-1">AI 리뷰 요약</h4>
                <p className="text-gray-700 leading-relaxed">{oneLineComment}</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col space-y-6">
          {reviews.map((review) => (
            <div key={review.review_id}>
              <div className="flex justify-between mb-3">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mr-2 max-w-1/2">
                  <div className="flex items-center space-x-1">
                    <span
                      className={cn(
                        'font-medium text-nowrap',
                        isAnonymousUser(review.reviewer) ? 'text-gray-700' : 'text-gray-900'
                      )}
                    >
                      {review.reviewer}
                    </span>
                    {!isAnonymousUser(review.reviewer) && (
                      <Tooltip>
                        <TooltipTrigger>
                          <BadgeCheck className="size-5 fill-[#0066b3] text-white" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>아주대생 인증</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <RatingDisplay rating={review.score} size="sm" />
                </div>
                <span className="mt-1 text-xs text-gray-500">{formatDate(review.created_at)}</span>
              </div>
              <p className="text-gray-700 leading-relaxed">{review.comment}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
