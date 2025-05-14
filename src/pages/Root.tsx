import { Outlet, NavLink } from "react-router";
import { Map, ChartLine, Crown, Dices, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Root() {
  return (
    <>
      <Outlet />
      <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 w-full flex items-center justify-around bg-backgroud shadow-[0_-2px_4px_rgba(0,0,0,0.1)]">
        <NavLink
          to="/"
          className={({ isActive }) =>
            cn(
              isActive ? "text-primary" : "text-muted-foreground",
              "flex flex-col items-center justify-center gap-1 text-sm font-medium hover:text-primary focus:text-primary"
            )
          }
        >
          <Map className="h-6 w-6" />
          맛집 지도
        </NavLink>
        <NavLink
          to="/ranking"
          className={({ isActive }) =>
            cn(
              isActive ? "text-primary" : "text-muted-foreground",
              "flex flex-col items-center justify-center gap-1 text-sm font-medium hover:text-primary focus:text-primary"
            )
          }
        >
          <ChartLine className="h-6 w-6" />
          방문 랭킹
        </NavLink>
        <NavLink
          to="/guide"
          className={({ isActive }) =>
            cn(
              isActive ? "text-primary" : "text-muted-foreground",
              "flex flex-col items-center justify-center gap-1 text-sm font-medium hover:text-primary focus:text-primary"
            )
          }
        >
          <Crown className="h-6 w-6" />
          아슐랭 가이드
        </NavLink>
        <NavLink
          to="/recommend"
          className={({ isActive }) =>
            cn(
              isActive ? "text-primary" : "text-muted-foreground",
              "flex flex-col items-center justify-center gap-1 text-sm font-medium hover:text-primary focus:text-primary"
            )
          }
        >
          <Dices className="h-6 w-6" />
          메뉴 추천
        </NavLink>
        <NavLink
          to="/mypage"
          className={({ isActive }) =>
            cn(
              isActive ? "text-primary" : "text-muted-foreground",
              "flex flex-col items-center justify-center gap-1 text-sm font-medium hover:text-primary focus:text-primary"
            )
          }
        >
          <UserRound className="h-6 w-6" />
          마이페이지
        </NavLink>
      </nav>
    </>
  );
}
