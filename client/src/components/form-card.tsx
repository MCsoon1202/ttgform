import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye } from "lucide-react";
import { Link } from "wouter";
import type { FormTemplate } from "@shared/schema";

interface FormCardProps {
  form: FormTemplate;
}

export function FormCard({ form }: FormCardProps) {
  return (
    <Link href={`/forms/${form.slug}`}>
      <Card
        className="group cursor-pointer hover-elevate transition-colors duration-200 relative hover:z-50"
        data-testid={`card-form-${form.slug}`}
      >
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm leading-snug line-clamp-2 mb-1">
                {form.title}
              </h3>
              <div className="relative">
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {form.metaDescription}
                </p>
                {form.metaDescription && (
                  <div className="invisible group-hover:visible absolute left-0 top-full mt-2 z-50 w-64 sm:w-80 p-3 rounded-md bg-foreground text-background text-xs leading-relaxed shadow-lg">
                    {form.metaDescription}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {form.isPopular && (
              <Badge variant="secondary" className="text-[10px]">
                <span className="text-primary mr-1">*</span>
                인기
              </Badge>
            )}
            {form.category && (
              <Badge variant="outline" className="text-[10px]">
                {form.category}
              </Badge>
            )}
            <div className="flex items-center gap-1 ml-auto text-[10px] text-muted-foreground">
              <Eye className="w-3 h-3" />
              <span>{(form.viewCount ?? 0).toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
