import { useState, forwardRef, useCallback } from "react";

function getToday() {
  const d = new Date();
  return {
    year: String(d.getFullYear()),
    month: String(d.getMonth() + 1).padStart(2, "0"),
    day: String(d.getDate()).padStart(2, "0"),
  };
}

const CertificateOfEmploymentForm = forwardRef<HTMLDivElement>((_, ref) => {
  const today = getToday();

  const [person, setPerson] = useState({
    name: "",
    idNumber: "",
    address: "",
  });

  const [work, setWork] = useState({
    department: "",
    position: "",
    startYear: "",
    startMonth: "",
    startDay: "",
    endYear: today.year,
    endMonth: today.month,
    endDay: today.day,
    purpose: "",
  });

  const [company, setCompany] = useState({
    name: "",
    representative: "",
    bizNumber: "",
    address: "",
    phone: "",
  });

  const [docDate, setDocDate] = useState({
    year: today.year,
    month: today.month,
    day: today.day,
  });

  const handleEnter = useCallback((e: React.KeyboardEvent, nextTestId: string) => {
    if (e.key === "Enter" && !(e.nativeEvent as any).isComposing) {
      e.preventDefault();
      const next = document.querySelector(`[data-testid="${nextTestId}"]`) as HTMLInputElement;
      if (next) next.focus();
    }
  }, []);

  const hl = "bg-[#fff9c4]";
  const baseFont = "Pretendard, sans-serif";

  const thStyle: React.CSSProperties = {
    border: "1px solid #333",
    padding: "6px 10px",
    height: 32,
    textAlign: "left",
    fontWeight: 500,
    backgroundColor: "#fafafa",
    fontSize: 13,
    whiteSpace: "nowrap",
  };

  const tdStyle: React.CSSProperties = {
    border: "1px solid #333",
    padding: "4px 8px",
    height: 32,
    fontSize: 13,
  };

  const inputStyle = `border-none outline-none text-[13px] w-full ${hl}`;
  const narrowInput = `border-none outline-none text-[13px] w-[40px] text-center ${hl}`;

  return (
    <div
      ref={ref}
      className="bg-white px-12 py-10 mx-auto"
      style={{ maxWidth: 850, minWidth: 640, fontFamily: baseFont, color: "#222" }}
      data-testid="certificate-of-employment-form"
    >
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "8px", margin: 0 }}>
          재 직 증 명 서
        </h2>
      </div>

      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>1. 인적사항</div>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24 }}>
        <tbody>
          <tr>
            <th style={{ ...thStyle, width: "18%" }}>성명 (한글)</th>
            <td style={tdStyle}>
              <input
                className={inputStyle}
                value={person.name}
                onChange={e => setPerson(p => ({ ...p, name: e.target.value }))}
                placeholder="홍길동"
                data-testid="input-person-name"
                onKeyDown={e => handleEnter(e, "input-id-number")}
              />
            </td>
            <th style={{ ...thStyle, width: "18%" }}>주민등록번호</th>
            <td style={tdStyle}>
              <input
                className={inputStyle}
                value={person.idNumber}
                onChange={e => {
                  let v = e.target.value.replace(/[^0-9-]/g, "");
                  const digits = v.replace(/-/g, "");
                  if (digits.length > 6 && !v.includes("-")) {
                    v = digits.slice(0, 6) + "-" + digits.slice(6, 13);
                  }
                  if (digits.length > 13) return;
                  setPerson(p => ({ ...p, idNumber: v }));
                }}
                placeholder="000000-0000000"
                maxLength={14}
                data-testid="input-id-number"
                onKeyDown={e => handleEnter(e, "input-address")}
              />
            </td>
          </tr>
          <tr>
            <th style={thStyle}>주소</th>
            <td style={tdStyle} colSpan={3}>
              <input
                className={inputStyle}
                value={person.address}
                onChange={e => setPerson(p => ({ ...p, address: e.target.value }))}
                placeholder="서울특별시 강남구 테헤란로 123"
                data-testid="input-address"
                onKeyDown={e => handleEnter(e, "input-department")}
              />
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>2. 재직사항 및 제출용도</div>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24 }}>
        <tbody>
          <tr>
            <th style={{ ...thStyle, width: "18%" }}>근무부서</th>
            <td style={tdStyle}>
              <input
                className={inputStyle}
                value={work.department}
                onChange={e => setWork(p => ({ ...p, department: e.target.value }))}
                placeholder="경영지원팀"
                data-testid="input-department"
                onKeyDown={e => handleEnter(e, "input-position")}
              />
            </td>
            <th style={{ ...thStyle, width: "18%" }}>직위</th>
            <td style={tdStyle}>
              <input
                className={inputStyle}
                value={work.position}
                onChange={e => setWork(p => ({ ...p, position: e.target.value }))}
                placeholder="대리"
                data-testid="input-position"
                onKeyDown={e => handleEnter(e, "input-start-year")}
              />
            </td>
          </tr>
          <tr>
            <th style={thStyle}>재직기간</th>
            <td style={tdStyle} colSpan={3}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 2, fontSize: 13, flexWrap: "wrap" }}>
                <input
                  className={narrowInput}
                  value={work.startYear}
                  onChange={e => { const v = e.target.value.replace(/\D/g, "").slice(0, 4); setWork(p => ({ ...p, startYear: v })); }}
                  placeholder="2020"
                  maxLength={4}
                  data-testid="input-start-year"
                  onKeyDown={e => handleEnter(e, "input-start-month")}
                />
                <span>년</span>
                <input
                  className={narrowInput}
                  style={{ width: 28 }}
                  value={work.startMonth}
                  onChange={e => { const v = e.target.value.replace(/\D/g, "").slice(0, 2); setWork(p => ({ ...p, startMonth: v })); }}
                  placeholder="01"
                  maxLength={2}
                  data-testid="input-start-month"
                  onKeyDown={e => handleEnter(e, "input-start-day")}
                />
                <span>월</span>
                <input
                  className={narrowInput}
                  style={{ width: 28 }}
                  value={work.startDay}
                  onChange={e => { const v = e.target.value.replace(/\D/g, "").slice(0, 2); setWork(p => ({ ...p, startDay: v })); }}
                  placeholder="01"
                  maxLength={2}
                  data-testid="input-start-day"
                  onKeyDown={e => handleEnter(e, "input-end-year")}
                />
                <span>일 부터</span>
                <span style={{ marginLeft: 12 }} />
                <input
                  className={narrowInput}
                  value={work.endYear}
                  onChange={e => { const v = e.target.value.replace(/\D/g, "").slice(0, 4); setWork(p => ({ ...p, endYear: v })); }}
                  placeholder={today.year}
                  maxLength={4}
                  data-testid="input-end-year"
                  onKeyDown={e => handleEnter(e, "input-end-month")}
                />
                <span>년</span>
                <input
                  className={narrowInput}
                  style={{ width: 28 }}
                  value={work.endMonth}
                  onChange={e => { const v = e.target.value.replace(/\D/g, "").slice(0, 2); setWork(p => ({ ...p, endMonth: v })); }}
                  placeholder={today.month}
                  maxLength={2}
                  data-testid="input-end-month"
                  onKeyDown={e => handleEnter(e, "input-end-day")}
                />
                <span>월</span>
                <input
                  className={narrowInput}
                  style={{ width: 28 }}
                  value={work.endDay}
                  onChange={e => { const v = e.target.value.replace(/\D/g, "").slice(0, 2); setWork(p => ({ ...p, endDay: v })); }}
                  placeholder={today.day}
                  maxLength={2}
                  data-testid="input-end-day"
                  onKeyDown={e => handleEnter(e, "input-purpose")}
                />
                <span>일 현재까지</span>
              </span>
            </td>
          </tr>
          <tr>
            <th style={thStyle}>제출용도</th>
            <td style={tdStyle} colSpan={3}>
              <input
                className={inputStyle}
                value={work.purpose}
                onChange={e => setWork(p => ({ ...p, purpose: e.target.value }))}
                placeholder="은행 대출용, 이직 제출용 등"
                data-testid="input-purpose"
                onKeyDown={e => handleEnter(e, "input-doc-year")}
              />
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ textAlign: "center", fontSize: 18, margin: "70px 0 28px", fontWeight: 400 }}>
        위의 기재사항이 사실과 다름없음을 증명합니다.
      </div>

      <div style={{ textAlign: "center", margin: "48px 0 0" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 16 }}>
          <input
            className={narrowInput}
            value={docDate.year}
            onChange={e => { const v = e.target.value.replace(/\D/g, "").slice(0, 4); setDocDate(p => ({ ...p, year: v })); }}
            maxLength={4}
            data-testid="input-doc-year"
            onKeyDown={e => handleEnter(e, "input-doc-month")}
          />
          <span style={{ fontWeight: 500 }}>년</span>
          <input
            className={narrowInput}
            style={{ width: 28 }}
            value={docDate.month}
            onChange={e => { const v = e.target.value.replace(/\D/g, "").slice(0, 2); setDocDate(p => ({ ...p, month: v })); }}
            maxLength={2}
            data-testid="input-doc-month"
            onKeyDown={e => handleEnter(e, "input-doc-day")}
          />
          <span style={{ fontWeight: 500 }}>월</span>
          <input
            className={narrowInput}
            style={{ width: 28 }}
            value={docDate.day}
            onChange={e => { const v = e.target.value.replace(/\D/g, "").slice(0, 2); setDocDate(p => ({ ...p, day: v })); }}
            maxLength={2}
            data-testid="input-doc-day"
            onKeyDown={e => handleEnter(e, "input-company-name")}
          />
          <span style={{ fontWeight: 500 }}>일</span>
        </span>
      </div>

      <div style={{ minHeight: 280 }} />

      <div style={{ paddingLeft: 20 }}>
        {[
          { label: "회 사 명", key: "name" as const, placeholder: "주식회사 딸기컴퍼니", testId: "input-company-name", nextId: "input-representative" },
          { label: "대 표 자", key: "representative" as const, placeholder: "대표자 이름", testId: "input-representative", nextId: "input-biz-number", suffix: "(인)" },
          { label: "사업자등록", key: "bizNumber" as const, placeholder: "000-00-00000", testId: "input-biz-number", nextId: "input-company-address" },
          { label: "주 &nbsp;&nbsp;&nbsp;소", key: "address" as const, placeholder: "서울특별시 강남구 테헤란로 456", testId: "input-company-address", nextId: "input-company-phone" },
          { label: "전 &nbsp;&nbsp;&nbsp;화", key: "phone" as const, placeholder: "02-1234-5678", testId: "input-company-phone", nextId: "" },
        ].map((item, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "center", marginBottom: 6, fontSize: 13 }}>
            <span
              style={{ width: 90, flexShrink: 0, fontWeight: 500 }}
              dangerouslySetInnerHTML={{ __html: item.label }}
            />
            <span style={{ flex: 1, display: "flex", alignItems: "center", maxWidth: item.suffix ? "60%" : undefined }}>
              <input
                className={inputStyle}
                style={{ borderBottom: "1px solid #ccc", flex: 1 }}
                value={company[item.key]}
                onChange={e => {
                  if (item.key === "bizNumber") {
                    let v = e.target.value.replace(/[^0-9-]/g, "");
                    const digits = v.replace(/-/g, "");
                    if (digits.length > 3 && digits.length <= 5 && !v.includes("-")) {
                      v = digits.slice(0, 3) + "-" + digits.slice(3);
                    } else if (digits.length > 5 && v.split("-").length < 3) {
                      v = digits.slice(0, 3) + "-" + digits.slice(3, 5) + "-" + digits.slice(5, 10);
                    }
                    if (digits.length > 10) return;
                    setCompany(p => ({ ...p, bizNumber: v }));
                  } else {
                    setCompany(p => ({ ...p, [item.key]: e.target.value }));
                  }
                }}
                placeholder={item.placeholder}
                maxLength={item.key === "bizNumber" ? 12 : undefined}
                data-testid={item.testId}
                onKeyDown={e => item.nextId && handleEnter(e, item.nextId)}
              />
              {item.suffix && <span style={{ marginLeft: 12, fontWeight: 500, flexShrink: 0 }}>{item.suffix}</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

CertificateOfEmploymentForm.displayName = "CertificateOfEmploymentForm";

export { CertificateOfEmploymentForm };
