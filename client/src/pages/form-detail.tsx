import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AdPlaceholder } from "@/components/ad-placeholder";
import { FormCard } from "@/components/form-card";
import { Download, ChevronDown, ChevronUp, FileText, ArrowLeft, Image, Printer } from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useSeo } from "@/hooks/use-seo";
import type { FormTemplate, FormField } from "@shared/schema";
import { TransactionStatementForm } from "@/components/transaction-statement-form";
import { EmploymentContractForm } from "@/components/employment-contract-form";
import { EstimateForm } from "@/components/estimate-form";
import { SimpleReceiptForm } from "@/components/simple-receipt-form";
import { PowerOfAttorneyForm } from "@/components/power-of-attorney-form";
import { CertificateOfEmploymentForm } from "@/components/certificate-of-employment-form";
import { PurchaseOrderForm } from "@/components/purchase-order-form";
import { RequestOrderForm } from "@/components/request-order-form";



function FaqSection({ faq }: { faq: Array<{ question: string; answer: string }> }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!faq || faq.length === 0) return null;

  return (
    <section className="space-y-2" data-testid="faq-section">
      <h2 className="text-lg font-bold mb-3">자주 묻는 질문</h2>
      {faq.map((item, i) => (
        <div
          key={i}
          className="border border-border rounded-md overflow-hidden"
          data-testid={`faq-item-${i}`}
        >
          <button
            className="flex items-center justify-between gap-2 w-full p-4 text-left hover-elevate"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            data-testid={`button-faq-toggle-${i}`}
          >
            <span className="text-base font-bold">{item.question}</span>
            {openIndex === i ? (
              <ChevronUp className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
            )}
          </button>
          {openIndex === i && (
            <div className="px-4 pb-4 text-base text-foreground leading-[1.8] font-semibold">
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </section>
  );
}

function DynamicForm({
  fields,
  formRef,
}: {
  fields: FormField[];
  formRef: React.Ref<HTMLDivElement>;
}) {
  const [values, setValues] = useState<Record<string, string>>({});

  const handleChange = (fieldId: string, value: string) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  if (!fields || fields.length === 0) return null;

  return (
    <div ref={formRef} className="space-y-4" data-testid="dynamic-form">
      {fields.map((field) => {
        const isHalf = field.width === "half";
        return (
          <div
            key={field.id}
            className={isHalf ? "inline-block w-[calc(50%-0.375rem)] mr-3 align-top" : "w-full"}
          >
            <Label className="text-sm font-medium mb-1.5 block">
              {field.label}
              {field.required && <span className="text-primary ml-0.5">*</span>}
            </Label>
            {field.type === "textarea" ? (
              <Textarea
                placeholder={field.placeholder || ""}
                value={values[field.id] || ""}
                onChange={(e) => handleChange(field.id, e.target.value)}
                className="resize-none"
                rows={4}
                data-testid={`input-field-${field.id}`}
              />
            ) : field.type === "select" && field.options ? (
              <Select
                value={values[field.id] || ""}
                onValueChange={(v) => handleChange(field.id, v)}
              >
                <SelectTrigger data-testid={`input-field-${field.id}`}>
                  <SelectValue placeholder={field.placeholder || "선택하세요"} />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                type={field.type === "number" ? "number" : field.type === "date" ? "date" : field.type === "email" ? "email" : "text"}
                placeholder={field.placeholder || ""}
                value={values[field.id] || ""}
                onChange={(e) => handleChange(field.id, e.target.value)}
                data-testid={`input-field-${field.id}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function FormDetail() {
  const { slug } = useParams<{ slug: string }>();
  const formRef = useRef<HTMLDivElement>(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [imageGenerating, setImageGenerating] = useState(false);

  const { data: form, isLoading } = useQuery<FormTemplate>({
    queryKey: ["/api/forms/by-slug", slug],
  });

  useSeo({
    title: form?.metaTitle || "딸기폼",
    description: form?.metaDescription,
    canonical: form ? `${window.location.origin}/forms/${form.slug}` : undefined,
  });

  const { data: relatedForms } = useQuery<FormTemplate[]>({
    queryKey: ["/api/forms", "related", slug],
    enabled: !!form,
  });

  const viewMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/forms/${slug}/view`),
  });

  useEffect(() => {
    if (slug) viewMutation.mutate();
  }, [slug]);

  const captureFormCanvas = async () => {
    if (!formRef.current) return null;
    await document.fonts.ready;
    const { toCanvas } = await import("html-to-image");

    const saved: Array<{ parent: Node; original: Node; replacement: Node }> = [];
    const hiddenRows: HTMLElement[] = [];
    const hiddenButtons: Array<{ el: HTMLElement; prev: string }> = [];
    const highlightEls: Array<{ el: HTMLElement; prev: string }> = [];

    const prevWidth = formRef.current.style.width;
    const prevMinWidth = formRef.current.style.minWidth;
    const prevMaxWidth = formRef.current.style.maxWidth;

    const computedMax = window.getComputedStyle(formRef.current).maxWidth;
    const parsedMax = parseInt(computedMax, 10);
    const targetW = (!isNaN(parsedMax) && parsedMax > 0 && parsedMax < 2000) ? parsedMax : Math.max(formRef.current.offsetWidth, 700);
    formRef.current.style.width = targetW + "px";
    formRef.current.style.minWidth = targetW + "px";
    formRef.current.style.maxWidth = targetW + "px";

    formRef.current.querySelectorAll("tbody tr").forEach((tr) => {
      const row = tr as HTMLElement;
      const nameInput = row.querySelector("[data-testid^='input-item-name-']") as HTMLInputElement;
      if (!nameInput) return;
      let hasData = false;
      row.querySelectorAll("input").forEach((inp) => {
        if ((inp as HTMLInputElement).value?.trim()) hasData = true;
      });
      row.querySelectorAll("td[data-testid^='text-supply-'], td[data-testid^='text-tax-']").forEach((td) => {
        if (td.textContent?.trim()) hasData = true;
      });
      if (!hasData) {
        hiddenRows.push(row);
        row.style.display = "none";
      }
    });

    formRef.current.querySelectorAll("button").forEach((btn) => {
      const el = btn as HTMLElement;
      hiddenButtons.push({ el, prev: el.style.display });
      el.style.display = "none";
    });

    formRef.current.querySelectorAll(".sr-print-controls, .print-controls").forEach((ctrl) => {
      const el = ctrl as HTMLElement;
      hiddenButtons.push({ el, prev: el.style.display });
      el.style.display = "none";
    });

    const styledInputs: Array<{ el: HTMLElement; prevStyles: Record<string, string> }> = [];

    formRef.current.querySelectorAll("input, textarea, select").forEach((el) => {
      const input = el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      if (input.closest(".sr-print-controls") || input.closest(".print-controls")) return;
      if (input.type === "radio") return;
      const parentSection = input.closest(".receipt-buyer, .receipt-supplier");
      if (parentSection && (parentSection as HTMLElement).style.display === "none") return;
      const isCheckbox = el.tagName === "INPUT" && (input as HTMLInputElement).type === "checkbox";

      if (isCheckbox) {
        const checkbox = input as HTMLInputElement;
        const computed = window.getComputedStyle(input);
        const div = document.createElement("div");
        div.style.display = "inline-block";
        div.style.width = computed.width || "13px";
        div.style.height = computed.height || "13px";
        div.style.border = "1.5px solid #666";
        div.style.borderRadius = "2px";
        div.style.textAlign = "center";
        div.style.lineHeight = computed.height || "13px";
        div.style.fontSize = "10px";
        div.style.fontWeight = "bold";
        div.style.verticalAlign = "middle";
        div.style.margin = computed.margin;
        div.style.boxSizing = "border-box";
        div.style.flexShrink = "0";
        if (checkbox.checked) {
          div.style.backgroundColor = "#e57373";
          div.style.borderColor = "#e57373";
          div.style.color = "#ffffff";
          div.textContent = "\u2713";
        } else {
          div.style.backgroundColor = "#ffffff";
          div.textContent = "\u00A0";
        }
        if (input.parentNode) {
          saved.push({ parent: input.parentNode, original: input, replacement: div });
          input.parentNode.replaceChild(div, input);
        }
        return;
      }

      const prevStyles: Record<string, string> = {
        border: input.style.border,
        borderBottom: input.style.borderBottom,
        background: input.style.background,
        backgroundColor: input.style.backgroundColor,
        outline: input.style.outline,
        color: input.style.color,
        className: input.className,
      };
      input.className = input.className
        .replace(/\bborder-b\b/g, "")
        .replace(/\bborder-b-gray-\d+\b/g, "")
        .replace(/\bborder-b-\S+/g, "")
        .replace(/\bbg-\[\#fff9c4\]/g, "");
      input.style.border = "none";
      input.style.borderBottom = "none";
      input.style.background = "transparent";
      input.style.backgroundColor = "transparent";
      input.style.outline = "none";
      const val = el.tagName === "SELECT"
        ? (input as HTMLSelectElement).options[(input as HTMLSelectElement).selectedIndex]?.text || ""
        : (input as HTMLInputElement).value || "";
      if (!val.trim()) {
        prevStyles.colorWasSet = "true";
        input.style.color = "transparent";
      }
      input.setAttribute("readonly", "true");
      styledInputs.push({ el: input, prevStyles });

      const itemField = input.getAttribute("data-item-field");
      const itemRow = input.getAttribute("data-item-row");
      if (itemField || itemRow) {
      }
    });

    const marginMarkers: HTMLElement[] = [];
    const processedRows = new Set<Element>();
    formRef.current.querySelectorAll("table").forEach((table) => {
      if (table.querySelector("table")) return;
      const rows = Array.from(table.querySelectorAll("tbody tr"));
      const itemRows = rows.filter((r) => r.querySelector("[data-item-field='name']"));
      if (itemRows.length === 0) return;
      let lastDataIdx = -1;
      itemRows.forEach((r, i) => {
        if (processedRows.has(r)) return;
        const nameEl = r.querySelector("[data-item-field='name']") as HTMLElement | null;
        if (!nameEl) return;
        const val = nameEl.textContent?.replace(/\u00A0/g, "").trim() || "";
        if (val) lastDataIdx = i;
      });
      if (lastDataIdx >= 0 && lastDataIdx < itemRows.length - 1) {
        const nextRow = itemRows[lastDataIdx + 1] as HTMLElement;
        if (processedRows.has(nextRow)) return;
        processedRows.add(nextRow);
        const nameCell = nextRow.querySelector("[data-item-field='name']")?.parentElement as HTMLElement | null;
        if (nameCell) {
          const marker = document.createElement("div");
          marker.textContent = "= 이하여백 =";
          marker.style.textAlign = "center";
          marker.style.fontSize = "11px";
          marker.style.color = "#666";
          marker.style.width = "100%";
          marker.style.letterSpacing = "2px";
          marker.setAttribute("data-margin-marker", "true");
          const existingChild = nameCell.firstChild;
          if (existingChild) {
            (existingChild as HTMLElement).style.display = "none";
          }
          nameCell.appendChild(marker);
          marginMarkers.push(marker);
        }
      }
      itemRows.forEach((r) => processedRows.add(r));
    });

    formRef.current.querySelectorAll("[class*='bg-[#fff9c4]']").forEach((el) => {
      const htmlEl = el as HTMLElement;
      highlightEls.push({ el: htmlEl, prev: htmlEl.style.backgroundColor });
      htmlEl.style.backgroundColor = "transparent";
    });

    const watermark = document.createElement("div");
    watermark.textContent = "* 이 양식은 딸기폼에서 무료로 제작 되었습니다. (ttgform.kr)";
    watermark.style.textAlign = "center";
    watermark.style.fontSize = "11px";
    watermark.style.color = "#999";
    watermark.style.paddingTop = "12px";
    watermark.style.paddingBottom = "4px";
    watermark.style.letterSpacing = "0.5px";
    watermark.setAttribute("data-watermark", "true");
    formRef.current.appendChild(watermark);

    await new Promise(r => setTimeout(r, 50));

    try {
      const canvas = await toCanvas(formRef.current, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        cacheBust: true,
      });
      return canvas;
    } finally {
      saved.forEach(({ parent, original, replacement }) => {
        parent.replaceChild(original, replacement);
      });
      styledInputs.forEach(({ el, prevStyles }) => {
        el.className = prevStyles.className;
        el.style.border = prevStyles.border;
        el.style.borderBottom = prevStyles.borderBottom;
        el.style.background = prevStyles.background;
        el.style.backgroundColor = prevStyles.backgroundColor;
        el.style.outline = prevStyles.outline;
        el.style.color = prevStyles.color;
        el.removeAttribute("readonly");
      });
      hiddenRows.forEach((row) => { row.style.display = ""; });
      hiddenButtons.forEach(({ el, prev }) => { el.style.display = prev; });
      highlightEls.forEach(({ el, prev }) => { el.style.backgroundColor = prev; });
      marginMarkers.forEach((marker) => {
        const cell = marker.parentElement;
        if (cell) {
          const hiddenChild = cell.querySelector("[style*='display: none']") as HTMLElement | null;
          if (hiddenChild) hiddenChild.style.display = "";
        }
        marker.remove();
      });
      formRef.current.style.width = prevWidth;
      formRef.current.style.minWidth = prevMinWidth;
      formRef.current.style.maxWidth = prevMaxWidth;
      watermark.remove();
    }
  };

  const handlePdfDownload = async () => {
    if (!formRef.current || !form) return;
    setPdfGenerating(true);
    try {
      const canvas = await captureFormCanvas();
      if (!canvas) return;
      const { jsPDF } = await import("jspdf");
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const printW = pageW - margin * 2;
      const printH = pageH - margin * 2;
      const imgH = (canvas.height * printW) / canvas.width;
      if (imgH <= printH) {
        pdf.addImage(imgData, "PNG", margin, margin, printW, imgH);
      } else {
        let remainH = imgH;
        let srcY = 0;
        let page = 0;
        while (remainH > 0) {
          if (page > 0) pdf.addPage();
          const sliceH = Math.min(printH, remainH);
          const srcSliceH = (sliceH / imgH) * canvas.height;
          const sliceCanvas = document.createElement("canvas");
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = Math.ceil(srcSliceH);
          const ctx = sliceCanvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
            ctx.drawImage(canvas, 0, srcY, canvas.width, srcSliceH, 0, 0, canvas.width, srcSliceH);
          }
          pdf.addImage(sliceCanvas.toDataURL("image/png"), "PNG", margin, margin, printW, sliceH);
          srcY += srcSliceH;
          remainH -= sliceH;
          page++;
        }
      }
      pdf.save(`${form.title}.pdf`);
    } catch {
      alert("PDF 생성 중 오류가 발생했습니다.");
    } finally {
      setPdfGenerating(false);
    }
  };

  const handleImageDownload = async () => {
    if (!formRef.current || !form) return;
    setImageGenerating(true);
    try {
      const canvas = await captureFormCanvas();
      if (!canvas) return;
      const link = document.createElement("a");
      link.download = `${form.title}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      alert("이미지 생성 중 오류가 발생했습니다.");
    } finally {
      setImageGenerating(false);
    }
  };

  const handlePrint = async () => {
    if (!formRef.current) return;
    try {
      const canvas = await captureFormCanvas();
      if (!canvas) return;
      const imgData = canvas.toDataURL("image/png");
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.top = "-10000px";
      iframe.style.left = "-10000px";
      iframe.style.width = "210mm";
      iframe.style.height = "297mm";
      iframe.style.border = "none";
      document.body.appendChild(iframe);
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) { document.body.removeChild(iframe); return; }
      const ratio = canvas.height / canvas.width;
      const pageW = 190;
      const pageH = 277;
      let w = pageW;
      let h = pageW * ratio;
      if (h > pageH) {
        h = pageH;
        w = pageH / ratio;
      }
      doc.open();
      doc.write(`<!DOCTYPE html><html><head><style>@page{size:A4;margin:10mm;}*{margin:0;padding:0;}body{text-align:center;}img{width:${w}mm;height:${h}mm;}</style></head><body><img src="${imgData}"/></body></html>`);
      doc.close();
      const imgEl = doc.querySelector("img");
      const doPrint = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => { try { document.body.removeChild(iframe); } catch(e) {} }, 2000);
      };
      if (imgEl) {
        if (imgEl.complete && imgEl.naturalWidth > 0) {
          setTimeout(doPrint, 100);
        } else {
          imgEl.onload = () => setTimeout(doPrint, 100);
        }
      }
    } catch {
      alert("인쇄 준비 중 오류가 발생했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-[300px] w-full rounded-md" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground">양식을 찾을 수 없습니다.</p>
        <Link href="/forms">
          <Button variant="outline" className="mt-4" data-testid="button-back-to-forms">
            <ArrowLeft className="w-4 h-4 mr-1" />
            양식 목록으로
          </Button>
        </Link>
      </div>
    );
  }

  const faqStructuredData = form.faq && form.faq.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: form.faq.map((item: { question: string; answer: string }) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  } : null;

  return (
    <>
      {faqStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 py-8 flex gap-6">
        <aside className="hidden lg:block w-[140px] flex-shrink-0" data-testid="sidebar-ad-left">
          <div className="sticky top-24 z-10">
            <AdPlaceholder position="detail-sidebar" className="" layout="vertical" count={3} />
          </div>
        </aside>

        <article className="flex-1 min-w-0">
        <nav className="mb-4" data-testid="breadcrumb">
          <ol className="flex items-center gap-1 text-xs text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-foreground transition-colors">홈</Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/forms" className="hover:text-foreground transition-colors">양식</Link>
            </li>
            <li>/</li>
            <li className="text-foreground font-medium truncate max-w-[200px]">{form.title}</li>
          </ol>
        </nav>

        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-2" data-testid="text-form-title">
            {form.title}
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            {form.category && (
              <Badge variant="secondary">{form.category}</Badge>
            )}
            {form.isPopular && (
              <Badge variant="outline">
                <span className="text-primary mr-1">*</span> 인기
              </Badge>
            )}
            {form.keywords && form.keywords.length > 0 && form.keywords.map((kw) => (
              <Badge key={kw} variant="outline" className="text-[10px]">{kw}</Badge>
            ))}
          </div>
        </header>

        <Card className="mb-8" data-testid="form-input-card">
          <CardContent className="p-6 overflow-x-auto">
            <div className="mb-4">
              <h2 className="text-lg font-bold">양식 작성</h2>
              <div className="mt-1 text-sm text-muted-foreground" style={{ paddingLeft: 0 }}>
                <div className="flex"><span className="flex-shrink-0 mr-1">*</span><span>화면에서 직접 입력하고 바로 사용하세요.</span></div>
                <div className="flex"><span className="flex-shrink-0 mr-1">*</span><span>모바일 환경에서 작성시 양식이 깨질수있으나 인쇄 및 이미지 저장시 정상으로 나옵니다.</span></div>
              </div>
            </div>
            {form.slug === "transaction-statement" ? (
              <TransactionStatementForm ref={formRef} />
            ) : form.slug === "employment-contract-5" ? (
              <EmploymentContractForm ref={formRef} />
            ) : form.slug === "estimate" ? (
              <EstimateForm ref={formRef} />
            ) : form.slug === "simple-receipt" ? (
              <SimpleReceiptForm ref={formRef} />
            ) : form.slug === "power-of-attorney" ? (
              <PowerOfAttorneyForm ref={formRef} />
            ) : form.slug === "certificate-of-employment" ? (
              <CertificateOfEmploymentForm ref={formRef} />
            ) : form.slug === "purchase-order" ? (
              <PurchaseOrderForm ref={formRef} />
            ) : form.slug === "request-order" ? (
              <RequestOrderForm ref={formRef} />
            ) : (
              <DynamicForm fields={form.fields || []} formRef={formRef} />
            )}

            <div className="flex items-center gap-2 mt-6 flex-wrap">
              <Button
                onClick={handlePdfDownload}
                disabled={pdfGenerating}
                data-testid="button-pdf-download"
              >
                <Download className="w-4 h-4 mr-1.5" />
                {pdfGenerating ? "생성 중..." : "PDF로 저장"}
              </Button>
              <Button
                variant="secondary"
                onClick={handleImageDownload}
                disabled={imageGenerating}
                data-testid="button-image-download"
              >
                <Image className="w-4 h-4 mr-1.5" />
                {imageGenerating ? "생성 중..." : "이미지로 저장"}
              </Button>
              <Button
                variant="outline"
                onClick={handlePrint}
                data-testid="button-print"
              >
                <Printer className="w-4 h-4 mr-1.5" />
                인쇄
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              입력한 데이터는 서버에 저장되지 않습니다.
            </p>
          </CardContent>
        </Card>

        <AdPlaceholder position="detail-after-form" className="mb-8" />

        {form.howToWrite && (
          <section className="mb-8" data-testid="how-to-write">
            <h2 className="text-lg font-bold mb-3">작성 방법</h2>
            <div
              className="prose prose-base max-w-none text-foreground leading-[1.8] font-semibold"
              dangerouslySetInnerHTML={{ __html: form.howToWrite }}
            />
          </section>
        )}

        {form.faq && form.faq.length > 0 && (
          <div className="mb-8">
            <FaqSection faq={form.faq} />
          </div>
        )}

        <AdPlaceholder position="detail-after-faq" className="mb-8" />

        {form.seoContent && (
          <section
            className="prose prose-base max-w-none mb-8 text-foreground leading-[1.8] font-semibold"
            data-testid="seo-content"
            dangerouslySetInnerHTML={{ __html: form.seoContent }}
          />
        )}

        <AdPlaceholder position="detail-after-content" className="mb-8" />

        {relatedForms && relatedForms.length > 0 && (
          <section className="mb-8" data-testid="related-forms">
            <h2 className="text-lg font-bold mb-3">관련 양식</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {relatedForms.map((rf) => (
                <FormCard key={rf.id} form={rf} />
              ))}
            </div>
          </section>
        )}
      </article>

        <aside className="hidden lg:block w-[140px] flex-shrink-0" aria-hidden="true">
        </aside>
      </div>
    </>
  );
}
