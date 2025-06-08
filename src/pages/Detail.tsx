import { useParams } from 'react-router';
import RestaurantDetail from '@/components/RestaurantDetail';

export default function Detail() {
  const { id } = useParams();

  if (!id) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-4xl font-bold">오류 발생</h1>
        <p className="mt-2 text-lg">식당 정보를 찾을 수 없습니다</p>
      </div>
    );
  }

  return <RestaurantDetail restaurantId={id} />;
}
