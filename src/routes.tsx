import { Routes, Route } from 'react-router';
import Root from '@/pages/Root';
import Home from '@/pages/Home';
import NotFound from '@/pages/NotFound';
import RestaurantDetail from '@/pages/RestaurantDetail';
import VisitRanking from '@/pages/VisitRanking';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Root />}>
        <Route index element={<Home />} />
        <Route path="restaurant/:id" element={<RestaurantDetail />} />
        <Route path="ranking" element={<VisitRanking />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
