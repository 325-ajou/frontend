import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex w-full items-center space-x-2 px-3 py-2">
        <Input type="text" placeholder="검색..." className="w-full" />
        <Button type="submit" variant="secondary">
          <Search />
        </Button>
      </div>
      <div className="flex flex-col flex-grow items-center justify-center bg-gray-100">
        <h1 className="text-4xl font-bold text-gray-800">아슐랭 가이드</h1>
        <p className="mt-4 text-lg text-gray-600">아주대 맛집 지도 서비스</p>
      </div>
    </div>
  );
}
