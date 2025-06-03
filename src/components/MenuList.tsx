import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Utensils } from 'lucide-react';
import type { Menu } from '@/types/menu';

interface MenuListProps {
  menus: Menu[];
}

export function MenuList({ menus }: MenuListProps) {
  const formatPrice = (price: number | null) => {
    if (price === null) {
      return '가격 정보 없음';
    }
    return `${price.toLocaleString()}원`;
  };

  if (menus.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center">
            <Utensils className="w-6 h-6 mr-2 text-orange-500" />
            메뉴
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500">등록된 메뉴가 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center">
          <Utensils className="w-6 h-6 mr-2 text-orange-500" />
          메뉴
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {menus.map((menu) => (
            <div
              key={menu.menu_key}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{menu.menu_name}</h4>
              </div>
              <div className="flex items-center space-x-2">
                {menu.price && (
                  <Badge variant="outline" className="text-sm font-semibold text-green-700 bg-green-50">
                    {formatPrice(menu.price)}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
