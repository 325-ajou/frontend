import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { Map, CustomOverlayMap, MapMarker } from 'react-kakao-maps-sdk';
import { Search, Locate, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { useDebounce } from '@/hooks/useDebounce';
import { FOOD_CATEGORIES } from '@/types/restaurant';
import type { Restaurant, RestaurantsResponse, FoodCategory } from '@/types/restaurant';
import RestaurantDetail from '@/components/RestaurantDetail';
import logo from '@/assets/logo.png';

const review = ['❓', '😡', '😐', '👍', '👍👍', '👍👍👍'];

interface MapBounds {
  ne_lat: number;
  ne_lng: number;
  sw_lat: number;
  sw_lng: number;
}

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [hoveredRestaurant, setHoveredRestaurant] = useState<Restaurant | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | null>(null);
  const [mapBounds, setMapBounds] = useState<MapBounds>({
    ne_lat: 37.280320141059896,
    ne_lng: 127.04707734473452,
    sw_lat: 37.27492533638723,
    sw_lng: 127.0405230907576,
  });
  const [mapCenter, setMapCenter] = useState({ lat: 37.278431, lng: 127.043809 });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);

  const debouncedMapBounds = useDebounce(mapBounds, 500);

  const handleRestaurantClick = (restaurantId: number) => {
    setSelectedRestaurantId(restaurantId.toString());
    setIsDrawerOpen(true);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('이 브라우저에서는 위치 서비스를 지원하지 않습니다.');
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { lat: latitude, lng: longitude };

        setUserLocation(newLocation);
        setMapCenter(newLocation);

        if (mapRef.current) {
          const moveLatLon = new kakao.maps.LatLng(latitude, longitude);
          mapRef.current.setCenter(moveLatLon);
        }

        setIsGettingLocation(false);
        toast.success('현재 위치로 이동했습니다.');
      },
      (error) => {
        setIsGettingLocation(false);
        let errorMessage = '위치를 가져올 수 없습니다.';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '위치 접근 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '위치 정보를 사용할 수 없습니다.';
            break;
          case error.TIMEOUT:
            errorMessage = '위치 요청 시간이 초과되었습니다.';
            break;
        }

        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  useEffect(() => {
    const params = new URLSearchParams({
      ne_lat: debouncedMapBounds.ne_lat.toString(),
      ne_lng: debouncedMapBounds.ne_lng.toString(),
      sw_lat: debouncedMapBounds.sw_lat.toString(),
      sw_lng: debouncedMapBounds.sw_lng.toString(),
    });

    if (selectedCategory) {
      params.append('category', selectedCategory);
    }

    fetch(`${import.meta.env.VITE_API_BASE_URL}/restaurants?${params}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`${response.status} Error`);
        }
        return response.json();
      })
      .then(({ restaurants }: RestaurantsResponse) => {
        setRestaurants(restaurants);
      })
      .catch((error) => {
        console.error('Failed to fetch restaurants by bounds:', error);
      });
  }, [debouncedMapBounds, selectedCategory]);

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="w-full flex justify-center items-center">
          <Link to="/">
            <img src={logo} alt="아주한끼 로고" className="h-14" />
          </Link>
        </div>
        <div className="flex w-full items-center space-x-2 px-3 pb-2">
          <Input type="text" placeholder="검색..." className="w-full" />
          <Button type="submit" variant="secondary">
            <Search />
          </Button>
        </div>

        <div className="px-3 pb-2">
          <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
            {FOOD_CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                className={`whitespace-nowrap ${
                  selectedCategory === category ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                }`}
                onClick={() => setSelectedCategory((prev) => (prev === category ? null : category))}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <Map
          center={mapCenter}
          className="flex flex-col flex-grow items-center justify-center bg-gray-100"
          onCreate={(map) => {
            mapRef.current = map;
          }}
          onBoundsChanged={(map) => {
            const bounds = map.getBounds();
            const sw = bounds.getSouthWest();
            const ne = bounds.getNorthEast();

            setMapBounds({
              ne_lat: ne.getLat(),
              ne_lng: ne.getLng(),
              sw_lat: sw.getLat(),
              sw_lng: sw.getLng(),
            });
          }}
        >
          {restaurants.map((restaurant) => (
            <CustomOverlayMap
              key={restaurant.restaurant_id}
              position={{ lat: parseFloat(restaurant.lat), lng: parseFloat(restaurant.lng) }}
            >
              <Badge
                variant="default"
                className="text-lg rounded-2xl cursor-pointer"
                onMouseOver={() => setHoveredRestaurant(restaurant)}
                onMouseOut={() => setHoveredRestaurant(null)}
                onClick={() => handleRestaurantClick(restaurant.restaurant_id)}
              >
                {review[Math.round(restaurant.avg_score)]}
              </Badge>
            </CustomOverlayMap>
          ))}

          {userLocation && (
            <MapMarker
              position={userLocation}
              image={{
                src:
                  'data:image/svg+xml;base64,' +
                  btoa(`
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#4285F4" stroke="#fff" stroke-width="3"/>
                  </svg>
                `),
                size: { width: 24, height: 24 },
              }}
            ></MapMarker>
          )}
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

        <Button
          onClick={handleGetCurrentLocation}
          disabled={isGettingLocation}
          className="fixed bottom-20 right-4 z-10 w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
        >
          {isGettingLocation ? <Loader2 className="size-5 animate-spin" /> : <Locate className="size-6" />}
        </Button>
      </div>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          {selectedRestaurantId && <RestaurantDetail restaurantId={selectedRestaurantId} />}
        </DrawerContent>
      </Drawer>
    </>
  );
}
