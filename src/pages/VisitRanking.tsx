import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";

interface Restaurant {
  restaurant_id: number;
  name: string;
  address: string;
  phone: string;
  category: string;
  lat: string;
  lng: string;
  local_currency: boolean;
  goodness: boolean;
  kind_price: boolean;
  review_count: number;
  visit_count: number;
  restaurant_score: number;
}

interface ApiResponse {
  total_count: number;
  total_pages: number;
  current_page: number;
  items_per_page: number;
  restaurants: Restaurant[];
}

export default function VisitRanking() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const observer = useRef<IntersectionObserver | null>(null);

  const lastRestaurantElementRef = useCallback(
    (node: HTMLLIElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setCurrentPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const fetchRankings = useCallback(async (pageToFetch: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/restaurants?page=${pageToFetch}`);
      if (!response.ok) {
        throw new Error(`${response.status} Error`);
      }
      const data: ApiResponse = await response.json();

      setRestaurants((prevRestaurants) => {
        const newRestaurants = data.restaurants.filter(
          (newRest) => !prevRestaurants.some((prevRest) => prevRest.restaurant_id === newRest.restaurant_id)
        );
        return pageToFetch === 1 ? data.restaurants : [...prevRestaurants, ...newRestaurants];
      });

      setHasMore(data.current_page < data.total_pages);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("데이터를 불러오는 중 알 수 없는 오류가 발생했습니다.");
      }
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasMore || currentPage === 1) {
      fetchRankings(currentPage);
    }
  }, [currentPage, fetchRankings, hasMore]);

  if (restaurants.length === 0 && loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-md text-muted-foreground">랭킹 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error && restaurants.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-screen p-4">
        <p className="text-lg text-red-500">오류가 발생했습니다 - {error}</p>
        <Button
          onClick={() => {
            setCurrentPage(1);
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
    <div className="container mx-auto p-4">
      <header className="mb-6 pt-4">
        <h1 className="text-3xl font-bold text-center text-gray-800">방문 랭킹</h1>
      </header>
      {restaurants.length === 0 && !loading && !error ? (
        <div className="text-center text-gray-500 mt-10">
          <p>랭킹 정보가 없습니다.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {restaurants.map((restaurant, index) => (
            <li
              ref={restaurants.length === index + 1 ? lastRestaurantElementRef : null}
              key={restaurant.restaurant_id}
              className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                <div className="mb-2 sm:mb-0">
                  <h2 className="text-xl font-semibold text-primary">
                    <span className="text-gray-500 mr-2">{index + 1}위</span>
                    {restaurant.name}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">{restaurant.address}</p>
                  <p className="text-xs text-gray-500 mt-1">{restaurant.category}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-medium text-blue-600">
                    {restaurant.visit_count.toLocaleString()}회 방문
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {loading && restaurants.length > 0 && (
        <div className="flex justify-center items-center py-8">
          <p className="text-sm text-muted-foreground">더 많은 맛집을 불러오는 중...</p>
        </div>
      )}
      {!error && !loading && !hasMore && restaurants.length > 0 && (
        <div className="text-center text-gray-500 py-8">
          <p>모든 맛집 정보를 불러왔습니다.</p>
        </div>
      )}
      {error && restaurants.length > 0 && (
        <div className="text-center text-red-500 py-8">
          <p>추가 데이터를 불러오는 중 오류가 발생했습니다 - {error}</p>
          <Button
            onClick={() => {
              setError(null);
              setHasMore(true);
            }}
            variant="secondary"
            className="mt-2"
          >
            재시도
          </Button>
        </div>
      )}
    </div>
  );
}
