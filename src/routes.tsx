import { Routes, Route } from "react-router";
import Root from "@/pages/Root";
import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Root />}>
        <Route index element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
