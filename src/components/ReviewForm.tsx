import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RatingSelector } from '@/components/ui/rating-selector';
import type { ReviewFormData } from '@/types/review';

interface ReviewFormProps {
  restaurantId: number;
  onReviewSubmitted: () => void;
}

export function ReviewForm({ restaurantId, onReviewSubmitted }: ReviewFormProps) {
  const [formData, setFormData] = useState<ReviewFormData>({
    score: 0,
    comment: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.score === 0) {
      setError('평점을 선택해주세요.');
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">리뷰 작성</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">평점</label>
            <RatingSelector
              rating={formData.score}
              onRatingChange={(score) => setFormData((prev) => ({ ...prev, score }))}
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
            disabled={isSubmitting || formData.score === 0 || formData.comment.trim().length === 0}
            className="w-full"
          >
            {isSubmitting && <Loader2 className="animate-spin" />}
            리뷰 작성
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
