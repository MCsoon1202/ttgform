import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { SearchBar } from "@/components/search-bar";
import { FormCard } from "@/components/form-card";
import { TrustBadges } from "@/components/trust-badges";
import { AdPlaceholder } from "@/components/ad-placeholder";
import { Skeleton } from "@/components/ui/skeleton";
import { useSeo } from "@/hooks/use-seo";
import type { FormTemplate, SiteSetting } from "@shared/schema";
import logoImg from "@assets/ChatGPT_Image_2026년_2월_13일_오후_02_49_28_1770961861300.png";

function FormGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-[130px] rounded-md" />
      ))}
    </div>
  );
}

export default function Home() {
  useSeo({
    title: "딸기폼 - 무료 문서 양식 포털 | 온라인 작성 및 PDF 저장",
    description: "딸기폼에서 근로계약서, 사직서, 임대차계약서 등 다양한 문서 양식을 무료로 작성하고 PDF로 저장하세요.",
  });

  const { data: popularForms, isLoading: loadingPopular } = useQuery<FormTemplate[]>({
    queryKey: ["/api/forms", "popular"],
  });

  const { data: recentForms, isLoading: loadingRecent } = useQuery<FormTemplate[]>({
    queryKey: ["/api/forms", "recent"],
  });

  const { data: introSetting } = useQuery<SiteSetting>({
    queryKey: ["/api/settings", "home_intro"],
  });

  return (
    <div className="min-h-screen flex flex-col">
      <section
        className="relative flex flex-col items-center justify-center px-4 pt-14 pb-10 md:pt-20 md:pb-14 bg-gradient-to-b from-primary/5 to-transparent"
        data-testid="hero-section"
      >
        <div className="flex items-center gap-3 mb-5">
          <img
            src={logoImg}
            alt="딸기폼 로고"
            className="h-40 md:h-56 object-contain"
            data-testid="img-main-logo"
          />
        </div>

        <h2 className="text-lg md:text-2xl font-semibold text-center mb-3 tracking-tight" data-testid="text-hero-heading">
          회원가입 없이 웹에서 입력하고 즉시 인쇄하세요.
        </h2>

        <div className="w-full max-w-2xl mb-3">
          <SearchBar large />
        </div>

        <p className="text-sm text-muted-foreground" data-testid="text-hero-sub">
          양식이 없다면? 우측상단 '양식신청하기'를 이용하세요.
        </p>
      </section>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 pb-12 space-y-10">
        <TrustBadges />

        <section data-testid="section-popular">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 rounded-full bg-primary" />
            <h2 className="text-lg font-bold">인기 양식</h2>
          </div>
          {loadingPopular ? (
            <FormGridSkeleton />
          ) : popularForms && popularForms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularForms.map((form) => (
                <FormCard key={form.id} form={form} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">아직 인기 양식이 없습니다.</p>
          )}
        </section>

        <AdPlaceholder position="home-after-popular" />

        <section data-testid="section-recent">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-primary" />
              <h2 className="text-lg font-bold">최근 추가</h2>
            </div>
            <Link href="/forms" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-more-recent">
              +더보기
            </Link>
          </div>
          {loadingRecent ? (
            <FormGridSkeleton />
          ) : recentForms && recentForms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentForms.map((form) => (
                <FormCard key={form.id} form={form} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">아직 추가된 양식이 없습니다.</p>
          )}
        </section>

        {introSetting?.value && (
          <section
            className="prose prose-sm max-w-none text-muted-foreground"
            data-testid="section-intro"
            dangerouslySetInnerHTML={{ __html: introSetting.value }}
          />
        )}
      </main>
    </div>
  );
}
