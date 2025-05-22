import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Map, CustomOverlayMap } from 'react-kakao-maps-sdk';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Restaurant {
  restaurant_id: number;
  name: string;
  address: string;
  phone?: string;
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

const review = ['😡', '😐', '👍', '👍👍', '👍👍👍'];

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [hoveredRestaurant, setHoveredRestaurant] = useState<Restaurant | null>(null);

  useEffect(() => {
    fetch(`/api/restaurants?page=1`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`${response.status} Error`);
        }
        return response.json();
      })
      .then((data: ApiResponse) => {
        setRestaurants(data.restaurants);
      });
  }, []);

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex w-full items-center space-x-2 px-3 py-2">
          <Input type="text" placeholder="검색..." className="w-full" />
          <Button type="submit" variant="secondary">
            <Search />
          </Button>
        </div>
        <Map
          center={{ lat: 37.278431, lng: 127.043809 }}
          className="flex flex-col flex-grow items-center justify-center bg-gray-100"
        >
          {restaurants.map((restaurant) => (
            <CustomOverlayMap
              key={restaurant.restaurant_id}
              position={{ lat: parseFloat(restaurant.lat), lng: parseFloat(restaurant.lng) }}
            >
              <Link to={`/restaurant/${restaurant.restaurant_id}`}>
                <Badge
                  variant="default"
                  className="text-lg rounded-2xl"
                  onMouseOver={() => setHoveredRestaurant(restaurant)}
                  onMouseOut={() => setHoveredRestaurant(null)}
                >
                  {review[restaurant.restaurant_score]}
                </Badge>
              </Link>
            </CustomOverlayMap>
          ))}
          {hoveredRestaurant && (
            <CustomOverlayMap
              position={{
                lat: parseFloat(hoveredRestaurant.lat),
                lng: parseFloat(hoveredRestaurant.lng),
              }}
              yAnchor={1}
            >
              <div className="p-3 bg-white rounded-md shadow-lg border border-gray-200 text-xs w-60">
                <h4 className="font-bold text-sm mb-1">{hoveredRestaurant.name}</h4>
                <p className="text-gray-700 mb-0.5 overflow-hidden text-ellipsis whitespace-nowrap">
                  <strong>카테고리:</strong> {hoveredRestaurant.category}
                </p>
                <p className="text-gray-700 mb-0.5 overflow-hidden text-ellipsis whitespace-nowrap">
                  <strong>주소:</strong> {hoveredRestaurant.address}
                </p>
                {hoveredRestaurant.phone && (
                  <p className="text-gray-700 overflow-hidden text-ellipsis whitespace-nowrap">
                    <strong>전화번호:</strong> {hoveredRestaurant.phone}
                  </p>
                )}
              </div>
            </CustomOverlayMap>
          )}
        </Map>
      </div>
    </>
  );
}
