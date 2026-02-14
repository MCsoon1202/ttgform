import { Link, useLocation } from "wouter";
import { Search, FileEdit } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImg from "@assets/ChatGPT_Image_2026년_2월_13일_오후_02_49_28_1770961861300.png";

export function SiteHeader() {
  const [location] = useLocation();
  const isHome = location === "/";

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      data-testid="site-header"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 h-24 px-4">
        <Link href="/">
          <span
            className="flex items-center gap-2 font-bold text-lg tracking-tight cursor-pointer"
            data-testid="link-home"
          >
            <img src={logoImg} alt="딸기폼" className="h-20 object-contain" data-testid="img-header-logo" />
          </span>
        </Link>

        <nav className="flex items-center gap-2" data-testid="nav-main">
          <Link href="/forms">
            <Button
              variant="outline"
              size="sm"
              data-testid="link-forms"
            >
              양식 목록
            </Button>
          </Link>
          <Link href="/form-request">
            <Button
              variant="outline"
              size="sm"
              data-testid="link-form-request"
            >
              <FileEdit className="w-4 h-4 mr-1" />
              양식 신청하기
            </Button>
          </Link>
          {!isHome && (
            <Link href="/search">
              <Button variant="ghost" size="icon" data-testid="link-search">
                <Search className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
