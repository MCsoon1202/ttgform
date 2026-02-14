import { Link } from "wouter";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/50 mt-auto" data-testid="site-footer">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-1.5 font-bold text-base mb-2">
              <span className="text-primary">*</span>
              <span>딸기폼</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              누구나 무료로 사용할 수 있는 문서 양식 포털입니다.
              회원가입 없이 바로 작성하고 PDF로 저장하세요.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2">바로가기</h4>
            <ul className="space-y-1">
              <li>
                <Link href="/forms" className="text-xs text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-forms">
                  전체 양식
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-xs text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-search">
                  양식 검색
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2">안내</h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>개인정보를 저장하지 않습니다</li>
              <li>모든 양식은 무료입니다</li>
              <li>PDF 생성은 브라우저에서 처리됩니다</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-6 pt-4 text-center">
          <p className="text-[11px] text-muted-foreground">
            &copy; {new Date().getFullYear()} 딸기폼. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
