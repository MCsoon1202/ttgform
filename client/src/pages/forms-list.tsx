import { useQuery } from "@tanstack/react-query";
import { SearchBar } from "@/components/search-bar";
import { FormCard } from "@/components/form-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSeo } from "@/hooks/use-seo";
import type { FormTemplate } from "@shared/schema";

export default function FormsList() {
  useSeo({
    title: "전체 양식 목록 - 딸기폼 | 무료 문서 양식 검색",
    description: "딸기폼에서 제공하는 전체 무료 문서 양식 목록입니다. 계약서, 인사, 회계 등 다양한 카테고리별로 양식을 찾아보세요.",
  });

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: forms, isLoading } = useQuery<FormTemplate[]>({
    queryKey: ["/api/forms"],
  });

  const visibleForms = forms?.filter((f) => f.isVisible !== false);

  const categories = visibleForms
    ? Array.from(new Set(visibleForms.map((f) => f.category).filter(Boolean))) as string[]
    : [];

  const filteredForms = selectedCategory
    ? visibleForms?.filter((f) => f.category === selectedCategory)
    : visibleForms;

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-1" data-testid="text-forms-title">전체 양식</h1>
        <p className="text-sm text-muted-foreground mb-6">
          필요한 양식을 찾아 바로 작성하세요. 모든 양식은 무료입니다.
        </p>

        <div className="mb-6 max-w-lg">
          <SearchBar />
        </div>

        {categories.length > 0 && (
          <div className="flex items-center gap-2 mb-6 flex-wrap" data-testid="category-filters">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              data-testid="button-category-all"
            >
              전체
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                data-testid={`button-category-${cat}`}
              >
                {cat}
              </Button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-[120px] rounded-md" />
            ))}
          </div>
        ) : filteredForms && filteredForms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredForms.map((form) => (
              <FormCard key={form.id} form={form} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-sm">양식을 찾을 수 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
