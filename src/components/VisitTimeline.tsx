import { Link } from 'react-router';
import { Calendar, MapPin, Clock, ChevronDown, Utensils } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { VisitWithRestaurant } from '@/types/visit';

interface VisitTimelineProps {
  className?: string;
  visits: VisitWithRestaurant[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  hasMore: boolean;
  onLoadMore: () => void;
}

interface GroupedVisits {
  [date: string]: VisitWithRestaurant[];
}

export function VisitTimeline({
  className,
  visits,
  loading,
  error,
  totalCount,
  hasMore,
  onLoadMore,
}: VisitTimelineProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return '오늘';
    if (isYesterday) return '어제';

    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const groupVisitsByDate = (visits: VisitWithRestaurant[]): GroupedVisits => {
    return visits.reduce((groups, visit) => {
      const date = new Date(visit.created_at).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(visit);
      return groups;
    }, {} as GroupedVisits);
  };

  const groupedVisits = groupVisitsByDate(visits);
  const sortedDates = Object.keys(groupedVisits).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (loading && visits.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center">
            <Calendar className="w-6 h-6 mr-2 text-green-500" />
            방문 기록 타임라인
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <p className="text-gray-500">방문 기록을 불러오는 중...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center">
            <Calendar className="w-6 h-6 mr-2 text-green-500" />
            방문 기록 타임라인
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (visits.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center">
            <Calendar className="w-6 h-6 mr-2 text-green-500" />
            방문 기록 타임라인
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">아직 방문한 식당이 없습니다.</p>
            <Link to="/">
              <Button variant="outline">맛집 찾아보기</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center">
          <Calendar className="w-6 h-6 mr-2 text-green-500" />
          방문 기록 타임라인 ({totalCount})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedDates.map((dateKey) => (
          <div key={dateKey} className="relative">
            <div className="flex items-center gap-3 mb-2 relative">
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
                {formatDate(groupedVisits[dateKey][0].created_at)}
              </div>
              <div className="text-sm text-gray-500 font-medium">{groupedVisits[dateKey].length}곳 방문</div>
            </div>

            <div className="space-y-2 pb-6">
              {groupedVisits[dateKey].map((visit) => (
                <div key={visit.visit_id} className="relative flex items-start gap-4">
                  <div className="flex-1">
                    {visit.restaurant_name ? (
                      <Link
                        to={`/restaurant/${visit.restaurant_id}`}
                        className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200"
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{visit.restaurant_name}</h3>
                          <div className="flex items-center text-sm text-gray-500 flex-shrink-0 gap-1">
                            <Clock className="w-4 h-4" />
                            {formatTime(visit.created_at)}
                          </div>
                        </div>

                        <div className="space-y-2">
                          {visit.restaurant_category && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Utensils className="w-4 h-4 flex-shrink-0 text-gray-400" />
                              <span className="truncate">{visit.restaurant_category}</span>
                            </div>
                          )}
                          {visit.restaurant_address && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4 flex-shrink-0 text-gray-400" />
                              <span className="truncate">{visit.restaurant_address}</span>
                            </div>
                          )}
                        </div>
                      </Link>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <h3 className="text-lg font-medium text-gray-600">식당 정보 불러오는 중...</h3>
                          <div className="flex items-center text-sm text-gray-500 flex-shrink-0 gap-1">
                            <Clock className="w-4 h-4" />
                            {formatTime(visit.created_at)}
                          </div>
                        </div>

                        <div className="space-y-2">
                          {visit.restaurant_category && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Utensils className="w-4 h-4 flex-shrink-0 text-gray-400" />
                              <span className="truncate">{visit.restaurant_category}</span>
                            </div>
                          )}
                          {visit.restaurant_address && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4 flex-shrink-0 text-gray-400" />
                              <span className="truncate">{visit.restaurant_address}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {hasMore && (
          <div className="flex justify-center pt-6 border-t border-gray-100">
            <Button onClick={onLoadMore} disabled={loading} variant="outline" className="w-full max-w-sm">
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  불러오는 중...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ChevronDown className="w-4 h-4" />
                  더보기
                </div>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
