import { useState, forwardRef, useCallback } from "react";

const EmploymentContractForm = forwardRef<HTMLDivElement>((_, ref) => {
  const [employer, setEmployer] = useState({
    name: "",
    address: "",
    representative: "",
    phone: "",
  });

  const [worker, setWorker] = useState({
    name: "",
    address: "",
    contact: "",
    signName: "",
  });

  const [contract, setContract] = useState({
    startYear: "",
    startMonth: "",
    startDay: "",
    endYear: "",
    endMonth: "",
    endDay: "",
    workplace: "",
    duties: "",
    workHoursDaily: "",
    workHoursWeekly: "",
    workSchedule: "",
    workDaysTime: "",
    breakTime: "",
    dayOff: "",
    wage: "",
    wageType: "월급",
    basicPay: "",
    extra1Name: "",
    extra2Name: "",
    extra3Name: "",
    extra1Pay: "",
    extra2Pay: "",
    extra3Pay: "",
    payCalc: "",
    extra1Calc: "",
    extra2Calc: "",
    extra3Calc: "",
    payStartMonth: "",
    payStartDay: "",
    payEndMonth: "",
    payEndDay: "",
    payDateMonth: "",
    payDateDay: "",
    payHolidayNote: "",
    payDirect: false,
    payBank: false,
    confirmName: "",
    yearSign: "",
    monthSign: "",
    daySign: "",
  });

  const [insurance, setInsurance] = useState({
    employment: false,
    industrial: false,
    pension: false,
    health: false,
  });

  const [etc, setEtc] = useState("");

  const formatComma = (val: string) => {
    const nums = val.replace(/[^\d]/g, "");
    if (!nums) return "";
    return Number(nums).toLocaleString();
  };

  const handleMoneyChange = (field: string, val: string) => {
    setContract(p => ({ ...p, [field]: formatComma(val) }));
  };

  const hl = "bg-[#fff9c4]";
  const inputBase = `border-none outline-none font-[NanumSquare] text-[12px] ${hl}`;
  const inputInline = `${inputBase} border-b border-b-gray-400 px-1 min-w-[60px]`;
  const inputNarrow = `${inputBase} border-b border-b-gray-400 px-1 w-[36px] text-center`;
  const inputMid = `${inputBase} border-b border-b-gray-400 px-1 w-[70px] text-center`;
  const sectionTitle = "font-bold text-[12px] mt-1 mb-0.5";
  const subText = "text-[10px] text-gray-500 ml-4 leading-snug";
  const labelBold = "font-bold text-[12px]";

  const handleEnter = useCallback((e: React.KeyboardEvent, nextTestId: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const next = document.querySelector(`[data-testid="${nextTestId}"]`) as HTMLInputElement;
      if (next) next.focus();
    }
  }, []);

  return (
    <div
      ref={ref}
      className="bg-white px-8 py-4 mx-auto"
      style={{ maxWidth: 780, minWidth: 640, fontFamily: "NanumSquare, sans-serif", color: "#333", fontSize: 12, lineHeight: 1.6 }}
      data-testid="employment-contract-form"
    >
      <style>{`
        .print-placeholder::placeholder { color: #999; font-size: 10px; }
        @media print { .print-placeholder::placeholder { color: transparent !important; } }
      `}</style>

      <div className="text-center mb-3 border-2 border-gray-800 py-2">
        <h2 className="text-lg font-black tracking-[0.3em]">
          표준근로계약서(5인 미만 사업장)
        </h2>
      </div>

      <div className="mb-2" style={{ lineHeight: 1.8 }}>
        <span className="inline-flex items-center flex-wrap gap-0">
          <input value={employer.name} onChange={e => setEmployer(p => ({ ...p, name: e.target.value }))} className={`${inputInline} w-[130px]`} placeholder="사업주명" data-testid="input-employer-name" onKeyDown={e => handleEnter(e, "input-worker-name-top")} />
          <span className={labelBold}>(이하 "사업주"라 함)과(와)</span>
          <input value={worker.name} onChange={e => { const v = e.target.value; setWorker(p => ({ ...p, name: v, signName: p.signName === p.name || !p.signName ? v : p.signName })); }} className={`${inputInline} w-[130px]`} placeholder="근로자명" data-testid="input-worker-name-top" onKeyDown={e => handleEnter(e, "input-start-year")} />
          <span className={labelBold}>(이하 "근로자"라 함)은</span>
        </span>
        <br />
        <span className={labelBold}>다음과 같이 근로계약을 체결한다.</span>
      </div>

      <div className="mb-1.5">
        <p className={sectionTitle}>
          1. 근로계약기간 :
          <span className="font-normal ml-2">
            <input value={contract.startYear} onChange={e => { const v = e.target.value.replace(/\D/g, "").slice(0, 4); setContract(p => ({ ...p, startYear: v })); }} className={inputNarrow} placeholder="____" maxLength={4} data-testid="input-start-year" onKeyDown={e => handleEnter(e, "input-start-month")} />
            <span className={labelBold}>년</span>
            <input value={contract.startMonth} onChange={e => { const v = e.target.value.replace(/\D/g, "").slice(0, 2); setContract(p => ({ ...p, startMonth: v })); }} className={inputNarrow} placeholder="__" maxLength={2} data-testid="input-start-month" onKeyDown={e => handleEnter(e, "input-start-day")} />
            <span className={labelBold}>월</span>
            <input value={contract.startDay} onChange={e => { const v = e.target.value.replace(/\D/g, "").slice(0, 2); setContract(p => ({ ...p, startDay: v })); }} className={inputNarrow} placeholder="__" maxLength={2} data-testid="input-start-day" onKeyDown={e => handleEnter(e, "input-end-year")} />
            <span className={labelBold}>일부터</span>
          </span>
        </p>
        <p className="ml-8 text-[10px] text-gray-500">* 계약기간의 정함이 있는 경우에는 계약만료일을 명시한다.</p>
        <p className="ml-6 mt-0.5">
          <input value={contract.endYear} onChange={e => { const v = e.target.value.replace(/\D/g, "").slice(0, 4); setContract(p => ({ ...p, endYear: v })); }} className={inputNarrow} placeholder="____" maxLength={4} data-testid="input-end-year" onKeyDown={e => handleEnter(e, "input-end-month")} />
          <span className={labelBold}>년</span>
          <input value={contract.endMonth} onChange={e => { const v = e.target.value.replace(/\D/g, "").slice(0, 2); setContract(p => ({ ...p, endMonth: v })); }} className={inputNarrow} placeholder="__" maxLength={2} data-testid="input-end-month" onKeyDown={e => handleEnter(e, "input-end-day")} />
          <span className={labelBold}>월</span>
          <input value={contract.endDay} onChange={e => { const v = e.target.value.replace(/\D/g, "").slice(0, 2); setContract(p => ({ ...p, endDay: v })); }} className={inputNarrow} placeholder="__" maxLength={2} data-testid="input-end-day" onKeyDown={e => handleEnter(e, "input-workplace")} />
          <span className={labelBold}>일까지</span>
        </p>
      </div>

      <div className="mb-1">
        <p className={sectionTitle}>
          2. 근 무 장 소 :
          <input value={contract.workplace} onChange={e => setContract(p => ({ ...p, workplace: e.target.value }))} className={`${inputInline} w-[380px]`} placeholder="" data-testid="input-workplace" onKeyDown={e => handleEnter(e, "input-duties")} />
        </p>
      </div>

      <div className="mb-1">
        <p className={sectionTitle}>
          3. 업무의 내용 :
          <input value={contract.duties} onChange={e => setContract(p => ({ ...p, duties: e.target.value }))} className={`${inputInline} w-[380px]`} placeholder="" data-testid="input-duties" onKeyDown={e => handleEnter(e, "input-work-schedule")} />
        </p>
      </div>

      <div className="mb-1">
        <p className={sectionTitle}>4. 소정근로시간 및 휴일</p>
        <p className="ml-4 mb-0.5">
          <span className={labelBold}>- 소정근로시간:</span>
          <input value={contract.workSchedule} onChange={e => setContract(p => ({ ...p, workSchedule: e.target.value }))} className={`${inputInline} w-[180px]`} placeholder="" data-testid="input-work-schedule" onKeyDown={e => handleEnter(e, "input-work-hours-daily")} />
          <span className={labelBold}>(1일</span>
          <input value={contract.workHoursDaily} onChange={e => setContract(p => ({ ...p, workHoursDaily: e.target.value }))} className={inputNarrow} placeholder="" data-testid="input-work-hours-daily" onKeyDown={e => handleEnter(e, "input-work-hours-weekly")} />
          <span className={labelBold}>시간, 1주</span>
          <input value={contract.workHoursWeekly} onChange={e => setContract(p => ({ ...p, workHoursWeekly: e.target.value }))} className={inputNarrow} placeholder="" data-testid="input-work-hours-weekly" onKeyDown={e => handleEnter(e, "input-work-days-time")} />
          <span className={labelBold}>시간)</span>
        </p>
        <p className="ml-4 mb-0.5">
          <span className={labelBold}>- 근로일 및 근로시간:</span>
          <input value={contract.workDaysTime} onChange={e => setContract(p => ({ ...p, workDaysTime: e.target.value }))} className={`${inputInline} w-[180px]`} placeholder="" data-testid="input-work-days-time" onKeyDown={e => handleEnter(e, "input-break-time")} />
          <span className={labelBold}>(휴게시간:</span>
          <input value={contract.breakTime} onChange={e => setContract(p => ({ ...p, breakTime: e.target.value }))} className={`${inputInline} w-[90px]`} placeholder="" data-testid="input-break-time" onKeyDown={e => handleEnter(e, "input-day-off")} />
          <span className={labelBold}>)</span>
        </p>
        <p className="ml-4 mb-0.5">
          <span className={labelBold}>- 휴일: 주휴일(</span>
          <input value={contract.dayOff} onChange={e => setContract(p => ({ ...p, dayOff: e.target.value }))} className={inputNarrow} placeholder="" data-testid="input-day-off" onKeyDown={e => handleEnter(e, "input-wage")} />
          <span className={labelBold}>)(주휴일은 주 15시간 이상 근무자에게 부여), 근로자의 날(5월 1일)</span>
        </p>
        <p className={subText}>* 사업장의 업무환경이나 형편 등을 감안하여 필요한 경우 당사자 간의 합의를 통해 시간<br />(시각) 및 근로일을 변경할 수 있으며, 변경된 근로시간은 사전에 근로자에게 서면교부한다.</p>
      </div>

      <div className="mb-1">
        <p className={sectionTitle}>
          5. 임 금 :
          <input value={contract.wage} onChange={e => handleMoneyChange("wage", e.target.value)} className={`${inputInline} w-[110px]`} placeholder="" data-testid="input-wage" onKeyDown={e => handleEnter(e, "input-basic-pay")} />
          <span className={labelBold}>원</span>
          <span className="ml-2">
            {["월급", "일급", "시급"].map(t => (
              <label key={t} className="inline-flex items-center mr-2 cursor-pointer">
                <input type="checkbox" checked={contract.wageType === t} onChange={() => setContract(p => ({ ...p, wageType: t }))} className="mr-0.5 accent-[#e57373]" data-testid={`checkbox-wage-${t}`} />
                <span className={labelBold}>{t}</span>
              </label>
            ))}
            <span className={labelBold}>(해당란에 체크)</span>
          </span>
        </p>

        <table className="w-full border-collapse border border-gray-600 mt-1 mb-1">
          <thead>
            <tr>
              <th className="border border-gray-600 bg-gray-100 text-[11px] font-bold px-1 py-1 w-[15%]">구성항목</th>
              <th className="border border-gray-600 bg-gray-100 text-[11px] font-bold px-1 py-1">기본급</th>
              <th className="border border-gray-600 bg-gray-100 text-[11px] font-bold px-1 py-1">
                <input value={contract.extra1Name} onChange={e => setContract(p => ({ ...p, extra1Name: e.target.value }))} className={`${inputBase} w-full px-1 text-center print-placeholder`} placeholder="추가항목 입력" data-testid="input-extra1-name" />
              </th>
              <th className="border border-gray-600 bg-gray-100 text-[11px] font-bold px-1 py-1">
                <input value={contract.extra2Name} onChange={e => setContract(p => ({ ...p, extra2Name: e.target.value }))} className={`${inputBase} w-full px-1 text-center print-placeholder`} placeholder="추가항목 입력" data-testid="input-extra2-name" />
              </th>
              <th className="border border-gray-600 bg-gray-100 text-[11px] font-bold px-1 py-1">
                <input value={contract.extra3Name} onChange={e => setContract(p => ({ ...p, extra3Name: e.target.value }))} className={`${inputBase} w-full px-1 text-center print-placeholder`} placeholder="추가항목 입력" data-testid="input-extra3-name" />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-600 text-[11px] font-bold px-1 py-1 text-center">금액</td>
              <td className={`border border-gray-600 px-1 py-0.5 ${hl}`}>
                <input value={contract.basicPay} onChange={e => handleMoneyChange("basicPay", e.target.value)} className={`${inputBase} w-full px-1`} placeholder="" data-testid="input-basic-pay" onKeyDown={e => handleEnter(e, "input-extra1-pay")} />
              </td>
              <td className={`border border-gray-600 px-1 py-0.5 ${hl}`}>
                <input value={contract.extra1Pay} onChange={e => handleMoneyChange("extra1Pay", e.target.value)} className={`${inputBase} w-full px-1`} placeholder="" data-testid="input-extra1-pay" onKeyDown={e => handleEnter(e, "input-extra2-pay")} />
              </td>
              <td className={`border border-gray-600 px-1 py-0.5 ${hl}`}>
                <input value={contract.extra2Pay} onChange={e => handleMoneyChange("extra2Pay", e.target.value)} className={`${inputBase} w-full px-1`} placeholder="" data-testid="input-extra2-pay" onKeyDown={e => handleEnter(e, "input-extra3-pay")} />
              </td>
              <td className={`border border-gray-600 px-1 py-0.5 ${hl}`}>
                <input value={contract.extra3Pay} onChange={e => handleMoneyChange("extra3Pay", e.target.value)} className={`${inputBase} w-full px-1`} placeholder="" data-testid="input-extra3-pay" onKeyDown={e => handleEnter(e, "input-pay-calc")} />
              </td>
            </tr>
            <tr>
              <td className="border border-gray-600 text-[11px] font-bold px-1 py-1 text-center">계산방법</td>
              <td className={`border border-gray-600 px-1 py-0.5 ${hl}`}>
                <input value={contract.payCalc} onChange={e => setContract(p => ({ ...p, payCalc: e.target.value }))} className={`${inputBase} w-full px-1`} placeholder="" data-testid="input-pay-calc" onKeyDown={e => handleEnter(e, "input-extra1-calc")} />
              </td>
              <td className={`border border-gray-600 px-1 py-0.5 ${hl}`}>
                <input value={contract.extra1Calc} onChange={e => setContract(p => ({ ...p, extra1Calc: e.target.value }))} className={`${inputBase} w-full px-1`} placeholder="" data-testid="input-extra1-calc" onKeyDown={e => handleEnter(e, "input-extra2-calc")} />
              </td>
              <td className={`border border-gray-600 px-1 py-0.5 ${hl}`}>
                <input value={contract.extra2Calc} onChange={e => setContract(p => ({ ...p, extra2Calc: e.target.value }))} className={`${inputBase} w-full px-1`} placeholder="" data-testid="input-extra2-calc" onKeyDown={e => handleEnter(e, "input-extra3-calc")} />
              </td>
              <td className={`border border-gray-600 px-1 py-0.5 ${hl}`}>
                <input value={contract.extra3Calc} onChange={e => setContract(p => ({ ...p, extra3Calc: e.target.value }))} className={`${inputBase} w-full px-1`} placeholder="" data-testid="input-extra3-calc" onKeyDown={e => handleEnter(e, "input-pay-start-month")} />
              </td>
            </tr>
          </tbody>
        </table>

        <p className="ml-4 mb-0.5">
          <span className={labelBold}>- 임금지급일 : 당월</span>
          <input value={contract.payStartMonth} onChange={e => setContract(p => ({ ...p, payStartMonth: e.target.value }))} className={inputNarrow} placeholder="" data-testid="input-pay-start-month" onKeyDown={e => handleEnter(e, "input-pay-start-day")} />
          <span className={labelBold}>일부터 당월</span>
          <input value={contract.payStartDay} onChange={e => setContract(p => ({ ...p, payStartDay: e.target.value }))} className={inputNarrow} placeholder="" data-testid="input-pay-start-day" onKeyDown={e => handleEnter(e, "input-pay-date-month")} />
          <span className={labelBold}>일까지 임금을 산정하여 익월</span>
          <input value={contract.payDateMonth} onChange={e => setContract(p => ({ ...p, payDateMonth: e.target.value }))} className={inputNarrow} placeholder="" data-testid="input-pay-date-month" onKeyDown={e => handleEnter(e, "input-pay-holiday-note")} />
          <span className={labelBold}>일에</span>
        </p>
        <p className="ml-6 mb-0.5">
          <span className={labelBold}>지급한다.(단, 휴(무)일의 경우에는</span>
          <input value={contract.payHolidayNote} onChange={e => setContract(p => ({ ...p, payHolidayNote: e.target.value }))} className={`${inputInline} w-[180px]`} placeholder="" data-testid="input-pay-holiday-note" onKeyDown={e => handleEnter(e, "input-confirm-name")} />
          <span className={labelBold}>)</span>
        </p>
        <p className="ml-4 mb-0.5">
          <span className={labelBold}>- 지급방법 : 근로자에게 직접지급(</span>
          <input type="checkbox" checked={contract.payDirect} onChange={e => setContract(p => ({ ...p, payDirect: e.target.checked }))} className="mr-0.5 accent-[#e57373]" data-testid="checkbox-pay-direct" />
          <span className={labelBold}>), 근로자 명의 예금통장에 입금(</span>
          <input type="checkbox" checked={contract.payBank} onChange={e => setContract(p => ({ ...p, payBank: e.target.checked }))} className="mr-0.5 accent-[#e57373]" data-testid="checkbox-pay-bank" />
          <span className={labelBold}>)</span>
        </p>
      </div>

      <div className="mb-1">
        <p className={sectionTitle}>6. 사회보험 적용여부(해당란에 체크)</p>
        <p className="ml-4">
          {[
            { key: "employment" as const, label: "고용보험" },
            { key: "industrial" as const, label: "산재보험" },
            { key: "pension" as const, label: "국민연금" },
            { key: "health" as const, label: "건강보험" },
          ].map(({ key, label }) => (
            <label key={key} className="inline-flex items-center mr-3 cursor-pointer">
              <input type="checkbox" checked={insurance[key]} onChange={e => setInsurance(p => ({ ...p, [key]: e.target.checked }))} className="mr-0.5 accent-[#e57373]" data-testid={`checkbox-insurance-${key}`} />
              <span className={labelBold}>{label}</span>
            </label>
          ))}
        </p>
      </div>

      <div className="mb-1">
        <p className={sectionTitle}>7. 근로계약서 교부</p>
        <p className={subText}>- 사업주는 근로계약을 체결함과 동시에 본 계약서를 사본하여 근로자의 교부<br />요구와 관계없이 근로자에게 교부함(근로기준법 제17조 이행)</p>
        <p className="ml-4 mt-0.5">
          <span className={labelBold}>* 교부받았음을 확인함. 확인자 성명</span>
          <input value={contract.confirmName} onChange={e => setContract(p => ({ ...p, confirmName: e.target.value }))} className={`${inputInline} w-[130px]`} placeholder="" data-testid="input-confirm-name" />
          <span className={labelBold}> (서명)</span>
        </p>
      </div>

      <div className="mb-1">
        <p className={sectionTitle}>8. 근로계약, 취업규칙 등의 성실한 이행의무</p>
        <p className={subText}>- 사업주와 근로자는 각자가 근로계약, 취업규칙, 단체협약을 지키고 성실하게 이행하여야 함</p>
      </div>

      <div className="mb-2">
        <p className={sectionTitle}>9. 기 타 : 이 계약에 정함이 없는 사항은 근로기준법령에 의함</p>
        <div className={`ml-4 mt-0.5 border-b border-gray-400 ${hl} min-h-[22px]`}>
          <input value={etc} onChange={e => setEtc(e.target.value)} className={`${inputBase} w-full px-1`} placeholder="" data-testid="input-etc" />
        </div>
      </div>

      <div className="text-center my-3">
        <span className="inline-flex items-center gap-0">
          <input value={contract.yearSign} onChange={e => { const v = e.target.value.replace(/\D/g, "").slice(0, 4); setContract(p => ({ ...p, yearSign: v })); }} className={`${inputMid}`} placeholder="____" maxLength={4} data-testid="input-sign-year" />
          <span className={`${labelBold} mx-1`}>년</span>
          <input value={contract.monthSign} onChange={e => { const v = e.target.value.replace(/\D/g, "").slice(0, 2); setContract(p => ({ ...p, monthSign: v })); }} className={inputNarrow} placeholder="__" maxLength={2} data-testid="input-sign-month" />
          <span className={`${labelBold} mx-1`}>월</span>
          <input value={contract.daySign} onChange={e => { const v = e.target.value.replace(/\D/g, "").slice(0, 2); setContract(p => ({ ...p, daySign: v })); }} className={inputNarrow} placeholder="__" maxLength={2} data-testid="input-sign-day" />
          <span className={`${labelBold} mx-1`}>일</span>
        </span>
      </div>

      <div className="space-y-1 text-[12px]">
        <div className="flex flex-wrap gap-x-1 items-center">
          <span className={`${labelBold} w-[70px]`}>(사업주)</span>
          <span className={labelBold}>사업체명 :</span>
          <input value={employer.name} onChange={e => setEmployer(p => ({ ...p, name: e.target.value }))} className={`${inputInline} w-[160px]`} placeholder="" data-testid="input-employer-name-bottom" />
          <span className={`${labelBold} ml-3`}>(전화 :</span>
          <input value={employer.phone} onChange={e => setEmployer(p => ({ ...p, phone: e.target.value }))} className={`${inputInline} w-[110px]`} placeholder="" data-testid="input-employer-phone" />
          <span className={labelBold}>)</span>
        </div>
        <div className="flex flex-wrap gap-x-1 items-center ml-[70px]">
          <span className={labelBold}>주 &nbsp;&nbsp;소 :</span>
          <input value={employer.address} onChange={e => setEmployer(p => ({ ...p, address: e.target.value }))} className={`${inputInline} w-[380px]`} placeholder="" data-testid="input-employer-address" />
        </div>
        <div className="flex flex-wrap gap-x-1 items-center ml-[70px]">
          <span className={labelBold}>대 표 자 :</span>
          <input value={employer.representative} onChange={e => setEmployer(p => ({ ...p, representative: e.target.value }))} className={`${inputInline} w-[160px]`} placeholder="" data-testid="input-employer-representative" />
          <span className={`${labelBold} ml-2 ${hl} px-2 py-0.5`}>(서명)</span>
        </div>

        <div className="flex flex-wrap gap-x-1 items-center mt-2">
          <span className={`${labelBold} w-[70px]`}>(근로자)</span>
          <span className={labelBold}>주 &nbsp;&nbsp;소 :</span>
          <input value={worker.address} onChange={e => setWorker(p => ({ ...p, address: e.target.value }))} className={`${inputInline} w-[380px]`} placeholder="" data-testid="input-worker-address" />
        </div>
        <div className="flex flex-wrap gap-x-1 items-center ml-[70px]">
          <span className={labelBold}>연 락 처 :</span>
          <input value={worker.contact} onChange={e => setWorker(p => ({ ...p, contact: e.target.value }))} className={`${inputInline} w-[160px]`} placeholder="" data-testid="input-worker-contact" />
        </div>
        <div className="flex flex-wrap gap-x-1 items-center ml-[70px]">
          <span className={labelBold}>성 &nbsp;&nbsp;명 :</span>
          <input value={worker.signName} onChange={e => setWorker(p => ({ ...p, signName: e.target.value }))} className={`${inputInline} w-[160px]`} placeholder="" data-testid="input-worker-sign-name" />
          <span className={`${labelBold} ml-2 ${hl} px-2 py-0.5`}>(서명)</span>
        </div>
      </div>
    </div>
  );
});

EmploymentContractForm.displayName = "EmploymentContractForm";

export { EmploymentContractForm };
