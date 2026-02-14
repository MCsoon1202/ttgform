import { useState, forwardRef, useCallback } from "react";

function getToday() {
  const d = new Date();
  return {
    year: String(d.getFullYear()),
    month: String(d.getMonth() + 1).padStart(2, "0"),
    day: String(d.getDate()).padStart(2, "0"),
  };
}

const PowerOfAttorneyForm = forwardRef<HTMLDivElement>((_, ref) => {
  const today = getToday();

  const [delegator, setDelegator] = useState({
    name: "",
    idNumber: "",
    address: "",
    phone: "",
  });

  const [agent, setAgent] = useState({
    name: "",
    idNumber: "",
    address: "",
    phone: "",
    relation: "",
  });

  const [details, setDetails] = useState("");

  const [footer, setFooter] = useState({
    year: today.year,
    month: today.month,
    day: today.day,
    delegatorName: "",
  });

  const hl = "bg-[#fff9c4]";
  const inputBase = `border-none outline-none text-[13px] ${hl}`;
  const inputInline = `${inputBase} border-b border-b-gray-400 px-1`;
  const inputNarrow = `${inputBase} border-b border-b-gray-400 px-1 w-[50px] text-center`;
  const labelStyle = "font-bold text-[13px] tracking-[0.15em]";
  const sectionLabel = "font-bold text-[14px] tracking-[0.2em] border-b-2 border-gray-800 pb-1 mb-3";

  const handleEnter = useCallback((e: React.KeyboardEvent, nextTestId: string) => {
    if (e.key === "Enter" && !(e.nativeEvent as any).isComposing) {
      e.preventDefault();
      const next = document.querySelector(`[data-testid="${nextTestId}"]`) as HTMLInputElement;
      if (next) next.focus();
    }
  }, []);

  return (
    <div
      ref={ref}
      className="bg-white px-10 py-8 mx-auto"
      style={{ maxWidth: 700, minWidth: 640, fontFamily: "Pretendard, sans-serif", color: "#222", fontSize: 13, lineHeight: 1.8 }}
      data-testid="power-of-attorney-form"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black tracking-[0.5em]" style={{ letterSpacing: "0.5em" }}>
          위 임 장
        </h2>
      </div>

      <div className="mb-6">
        <p className={sectionLabel}>위 임 자</p>
        <div className="space-y-1.5 ml-2">
          <div className="flex items-center gap-1">
            <span className={`${labelStyle} w-[100px]`}>성 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;명 :</span>
            <input
              value={delegator.name}
              onChange={e => setDelegator(p => ({ ...p, name: e.target.value }))}
              className={`${inputInline} flex-1`}
              placeholder="업무를 맡기는 자 이름"
              data-testid="input-delegator-name"
              onKeyDown={e => handleEnter(e, "input-delegator-id")}
            />
          </div>
          <div className="flex items-center gap-1">
            <span className={`${labelStyle} w-[100px]`}>주민등록번호 :</span>
            <input
              value={delegator.idNumber}
              onChange={e => setDelegator(p => ({ ...p, idNumber: e.target.value }))}
              className={`${inputInline} flex-1`}
              data-testid="input-delegator-id"
              onKeyDown={e => handleEnter(e, "input-delegator-address")}
            />
          </div>
          <div className="flex items-center gap-1">
            <span className={`${labelStyle} w-[100px]`}>주 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;소 :</span>
            <input
              value={delegator.address}
              onChange={e => setDelegator(p => ({ ...p, address: e.target.value }))}
              className={`${inputInline} flex-1`}
              data-testid="input-delegator-address"
              onKeyDown={e => handleEnter(e, "input-delegator-phone")}
            />
          </div>
          <div className="flex items-center gap-1">
            <span className={`${labelStyle} w-[100px]`}>전 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;화 :</span>
            <input
              value={delegator.phone}
              onChange={e => setDelegator(p => ({ ...p, phone: e.target.value }))}
              className={`${inputInline} flex-1`}
              data-testid="input-delegator-phone"
              onKeyDown={e => handleEnter(e, "input-agent-name")}
            />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <p className={sectionLabel}>수 임 자</p>
        <div className="space-y-1.5 ml-2">
          <div className="flex items-center gap-1">
            <span className={`${labelStyle} w-[100px]`}>성 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;명 :</span>
            <input
              value={agent.name}
              onChange={e => setAgent(p => ({ ...p, name: e.target.value }))}
              className={`${inputInline} flex-1`}
              placeholder="업무를 대신 해주는 자 이름"
              data-testid="input-agent-name"
              onKeyDown={e => handleEnter(e, "input-agent-id")}
            />
          </div>
          <div className="flex items-center gap-1">
            <span className={`${labelStyle} w-[100px]`}>주민등록번호 :</span>
            <input
              value={agent.idNumber}
              onChange={e => setAgent(p => ({ ...p, idNumber: e.target.value }))}
              className={`${inputInline} flex-1`}
              data-testid="input-agent-id"
              onKeyDown={e => handleEnter(e, "input-agent-address")}
            />
          </div>
          <div className="flex items-center gap-1">
            <span className={`${labelStyle} w-[100px]`}>주 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;소 :</span>
            <input
              value={agent.address}
              onChange={e => setAgent(p => ({ ...p, address: e.target.value }))}
              className={`${inputInline} flex-1`}
              data-testid="input-agent-address"
              onKeyDown={e => handleEnter(e, "input-agent-phone")}
            />
          </div>
          <div className="flex items-center gap-1">
            <span className={`${labelStyle} w-[100px]`}>전 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;화 :</span>
            <input
              value={agent.phone}
              onChange={e => setAgent(p => ({ ...p, phone: e.target.value }))}
              className={`${inputInline} flex-1`}
              data-testid="input-agent-phone"
              onKeyDown={e => handleEnter(e, "input-agent-relation")}
            />
          </div>
          <div className="flex items-center gap-1">
            <span className={`${labelStyle} w-[100px]`}>관 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;계 :</span>
            <input
              value={agent.relation}
              onChange={e => setAgent(p => ({ ...p, relation: e.target.value }))}
              className={`${inputInline} flex-1`}
              data-testid="input-agent-relation"
              onKeyDown={e => handleEnter(e, "input-details")}
            />
          </div>
        </div>
      </div>

      <div className="mb-6 text-[13px] leading-relaxed">
        <p>상기 위임자는 수임자에게 아래의 위임사항을 위임합니다.</p>
      </div>

      <div className="mb-8">
        <div className="border border-gray-800 p-4 relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white px-3">
            <span className="font-bold text-[14px] tracking-[0.3em] border border-gray-800 px-3 py-0.5">위 임 사 항</span>
          </div>
          <textarea
            value={details}
            onChange={e => setDetails(e.target.value)}
            className={`border-none outline-none text-[13px] w-full min-h-[160px] mt-3 resize-none leading-relaxed ${hl}`}
            data-testid="input-details"
            style={{ fontSize: 13 }}
          />
        </div>
      </div>

      <div className="mb-4 text-[13px]">
        <p>첨 부 : 인감증명서 1부.</p>
      </div>

      <div className="text-center mb-4 mt-6">
        <span className="inline-flex items-center gap-0">
          <span className={labelStyle}>위 임 일 자 :</span>
          <input
            value={footer.year}
            onChange={e => { const v = e.target.value.replace(/\D/g, "").slice(0, 4); setFooter(p => ({ ...p, year: v })); }}
            className={`${inputNarrow} w-[60px]`}
            placeholder="____"
            maxLength={4}
            data-testid="input-footer-year"
            onKeyDown={e => handleEnter(e, "input-footer-month")}
          />
          <span className={labelStyle}>년</span>
          <input
            value={footer.month}
            onChange={e => { const v = e.target.value.replace(/\D/g, "").slice(0, 2); setFooter(p => ({ ...p, month: v })); }}
            className={inputNarrow}
            placeholder="__"
            maxLength={2}
            data-testid="input-footer-month"
            onKeyDown={e => handleEnter(e, "input-footer-day")}
          />
          <span className={labelStyle}>월</span>
          <input
            value={footer.day}
            onChange={e => { const v = e.target.value.replace(/\D/g, "").slice(0, 2); setFooter(p => ({ ...p, day: v })); }}
            className={inputNarrow}
            placeholder="__"
            maxLength={2}
            data-testid="input-footer-day"
            onKeyDown={e => handleEnter(e, "input-footer-delegator-name")}
          />
          <span className={labelStyle}>일</span>
        </span>
      </div>

      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1">
          <span className={labelStyle}>위 임 자 :</span>
          <input
            value={footer.delegatorName}
            onChange={e => setFooter(p => ({ ...p, delegatorName: e.target.value }))}
            className={`${inputInline} w-[150px]`}
            data-testid="input-footer-delegator-name"
          />
          <span className={labelStyle}>(인)</span>
        </span>
      </div>

      <div className="text-right text-[13px] font-bold">
        <p>귀중</p>
      </div>
    </div>
  );
});

PowerOfAttorneyForm.displayName = "PowerOfAttorneyForm";

export { PowerOfAttorneyForm };
