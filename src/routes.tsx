import { Routes, Route } from 'react-router';
import Root from '@/pages/Root';
import Home from '@/pages/Home';
import NotFound from '@/pages/NotFound';
import RestaurantDetail from '@/pages/RestaurantDetail';
import VisitRanking from '@/pages/VisitRanking';
import Recommend from '@/pages/Recommend';
import MyPage from '@/pages/MyPage';
import AuthCallback from '@/pages/AuthCallback';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Root />}>
        <Route index element={<Home />} />
        <Route path="restaurant/:id" element={<RestaurantDetail />} />
        <Route path="ranking" element={<VisitRanking />} />
        <Route path="recommend" element={<Recommend />} />
        <Route path="mypage" element={<MyPage />} />

        <Route path="auth/google" element={<AuthCallback />} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
