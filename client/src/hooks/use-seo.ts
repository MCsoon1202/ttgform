import { useEffect } from "react";

interface SeoOptions {
  title?: string;
  description?: string;
  canonical?: string;
}

export function useSeo({ title, description, canonical }: SeoOptions) {
  useEffect(() => {
    if (title) {
      document.title = title;
    }

    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.name = "description";
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = description;

      let ogDesc = document.querySelector('meta[property="og:description"]') as HTMLMetaElement | null;
      if (!ogDesc) {
        ogDesc = document.createElement("meta");
        ogDesc.setAttribute("property", "og:description");
        document.head.appendChild(ogDesc);
      }
      ogDesc.content = description;
    }

    if (title) {
      let ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement | null;
      if (!ogTitle) {
        ogTitle = document.createElement("meta");
        ogTitle.setAttribute("property", "og:title");
        document.head.appendChild(ogTitle);
      }
      ogTitle.content = title;
    }

    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = canonical;
    }

    return () => {
      document.title = "딸기폼 - 무료 문서 양식 포털 | 온라인 작성 및 PDF 저장";
    };
  }, [title, description, canonical]);
}
