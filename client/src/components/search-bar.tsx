import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";

interface SearchBarProps {
  large?: boolean;
  initialValue?: string;
  onSearch?: (query: string) => void;
}

export function SearchBar({ large = false, initialValue = "", onSearch }: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [, navigate] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    if (onSearch) {
      onSearch(trimmed);
    } else {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full" data-testid="search-bar">
      <div className="relative">
        <Search
          className={`absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground ${large ? "w-5 h-5" : "w-4 h-4"}`}
        />
        <Input
          type="search"
          placeholder="필요한 양식을 검색해보세요"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`${large ? "pl-11 pr-4 h-12 text-base" : "pl-9 pr-4 h-10 text-sm"} bg-card border-card-border`}
          data-testid="input-search"
        />
      </div>
    </form>
  );
}
