import { useQuery } from "@tanstack/react-query";
import { SearchBar } from "@/components/search-bar";
import { FormCard } from "@/components/form-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { Search as SearchIcon } from "lucide-react";
import { useSeo } from "@/hooks/use-seo";
import type { FormTemplate } from "@shared/schema";

export default function SearchPage() {
  useSeo({
    title: "양식 검색 - 딸기폼",
    description: "필요한 문서 양식을 검색하세요. 근로계약서, 사직서, 영수증 등 다양한 양식을 무료로 제공합니다.",
  });

  const params = new URLSearchParams(window.location.search);
  const initialQ = params.get("q") || "";
  const [query, setQuery] = useState(initialQ);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const q = p.get("q") || "";
    if (q !== query) setQuery(q);
  }, []);

  const { data: results, isLoading } = useQuery<FormTemplate[]>({
    queryKey: ["/api/forms", "search", query],
    enabled: query.length > 0,
  });

  const handleSearch = (q: string) => {
    setQuery(q);
    window.history.replaceState({}, "", `/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6" data-testid="text-search-title">양식 검색</h1>
        <div className="mb-8">
          <SearchBar large initialValue={query} onSearch={handleSearch} />
        </div>

        {!query ? (
          <div className="text-center py-20">
            <SearchIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">검색어를 입력하세요.</p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[120px] rounded-md" />
            ))}
          </div>
        ) : results && results.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              &quot;{query}&quot; 검색 결과 {results.length}건
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {results.map((form) => (
                <FormCard key={form.id} form={form} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-sm text-muted-foreground">
              &quot;{query}&quot;에 대한 검색 결과가 없습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
