import { useState } from 'react';
import { Link } from 'react-router';
import { Dices, Sparkles, MapPin, Phone, Utensils, Star, TrendingUp, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { AIRecommendationRequest, RestaurantRecommendation, FoodCategory } from '@/types/restaurant';
import { FOOD_CATEGORIES } from '@/types/restaurant';

const review = ['❓', '😡', '😐', '👍', '👍👍', '👍👍👍'];

const EXAMPLE_SITUATIONS = [
  '친구와 함께 시험 끝나고 맛있는 걸 먹고 싶어요',
  '혼자서 간단하게 점심을 먹고 싶어요',
  '데이트하기 좋은 분위기 있는 곳을 찾고 있어요',
  '가족과 함께 저녁식사를 하려고 해요',
  '술 한잔하면서 안주를 먹고 싶어요',
  '달콤한 디저트와 커피가 마시고 싶어요',
];

export default function Recommend() {
  const [situation, setSituation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | '랜덤'>('랜덤');
  const [recommendations, setRecommendations] = useState<RestaurantRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!situation.trim()) {
      toast.error('상황을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    setRecommendations([]);
    setHasSearched(true);

    try {
      const requestBody: AIRecommendationRequest = {
        situation: situation.trim(),
        ...(selectedCategory !== '랜덤' && { category: selectedCategory }),
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/restaurants/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `추천을 받아오는 데 실패했습니다: ${response.status}`);
      }

      const data = await response.json();
      setRecommendations(Array.isArray(data) ? data : []);
      toast.success('AI 추천이 완료되었습니다!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Dices className="w-8 h-8 text-purple-500" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI 메뉴 추천
          </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          당신의 상황과 기분을 알려주세요. AI가 완벽한 맛집을 추천해드립니다.
        </p>
      </div>

      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold flex items-center gap-2">
            <Dices className="w-6 h-6 text-purple-500" />
            어떤 맛집을 추천해드릴까요?
          </CardTitle>
          <CardDescription>
            현재 상황, 기분, 함께하는 사람 등을 자세히 설명해주시면 더 정확한 추천을 받을 수 있어요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="situation" className="inline-block mb-2 text-sm font-medium text-gray-700">
                상황 설명
              </label>
              <Textarea
                id="situation"
                placeholder="예: 친구와 함께 시험 끝나고 맛있는 걸 먹고 싶어요"
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                className="min-h-[100px] resize-none"
                disabled={loading}
              />

              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-2">💡 예시 상황을 클릭해보세요.</p>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLE_SITUATIONS.map((example, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSituation(example)}
                      disabled={loading}
                      className="text-xs h-auto py-1 px-2 whitespace-normal text-left"
                    >
                      {example}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 mb-2">선호 카테고리</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={selectedCategory === '랜덤' ? 'default' : 'outline'}
                  size="sm"
                  className={`whitespace-nowrap ${
                    selectedCategory === '랜덤' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                  }`}
                  onClick={() => setSelectedCategory('랜덤')}
                  disabled={loading}
                >
                  랜덤
                </Button>
                {FOOD_CATEGORIES.map((category) => (
                  <Button
                    key={category}
                    type="button"
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    className={`whitespace-nowrap ${
                      selectedCategory === category ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                    }`}
                    onClick={() => setSelectedCategory(category)}
                    disabled={loading}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-md"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  AI가 추천을 생성하고 있어요...
                </>
              ) : (
                <>
                  <Sparkles />
                  AI 추천 받기
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* No Results Message */}
      {hasSearched && !loading && recommendations.length === 0 && !error && (
        <Card className="mb-8 border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-700 text-center">
              <span className="text-2xl">🤔</span>
              <div>
                <p className="font-medium">추천 결과가 없습니다</p>
                <p className="text-sm text-yellow-600 mt-1">다른 상황이나 카테고리로 다시 시도해보세요.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">AI 추천 결과</h2>
            <p className="text-gray-600">당신을 위한 맞춤 맛집 추천이에요!</p>
          </div>

          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
            {recommendations.map((restaurant, index) => (
              <Card key={restaurant.restaurant_id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge
                          variant="outline"
                          className="text-lg px-3 py-1 font-bold bg-gradient-to-r from-purple-100 to-pink-100"
                        >
                          #{index + 1}
                        </Badge>
                        <CardTitle className="text-2xl font-bold text-gray-800">
                          <Link
                            to={`/restaurant/${restaurant.restaurant_id}`}
                            className="hover:text-purple-600 transition-colors"
                          >
                            {restaurant.name}
                          </Link>
                        </CardTitle>
                      </div>
                      <CardDescription className="text-lg text-gray-600 mb-3">{restaurant.category}</CardDescription>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge variant="outline" className="text-xl p-2 px-4 font-bold">
                        {review[Math.round(restaurant.avg_score)]}{' '}
                        <span className="ml-2 text-yellow-500">{restaurant.avg_score}</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* AI Recommendation Reason */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-purple-800 mb-1">AI 추천 이유</h4>
                        <p className="text-gray-700 leading-relaxed">{restaurant.recommendation_reason}</p>
                      </div>
                    </div>
                  </div>

                  {/* Restaurant Info */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-700">
                        <MapPin className="w-5 h-5 mr-3 text-blue-500" />
                        <span className="text-sm">{restaurant.address}</span>
                      </div>
                      {restaurant.phone && (
                        <div className="flex items-center text-gray-700">
                          <Phone className="w-5 h-5 mr-3 text-green-500" />
                          <span className="text-sm">{restaurant.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center text-gray-700">
                        <Utensils className="w-5 h-5 mr-3 text-orange-500" />
                        <span className="text-sm">{restaurant.category}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          리뷰 수
                        </span>
                        <span className="font-semibold text-blue-600">{restaurant.review_count}개</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <Users className="w-4 h-4" />총 방문
                        </span>
                        <span className="font-semibold text-green-600">{restaurant.visit_count}회</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          이달 방문
                        </span>
                        <span className="font-semibold text-purple-600">{restaurant.monthly_visits}회</span>
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    {restaurant.local_currency && <Badge variant="secondary">지역화폐 가능</Badge>}
                    {restaurant.goodness && <Badge variant="secondary">모범음식점</Badge>}
                    {restaurant.kind_price && <Badge variant="secondary">착한가격업소</Badge>}
                  </div>

                  <Separator />

                  {/* Action Button */}
                  <div className="flex justify-end">
                    <Button asChild variant="outline">
                      <Link to={`/restaurant/${restaurant.restaurant_id}`}>자세히 보기</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
