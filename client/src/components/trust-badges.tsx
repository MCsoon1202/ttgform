import { Shield, UserX, Smartphone, CircleDollarSign } from "lucide-react";

const badges = [
  { icon: UserX, label: "회원가입 없음", desc: "바로 작성 가능" },
  { icon: Shield, label: "개인정보 저장 안함", desc: "데이터 미보관" },
  { icon: Smartphone, label: "모바일 PDF 가능", desc: "어디서든 저장" },
  { icon: CircleDollarSign, label: "완전 무료", desc: "비용 없이 사용" },
];

export function TrustBadges() {
  return (
    <section className="w-full max-w-6xl mx-auto" data-testid="trust-badges">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-border rounded-md overflow-hidden">
        {badges.map((b, i) => (
          <div
            key={b.label}
            className={`flex items-center justify-center gap-3 px-5 py-4 ${i < badges.length - 1 ? "md:border-r border-border" : ""} ${i < 2 ? "border-b md:border-b-0 border-border" : ""}`}
          >
            <b.icon className="w-5 h-5 text-primary flex-shrink-0" />
            <div className="text-center">
              <p className="text-sm font-bold leading-tight">{b.label}</p>
              <p className="text-xs text-muted-foreground font-medium">{b.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
