import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from '@/components/ui/star-rating';
import { useAuth } from '@/contexts/AuthContext';
import type { ReviewFormData } from '@/types/review';

interface ReviewFormProps {
  restaurantId: number;
  onReviewSubmitted: () => void;
}

export function ReviewForm({ restaurantId, onReviewSubmitted }: ReviewFormProps) {
  const { isLoggedIn } = useAuth();
  const [formData, setFormData] = useState<ReviewFormData>({
    score: 0,
    comment: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn) {
      setError('로그인이 필요합니다.');
      return;
    }

    if (formData.score === 0) {
      setError('별점을 선택해주세요.');
      return;
    }

    if (formData.comment.trim().length < 5) {
      setError('리뷰는 최소 5자 이상 작성해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/restaurants/${restaurantId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `리뷰 작성에 실패했습니다: ${response.status}`);
      }

      setFormData({ score: 0, comment: '' });
      onReviewSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">
            리뷰를 작성하려면{' '}
            <a href="/login" className="text-blue-500 hover:underline">
              로그인
            </a>
            이 필요합니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">리뷰 작성</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">별점</label>
            <StarRating
              rating={formData.score}
              onRatingChange={(score) => setFormData((prev) => ({ ...prev, score }))}
              size="lg"
            />
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              리뷰 내용
            </label>
            <Textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData((prev) => ({ ...prev, comment: e.target.value }))}
              placeholder="이 식당에 대한 솔직한 리뷰를 작성해주세요!"
              className="resize-none"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.comment.length}/500자</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || formData.score === 0 || formData.comment.trim().length < 5}
            className="w-full"
          >
            {isSubmitting ? '작성 중...' : '리뷰 작성'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
