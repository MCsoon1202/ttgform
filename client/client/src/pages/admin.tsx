import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Trash2, Save, LogIn, FileText, Settings, X, GripVertical, Inbox, Eye, EyeOff } from "lucide-react";
import type { FormTemplate, FormField, FaqItem } from "@shared/schema";

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/login", { password });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "로그인 성공" });
      onLogin();
    },
    onError: () => {
      setError("비밀번호가 올바르지 않습니다.");
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <LogIn className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold">관리자 로그인</h1>
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); loginMutation.mutate(); }}
            className="space-y-4"
          >
            <div>
              <Label className="text-sm mb-1.5 block">비밀번호</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="관리자 비밀번호"
                data-testid="input-admin-password"
              />
              {error && <p className="text-xs text-destructive mt-1">{error}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loginMutation.isPending} data-testid="button-admin-login">
              {loginMutation.isPending ? "로그인 중..." : "로그인"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function FormEditor({
  form,
  onSave,
  onCancel,
}: {
  form: Partial<FormTemplate> | null;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [slug, setSlug] = useState(form?.slug || "");
  const [title, setTitle] = useState(form?.title || "");
  const [metaTitle, setMetaTitle] = useState(form?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(form?.metaDescription || "");
  const [seoContent, setSeoContent] = useState(form?.seoContent || "");
  const [howToWrite, setHowToWrite] = useState(form?.howToWrite || "");
  const [category, setCategory] = useState(form?.category || "");
  const [isPopular, setIsPopular] = useState(form?.isPopular || false);
  const [keywords, setKeywords] = useState<string[]>(form?.keywords || []);
  const [keywordInput, setKeywordInput] = useState("");
  const [faq, setFaq] = useState<FaqItem[]>((form?.faq as FaqItem[]) || []);
  const [fields, setFields] = useState<FormField[]>((form?.fields as FormField[]) || []);

  const addKeyword = () => {
    const k = keywordInput.trim();
    if (k && !keywords.includes(k)) {
      setKeywords([...keywords, k]);
      setKeywordInput("");
    }
  };

  const removeKeyword = (kw: string) => {
    setKeywords(keywords.filter((k) => k !== kw));
  };

  const addFaqItem = () => {
    setFaq([...faq, { question: "", answer: "" }]);
  };

  const updateFaqItem = (index: number, key: "question" | "answer", value: string) => {
    const updated = [...faq];
    updated[index] = { ...updated[index], [key]: value };
    setFaq(updated);
  };

  const removeFaqItem = (index: number) => {
    setFaq(faq.filter((_, i) => i !== index));
  };

  const addField = () => {
    setFields([
      ...fields,
      {
        id: `field_${Date.now()}`,
        label: "",
        type: "text",
        placeholder: "",
        required: false,
        width: "full",
      },
    ]);
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], ...updates };
    setFields(updated);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!slug || !title || !metaTitle || !metaDescription) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }
    onSave({
      slug,
      title,
      metaTitle,
      metaDescription,
      seoContent,
      howToWrite,
      category: category || null,
      isPopular,
      keywords,
      faq,
      fields,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-lg font-bold">
          {form?.id ? "양식 수정" : "새 양식 추가"}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} data-testid="button-editor-cancel">
            취소
          </Button>
          <Button size="sm" onClick={handleSubmit} data-testid="button-editor-save">
            <Save className="w-4 h-4 mr-1" />
            저장
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic">
        <TabsList>
          <TabsTrigger value="basic" data-testid="tab-basic">기본 정보</TabsTrigger>
          <TabsTrigger value="seo" data-testid="tab-seo">SEO</TabsTrigger>
          <TabsTrigger value="faq" data-testid="tab-faq">FAQ</TabsTrigger>
          <TabsTrigger value="fields" data-testid="tab-fields">입력 필드</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm mb-1.5 block">슬러그 (URL) *</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="employment-contract"
                data-testid="input-slug"
              />
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">제목 *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="근로계약서"
                data-testid="input-title"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm mb-1.5 block">카테고리</Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="계약서"
                data-testid="input-category"
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch
                checked={isPopular}
                onCheckedChange={setIsPopular}
                data-testid="switch-popular"
              />
              <Label className="text-sm">인기 양식</Label>
            </div>
          </div>
          <div>
            <Label className="text-sm mb-1.5 block">키워드</Label>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Input
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
                placeholder="키워드 입력 후 Enter"
                className="flex-1 min-w-[150px]"
                data-testid="input-keyword"
              />
              <Button variant="outline" size="sm" onClick={addKeyword} data-testid="button-add-keyword">
                추가
              </Button>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {keywords.map((kw) => (
                <Badge key={kw} variant="secondary" className="gap-1">
                  {kw}
                  <button onClick={() => removeKeyword(kw)} className="ml-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4 mt-4">
          <div>
            <Label className="text-sm mb-1.5 block">메타 타이틀 *</Label>
            <Input
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="근로계약서 무료 양식 - 딸기폼"
              data-testid="input-meta-title"
            />
          </div>
          <div>
            <Label className="text-sm mb-1.5 block">메타 설명 *</Label>
            <Textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="근로계약서를 무료로 작성하고 PDF로 저장하세요."
              rows={3}
              data-testid="input-meta-description"
            />
          </div>
          <div>
            <Label className="text-sm mb-1.5 block">SEO 콘텐츠 (HTML)</Label>
            <Textarea
              value={seoContent}
              onChange={(e) => setSeoContent(e.target.value)}
              placeholder="<p>근로계약서란...</p>"
              rows={8}
              className="font-mono text-xs"
              data-testid="input-seo-content"
            />
          </div>
          <div>
            <Label className="text-sm mb-1.5 block">작성 방법 (HTML)</Label>
            <Textarea
              value={howToWrite}
              onChange={(e) => setHowToWrite(e.target.value)}
              placeholder="<p>1. 근로자 정보를 입력합니다...</p>"
              rows={6}
              className="font-mono text-xs"
              data-testid="input-how-to-write"
            />
          </div>
        </TabsContent>

        <TabsContent value="faq" className="space-y-4 mt-4">
          {faq.map((item, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">FAQ #{i + 1}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFaqItem(i)}
                    data-testid={`button-remove-faq-${i}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <Input
                  value={item.question}
                  onChange={(e) => updateFaqItem(i, "question", e.target.value)}
                  placeholder="질문"
                  data-testid={`input-faq-question-${i}`}
                />
                <Textarea
                  value={item.answer}
                  onChange={(e) => updateFaqItem(i, "answer", e.target.value)}
                  placeholder="답변"
                  rows={3}
                  data-testid={`input-faq-answer-${i}`}
                />
              </CardContent>
            </Card>
          ))}
          <Button variant="outline" onClick={addFaqItem} data-testid="button-add-faq">
            <Plus className="w-4 h-4 mr-1" />
            FAQ 추가
          </Button>
        </TabsContent>

        <TabsContent value="fields" className="space-y-4 mt-4">
          {fields.map((field, i) => (
            <Card key={field.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground">필드 #{i + 1}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeField(i)}
                    data-testid={`button-remove-field-${i}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs mb-1 block">라벨</Label>
                    <Input
                      value={field.label}
                      onChange={(e) => updateField(i, { label: e.target.value })}
                      placeholder="이름"
                      data-testid={`input-field-label-${i}`}
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">타입</Label>
                    <select
                      value={field.type}
                      onChange={(e) => updateField(i, { type: e.target.value as FormField["type"] })}
                      className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm"
                      data-testid={`select-field-type-${i}`}
                    >
                      <option value="text">텍스트</option>
                      <option value="textarea">텍스트 영역</option>
                      <option value="date">날짜</option>
                      <option value="number">숫자</option>
                      <option value="email">이메일</option>
                      <option value="phone">전화번호</option>
                      <option value="address">주소</option>
                      <option value="select">선택</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">플레이스홀더</Label>
                    <Input
                      value={field.placeholder || ""}
                      onChange={(e) => updateField(i, { placeholder: e.target.value })}
                      placeholder="홍길동"
                      data-testid={`input-field-placeholder-${i}`}
                    />
                  </div>
                  <div className="flex items-center gap-4 pt-4">
                    <label className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateField(i, { required: e.target.checked })}
                        data-testid={`checkbox-field-required-${i}`}
                      />
                      필수
                    </label>
                    <label className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={field.width === "half"}
                        onChange={(e) => updateField(i, { width: e.target.checked ? "half" : "full" })}
                        data-testid={`checkbox-field-half-${i}`}
                      />
                      반폭
                    </label>
                  </div>
                </div>
                {field.type === "select" && (
                  <div className="mt-3">
                    <Label className="text-xs mb-1 block">옵션 (쉼표 구분)</Label>
                    <Input
                      value={(field.options || []).join(", ")}
                      onChange={(e) =>
                        updateField(i, {
                          options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                        })
                      }
                      placeholder="옵션1, 옵션2, 옵션3"
                      data-testid={`input-field-options-${i}`}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          <Button variant="outline" onClick={addField} data-testid="button-add-field">
            <Plus className="w-4 h-4 mr-1" />
            필드 추가
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FormRequestsPanel() {
  const { toast } = useToast();
  const { data: requests, isLoading } = useQuery<any[]>({
    queryKey: ["/api/form-requests"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/form-requests/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/form-requests"] });
      toast({ title: "신청이 삭제되었습니다." });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded-md animate-pulse" />
        ))}
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="text-center py-16">
        <Inbox className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">신청된 양식이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((req: any) => (
        <Card key={req.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm">{req.title}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {new Date(req.createdAt).toLocaleDateString("ko-KR")}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{req.content}</p>
                {req.fileName && (
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-[10px]">
                      <FileText className="w-3 h-3 mr-1" />
                      {req.fileName}
                    </Badge>
                    {req.fileData && (
                      <a
                        href={req.fileData}
                        download={req.fileName}
                        className="ml-2 text-xs text-primary underline"
                        data-testid={`link-download-${req.id}`}
                      >
                        다운로드
                      </a>
                    )}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (confirm("이 신청을 삭제하시겠습니까?")) {
                    deleteMutation.mutate(req.id);
                  }
                }}
                data-testid={`button-delete-request-${req.id}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [editingForm, setEditingForm] = useState<Partial<FormTemplate> | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/admin/check", { credentials: "include" })
      .then((r) => { if (r.ok) setIsAuthenticated(true); })
      .catch(() => {});
  }, []);

  const { data: forms, isLoading } = useQuery<FormTemplate[]>({
    queryKey: ["/api/forms"],
    enabled: isAuthenticated,
  });

  const { data: introSetting } = useQuery<{ key: string; value: string } | null>({
    queryKey: ["/api/settings", "home_intro"],
    enabled: isAuthenticated,
  });

  const { data: logoSetting } = useQuery<{ key: string; value: string } | null>({
    queryKey: ["/api/settings", "logo_url"],
    enabled: isAuthenticated,
  });

  const [introText, setIntroText] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    if (introSetting?.value) setIntroText(introSetting.value);
  }, [introSetting]);

  useEffect(() => {
    if (logoSetting?.value) setLogoUrl(logoSetting.value);
  }, [logoSetting]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingForm?.id) {
        return apiRequest("PUT", `/api/forms/${editingForm.id}`, data);
      }
      return apiRequest("POST", "/api/forms", data);
    },
    onSuccess: () => {
      toast({ title: "저장 완료" });
      queryClient.invalidateQueries({ queryKey: ["/api/forms"] });
      setShowEditor(false);
      setEditingForm(null);
    },
    onError: (err: Error) => {
      toast({ title: "저장 실패", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/forms/${id}`);
    },
    onSuccess: () => {
      toast({ title: "삭제 완료" });
      queryClient.invalidateQueries({ queryKey: ["/api/forms"] });
    },
    onError: (err: Error) => {
      toast({ title: "삭제 실패", description: err.message, variant: "destructive" });
    },
  });

  const visibilityMutation = useMutation({
    mutationFn: async ({ id, isVisible }: { id: number; isVisible: boolean }) => {
      return apiRequest("PATCH", `/api/forms/${id}/visibility`, { isVisible });
    },
    onSuccess: (_data, variables) => {
      toast({ title: variables.isVisible ? "양식이 노출됩니다." : "양식이 숨겨졌습니다." });
      queryClient.invalidateQueries({ queryKey: ["/api/forms"] });
    },
    onError: (err: Error) => {
      toast({ title: "변경 실패", description: err.message, variant: "destructive" });
    },
  });

  const saveIntroMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PUT", "/api/settings/home_intro", { value: introText });
    },
    onSuccess: () => {
      toast({ title: "소개글 저장 완료" });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: (err: Error) => {
      toast({ title: "저장 실패", description: err.message, variant: "destructive" });
    },
  });

  const saveLogoMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PUT", "/api/settings/logo_url", { value: logoUrl });
    },
    onSuccess: () => {
      toast({ title: "로고 저장 완료" });
      queryClient.invalidateQueries({ queryKey: ["/api/settings", "logo_url"] });
    },
    onError: (err: Error) => {
      toast({ title: "저장 실패", description: err.message, variant: "destructive" });
    },
  });

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  if (showEditor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <FormEditor
          form={editingForm}
          onSave={(data) => saveMutation.mutate(data)}
          onCancel={() => { setShowEditor(false); setEditingForm(null); }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold" data-testid="text-admin-title">관리자</h1>
        </div>
        <Button
          onClick={() => { setEditingForm(null); setShowEditor(true); }}
          data-testid="button-add-form"
        >
          <Plus className="w-4 h-4 mr-1" />
          양식 추가
        </Button>
      </div>

      <Tabs defaultValue="forms">
        <TabsList>
          <TabsTrigger value="forms" data-testid="tab-admin-forms">
            <FileText className="w-4 h-4 mr-1" />
            양식 관리
          </TabsTrigger>
          <TabsTrigger value="requests" data-testid="tab-admin-requests">
            <Inbox className="w-4 h-4 mr-1" />
            양식 신청
          </TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-admin-settings">
            <Settings className="w-4 h-4 mr-1" />
            사이트 설정
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forms" className="mt-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded-md animate-pulse" />
              ))}
            </div>
          ) : forms && forms.length > 0 ? (
            <div className="space-y-2">
              {forms.map((form) => (
                <Card key={form.id}>
                  <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{form.title}</span>
                        {form.isPopular && <Badge variant="secondary" className="text-[10px]">인기</Badge>}
                        {form.category && <Badge variant="outline" className="text-[10px]">{form.category}</Badge>}
                        {form.isVisible === false && <Badge variant="destructive" className="text-[10px]">숨김</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">/{form.slug}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => visibilityMutation.mutate({ id: form.id, isVisible: form.isVisible === false })}
                        title={form.isVisible === false ? "노출하기" : "숨기기"}
                        data-testid={`button-toggle-visibility-${form.id}`}
                      >
                        {form.isVisible === false ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setEditingForm(form); setShowEditor(true); }}
                        data-testid={`button-edit-form-${form.id}`}
                      >
                        수정
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`"${form.title}" 양식을 삭제하시겠습니까?`)) {
                            deleteMutation.mutate(form.id);
                          }
                        }}
                        data-testid={`button-delete-form-${form.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">등록된 양식이 없습니다.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="mt-4">
          <FormRequestsPanel />
        </TabsContent>

        <TabsContent value="settings" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-sm">로고 이미지</h3>
              <div className="space-y-3">
                <Input
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="로고 이미지 URL (예: https://example.com/logo.png)"
                  data-testid="input-logo-url"
                />
                {logoUrl && (
                  <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50" data-testid="container-logo-preview">
                    <img
                      src={logoUrl}
                      alt="로고 미리보기"
                      className="h-10 object-contain"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = "none";
                        const fallback = img.nextElementSibling;
                        if (fallback) fallback.textContent = "이미지를 불러올 수 없습니다";
                      }}
                      data-testid="img-logo-preview"
                    />
                    <span className="text-xs text-muted-foreground">미리보기</span>
                  </div>
                )}
              </div>
              <Button
                onClick={() => saveLogoMutation.mutate()}
                disabled={saveLogoMutation.isPending}
                data-testid="button-save-logo"
              >
                <Save className="w-4 h-4 mr-1" />
                로고 저장
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-sm">메인 페이지 소개글 (HTML)</h3>
              <Textarea
                value={introText}
                onChange={(e) => setIntroText(e.target.value)}
                rows={8}
                className="font-mono text-xs"
                placeholder="<h3>딸기폼 소개</h3><p>딸기폼은...</p>"
                data-testid="input-intro-text"
              />
              <Button
                onClick={() => saveIntroMutation.mutate()}
                disabled={saveIntroMutation.isPending}
                data-testid="button-save-intro"
              >
                <Save className="w-4 h-4 mr-1" />
                소개글 저장
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
