import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Send, Paperclip, X, FileText, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { useSeo } from "@/hooks/use-seo";

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.pdf', '.xlsx', '.xls', '.csv', '.hwp', '.hwpx', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.rtf', '.odt', '.ods'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function FormRequest() {
  useSeo({
    title: "양식 신청하기 | 딸기폼",
    description: "필요한 양식이 없으시다면 신청해주세요. 검토 후 제작하여 제공해드립니다.",
  });

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<{ name: string; data: string } | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: async (data: { title: string; content: string; fileName: string | null; fileData: string | null }) => {
      const res = await apiRequest("POST", "/api/form-requests", data);
      return res.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      setTitle("");
      setContent("");
      setFile(null);
    },
    onError: (error: any) => {
      toast({
        title: "신청 실패",
        description: error.message || "양식 신청 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const ext = '.' + f.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      toast({
        title: "파일 형식 오류",
        description: "이미지, PDF, 엑셀, 한글 파일만 첨부할 수 있습니다. (exe, zip 등 실행 파일은 불가)",
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }

    if (f.size > MAX_FILE_SIZE) {
      toast({
        title: "파일 크기 초과",
        description: "파일 크기는 10MB 이하만 가능합니다.",
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFile({ name: f.name, data: reader.result as string });
    };
    reader.readAsDataURL(f);
    e.target.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({ title: "제목을 입력해주세요.", variant: "destructive" });
      return;
    }
    if (!content.trim()) {
      toast({ title: "내용을 입력해주세요.", variant: "destructive" });
      return;
    }
    mutation.mutate({
      title: title.trim(),
      content: content.trim(),
      fileName: file?.name || null,
      fileData: file?.data || null,
    });
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-3">양식 신청이 완료되었습니다</h2>
        <p className="text-muted-foreground mb-6">
          검토 후 양식을 제작하여 사이트에 등록하겠습니다.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/">
            <Button variant="outline" data-testid="button-go-home">홈으로 돌아가기</Button>
          </Link>
          <Button onClick={() => setSubmitted(false)} data-testid="button-request-more">
            추가 신청하기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2" data-testid="text-page-title">양식 신청하기</h1>
        <p className="text-muted-foreground" data-testid="text-page-desc">
          필요한 양식이 없나요? 아래에 신청해주세요. 검토 후 양식을 제작 하겠습니다.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="request-title" className="text-sm font-medium">제목</Label>
              <Input
                id="request-title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="예: 퇴직금 정산서 양식이 필요합니다"
                className="mt-1"
                data-testid="input-request-title"
              />
            </div>

            <div>
              <Label htmlFor="request-content" className="text-sm font-medium">내용</Label>
              <Textarea
                id="request-content"
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="어떤 양식이 필요한지 상세히 적어주세요. 참고할 양식이 있다면 설명해주시면 더 빠르게 제작할 수 있습니다."
                className="mt-1 min-h-[160px]"
                data-testid="input-request-content"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">첨부파일 (선택)</Label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                참고할 양식 파일이 있으면 첨부해주세요. (이미지, PDF, 엑셀, 한글 파일만 가능 / 최대 10MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.pdf,.xlsx,.xls,.csv,.hwp,.hwpx,.doc,.docx,.ppt,.pptx,.txt,.rtf,.odt,.ods"
                onChange={handleFileSelect}
                className="hidden"
                data-testid="input-file-upload"
              />
              {file ? (
                <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/30">
                  <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm truncate flex-1" data-testid="text-file-name">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setFile(null)}
                    data-testid="button-remove-file"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="button-attach-file"
                >
                  <Paperclip className="w-4 h-4 mr-2" />
                  파일 첨부하기
                </Button>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending}
              data-testid="button-submit-request"
            >
              {mutation.isPending ? (
                "신청 중..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  양식 신청하기
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
