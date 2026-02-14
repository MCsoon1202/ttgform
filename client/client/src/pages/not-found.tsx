import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <FileText className="w-16 h-16 text-muted-foreground/20 mb-4" />
      <h1 className="text-2xl font-bold mb-2" data-testid="text-404-title">페이지를 찾을 수 없습니다</h1>
      <p className="text-sm text-muted-foreground mb-6">요청하신 페이지가 존재하지 않습니다.</p>
      <Link href="/">
        <Button data-testid="button-go-home">홈으로 돌아가기</Button>
      </Link>
    </div>
  );
}
