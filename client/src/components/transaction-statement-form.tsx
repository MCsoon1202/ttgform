import { useState, forwardRef, useCallback, useRef } from "react";

interface ItemRow {
  date: string;
  name: string;
  spec: string;
  qty: string;
  price: string;
  remark: string;
  taxOverride: string | null;
}

const emptyRow = (): ItemRow => ({ date: "", name: "", spec: "", qty: "", price: "", remark: "", taxOverride: null });

function formatRegNumber(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, "");
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
  }
  if (digits.length === 13) {
    return `${digits.slice(0, 6)}-${digits.slice(6)}`;
  }
  return digits;
}

function getTodayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function extractMonthDay(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[1]}/${parts[2]}`;
  }
  return "";
}

const FIELD_ORDER = ["date", "name", "spec", "qty", "price", "remark"] as const;

const TransactionStatementForm = forwardRef<HTMLDivElement>((_, ref) => {
  const [supplier, setSupplier] = useState({
    regNumber: "",
    companyName: "",
    representative: "",
    address: "",
    industry: "",
    sector: "",
    phone: "",
    fax: "",
  });

  const [client, setClient] = useState({
    regNumber: "",
    name: "",
    address: "",
    phone: "",
    fax: "",
  });

  const [tradeDate, setTradeDate] = useState(getTodayStr());
  const [vatType, setVatType] = useState<"별도" | "포함" | "없음">("별도");
  const [items, setItems] = useState<ItemRow[]>(() => {
    const rows: ItemRow[] = [];
    for (let i = 0; i < 10; i++) rows.push(emptyRow());
    return rows;
  });
  const [prevBalance, setPrevBalance] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [memo, setMemo] = useState("");
  const tableRef = useRef<HTMLTableSectionElement>(null);

  const tradeDateMD = extractMonthDay(tradeDate);

  const fillDateIfEmpty = useCallback((index: number) => {
    setItems(prev => {
      if (prev[index].date === "" && tradeDateMD) {
        const next = [...prev];
        next[index] = { ...next[index], date: tradeDateMD };
        return next;
      }
      return prev;
    });
  }, [tradeDateMD]);

  const updateItem = useCallback((index: number, field: keyof ItemRow, value: string | null) => {
    setItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value } as ItemRow;
      return next;
    });
  }, []);

  const addRow = useCallback(() => {
    setItems(prev => [...prev, emptyRow()]);
  }, []);

  const removeRow = useCallback(() => {
    setItems(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
  }, []);

  const focusCell = useCallback((row: number, field: string) => {
    setTimeout(() => {
      const el = document.querySelector(`[data-testid="input-item-${field}-${row}"]`) as HTMLInputElement;
      if (el) el.focus();
    }, 30);
  }, []);

  const handleItemKeyDown = useCallback((e: React.KeyboardEvent, rowIndex: number, fieldName: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const fieldIdx = FIELD_ORDER.indexOf(fieldName as typeof FIELD_ORDER[number]);
      if (fieldIdx < FIELD_ORDER.length - 1) {
        const nextField = FIELD_ORDER[fieldIdx + 1];
        focusCell(rowIndex, nextField);
      } else {
        setItems(prev => {
          if (rowIndex === prev.length - 1) {
            return [...prev, emptyRow()];
          }
          return prev;
        });
        focusCell(rowIndex + 1, "date");
      }
    }
  }, [focusCell]);

  const handleDateFocus = useCallback((index: number) => {
    fillDateIfEmpty(index);
  }, [fillDateIfEmpty]);

  const handleNameFocus = useCallback((index: number) => {
    fillDateIfEmpty(index);
  }, [fillDateIfEmpty]);

  const HEADER_FIELD_ORDER = [
    "input-trade-date",
    "input-client-reg-number",
    "input-client-name",
    "input-client-address",
    "input-client-phone",
    "input-client-fax",
    "input-reg-number",
    "input-company-name",
    "input-representative",
    "input-company-address",
    "input-industry",
    "input-sector",
    "input-company-phone",
    "input-company-fax",
  ];

  const handleHeaderKeyDown = useCallback((e: React.KeyboardEvent, testId: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const idx = HEADER_FIELD_ORDER.indexOf(testId);
      if (idx < HEADER_FIELD_ORDER.length - 1) {
        const next = document.querySelector(`[data-testid="${HEADER_FIELD_ORDER[idx + 1]}"]`) as HTMLInputElement;
        if (next) next.focus();
      } else {
        const firstItem = document.querySelector(`[data-testid="input-item-date-0"]`) as HTMLInputElement;
        if (firstItem) firstItem.focus();
      }
    }
  }, []);

  const handleDateInput = useCallback((e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value.replace(/[^0-9/]/g, "");
    updateItem(index, "date", val);
  }, [updateItem]);

  const calcSupply = (qty: string, price: string) => {
    const q = parseFloat(qty) || 0;
    const p = parseFloat(price) || 0;
    const total = q * p;
    if (vatType === "포함") {
      return Math.round(total / 1.1);
    }
    return total;
  };

  const calcTax = (qty: string, price: string) => {
    const q = parseFloat(qty) || 0;
    const p = parseFloat(price) || 0;
    const total = q * p;
    if (vatType === "별도") {
      return Math.round(total * 0.1);
    }
    if (vatType === "포함") {
      return Math.round(total - Math.round(total / 1.1));
    }
    return 0;
  };

  const getRowTax = (item: ItemRow) => {
    if (item.taxOverride !== null) {
      return parseFloat(item.taxOverride.replace(/,/g, "")) || 0;
    }
    return calcTax(item.qty, item.price);
  };

  const totalQty = items.reduce((s, item) => s + (parseFloat(item.qty) || 0), 0);
  const totalUnitPrice = items.reduce((s, item) => s + (parseFloat(item.price) || 0), 0);
  const totalSupply = items.reduce((s, item) => s + calcSupply(item.qty, item.price), 0);
  const totalTax = items.reduce((s, item) => s + getRowTax(item), 0);
  const totalAmount = totalSupply + totalTax;

  const prevBalanceNum = parseFloat(prevBalance.replace(/,/g, "")) || 0;
  const depositNum = parseFloat(depositAmount.replace(/,/g, "")) || 0;
  const totalOutstanding = prevBalanceNum + totalAmount - depositNum;

  const fmt = (n: number) => n === 0 ? "" : n.toLocaleString("ko-KR");

  const cellBase = "w-full bg-transparent border-none outline-none text-[13px] px-1 font-[NanumSquare] leading-[22px] h-[22px]";
  const cellInput = cellBase + " text-center";
  const cellInputLeft = cellBase + " text-left";
  const cellInputRight = cellBase + " text-right";
  const cellCommon = "h-[24px] align-middle";
  const headerCell = `bg-[#fce4ec] text-[12px] font-bold text-center px-1.5 border border-[#e57373] ${cellCommon}`;
  const dataCell = `border border-[#e0e0e0] px-0.5 ${cellCommon}`;
  const labelCell = `bg-[#fff3e0] text-[12px] font-bold text-center px-1.5 border border-[#e57373] whitespace-nowrap ${cellCommon}`;
  const clientLabelCell = `bg-[#e3f2fd] text-[12px] font-bold text-center px-1.5 border border-[#64b5f6] whitespace-nowrap ${cellCommon}`;
  const clientDataCell = `border border-[#90caf9] px-0.5 ${cellCommon}`;

  return (
    <div
      ref={ref}
      className="bg-white p-6 mx-auto"
      style={{ maxWidth: 820, minWidth: 640, fontFamily: "NanumSquare, sans-serif", color: "#333" }}
      data-testid="transaction-statement-form"
    >
      <div className="text-center mb-5">
        <h2 className="text-2xl font-black tracking-[0.5em]" style={{ textDecorationLine: "underline", textDecorationStyle: "double", textUnderlineOffset: 8 }}>
          거 래 명 세 표
        </h2>
      </div>

      <div className="flex gap-3 mb-3">
        <div className="flex-1 border-2 border-[#64b5f6] rounded-sm">
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className={clientLabelCell} style={{ width: "22%" }}>일 자</td>
                <td className={clientDataCell}>
                  <input type="date" value={tradeDate} onChange={e => setTradeDate(e.target.value)} className={cellInput} data-testid="input-trade-date" onKeyDown={e => handleHeaderKeyDown(e, "input-trade-date")} />
                </td>
              </tr>
              <tr>
                <td className={clientLabelCell}>등록번호</td>
                <td className={clientDataCell}>
                  <input
                    value={formatRegNumber(client.regNumber)}
                    onChange={e => setClient(p => ({ ...p, regNumber: e.target.value.replace(/[^0-9]/g, "") }))}
                    placeholder="000-00-00000"
                    className={cellInputLeft}
                    data-testid="input-client-reg-number"
                    onKeyDown={e => handleHeaderKeyDown(e, "input-client-reg-number")}
                  />
                </td>
              </tr>
              <tr>
                <td className={clientLabelCell}>거래처</td>
                <td className={clientDataCell}>
                  <input value={client.name} onChange={e => setClient(p => ({ ...p, name: e.target.value }))} placeholder="거래처명" className={cellInputLeft} data-testid="input-client-name" onKeyDown={e => handleHeaderKeyDown(e, "input-client-name")} />
                </td>
              </tr>
              <tr>
                <td className={clientLabelCell}>주 소</td>
                <td className={clientDataCell}>
                  <input value={client.address} onChange={e => setClient(p => ({ ...p, address: e.target.value }))} placeholder="거래처 주소" className={cellInputLeft} data-testid="input-client-address" onKeyDown={e => handleHeaderKeyDown(e, "input-client-address")} />
                </td>
              </tr>
              <tr>
                <td className={clientLabelCell}>전화번호</td>
                <td className={clientDataCell}>
                  <input value={client.phone} onChange={e => setClient(p => ({ ...p, phone: e.target.value }))} placeholder="전화번호" className={cellInputLeft} data-testid="input-client-phone" onKeyDown={e => handleHeaderKeyDown(e, "input-client-phone")} />
                </td>
              </tr>
              <tr>
                <td className={clientLabelCell}>팩스번호</td>
                <td className={clientDataCell}>
                  <input value={client.fax} onChange={e => setClient(p => ({ ...p, fax: e.target.value }))} placeholder="팩스번호" className={cellInputLeft} data-testid="input-client-fax" onKeyDown={e => handleHeaderKeyDown(e, "input-client-fax")} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex-1 border border-[#e57373] rounded-sm">
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className={labelCell} style={{ width: "22%" }}>등록번호</td>
                <td className={dataCell} colSpan={3}>
                  <input
                    value={formatRegNumber(supplier.regNumber)}
                    onChange={e => setSupplier(p => ({ ...p, regNumber: e.target.value.replace(/[^0-9]/g, "") }))}
                    placeholder="000-00-00000"
                    className={cellInputLeft}
                    data-testid="input-reg-number"
                    onKeyDown={e => handleHeaderKeyDown(e, "input-reg-number")}
                  />
                </td>
              </tr>
              <tr>
                <td className={labelCell}>상 호</td>
                <td className={dataCell} style={{ width: "38%" }}>
                  <input value={supplier.companyName} onChange={e => setSupplier(p => ({ ...p, companyName: e.target.value }))} placeholder="상호명" className={cellInputLeft} data-testid="input-company-name" onKeyDown={e => handleHeaderKeyDown(e, "input-company-name")} />
                </td>
                <td className={labelCell} style={{ width: "12%" }}>성 명</td>
                <td className={dataCell}>
                  <div className="flex items-center gap-0.5">
                    <input value={supplier.representative} onChange={e => setSupplier(p => ({ ...p, representative: e.target.value }))} placeholder="대표자" className={cellInputLeft + " flex-1"} data-testid="input-representative" onKeyDown={e => handleHeaderKeyDown(e, "input-representative")} />
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">(인)</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className={labelCell}>주 소</td>
                <td className={dataCell} colSpan={3}>
                  <input value={supplier.address} onChange={e => setSupplier(p => ({ ...p, address: e.target.value }))} placeholder="공급자 주소" className={cellInputLeft} data-testid="input-company-address" onKeyDown={e => handleHeaderKeyDown(e, "input-company-address")} />
                </td>
              </tr>
              <tr>
                <td className={labelCell}>업 태</td>
                <td className={dataCell}>
                  <input value={supplier.industry} onChange={e => setSupplier(p => ({ ...p, industry: e.target.value }))} placeholder="업태" className={cellInputLeft} data-testid="input-industry" onKeyDown={e => handleHeaderKeyDown(e, "input-industry")} />
                </td>
                <td className={labelCell}>종 목</td>
                <td className={dataCell}>
                  <input value={supplier.sector} onChange={e => setSupplier(p => ({ ...p, sector: e.target.value }))} placeholder="종목" className={cellInputLeft} data-testid="input-sector" onKeyDown={e => handleHeaderKeyDown(e, "input-sector")} />
                </td>
              </tr>
              <tr>
                <td className={labelCell}>전화번호</td>
                <td className={dataCell}>
                  <input value={supplier.phone} onChange={e => setSupplier(p => ({ ...p, phone: e.target.value }))} placeholder="전화번호" className={cellInputLeft} data-testid="input-company-phone" onKeyDown={e => handleHeaderKeyDown(e, "input-company-phone")} />
                </td>
                <td className={labelCell}>팩스번호</td>
                <td className={dataCell}>
                  <input value={supplier.fax} onChange={e => setSupplier(p => ({ ...p, fax: e.target.value }))} placeholder="팩스번호" className={cellInputLeft} data-testid="input-company-fax" onKeyDown={e => handleHeaderKeyDown(e, "input-company-fax")} />
                </td>
              </tr>
            </tbody>
          </table>
          <div className="px-3 py-2 border-t border-[#e57373] text-[12px] text-gray-500 text-center">
            공급자정보
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center border-2 border-[#e57373] rounded-sm flex-1" style={{ maxWidth: 340 }}>
          <span className="bg-[#ffcdd2] text-[13px] font-bold px-3 py-2 whitespace-nowrap">합계금액 :</span>
          <span className="text-[18px] font-black px-4 py-2 flex-1 text-right tracking-wide" data-testid="text-total-amount">
            {totalAmount > 0 ? `\\${totalAmount.toLocaleString("ko-KR")}` : "\\0"}
          </span>
        </div>
        <div className="flex flex-row items-center gap-1 text-[12px] print-controls" data-testid="vat-type-area" style={{ flexDirection: "row" }}>
          <span className="text-gray-500 whitespace-nowrap font-bold">부가세</span>
          <select
            value={vatType}
            onChange={e => setVatType(e.target.value as "별도" | "포함" | "없음")}
            className="border border-gray-300 rounded-sm text-[12px] px-1.5 py-1 bg-white"
            data-testid="select-vat-type"
          >
            <option value="별도">별도</option>
            <option value="포함">포함</option>
            <option value="없음">없음</option>
          </select>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={addRow}
            className="border border-gray-300 rounded-sm text-[12px] px-3 py-1 bg-white active:bg-gray-100"
            type="button"
            data-testid="button-add-row"
          >
            <span className="text-[#e53935] font-bold">+</span> 행 추가
          </button>
          <button
            onClick={removeRow}
            className="border border-gray-300 rounded-sm text-[12px] px-3 py-1 bg-white active:bg-gray-100"
            type="button"
            data-testid="button-remove-row"
          >
            <span className="text-[#1e88e5] font-bold">-</span> 행 삭제
          </button>
        </div>
      </div>

      <table className="w-full border-collapse mb-1">
        <thead>
          <tr>
            <th className={headerCell} style={{ width: "7%" }}>월일</th>
            <th className={headerCell} style={{ width: "22%" }}>품 목</th>
            <th className={headerCell} style={{ width: "10%" }}>규 격</th>
            <th className={headerCell} style={{ width: "8%" }}>수 량</th>
            <th className={headerCell} style={{ width: "12%" }}>단 가</th>
            <th className={headerCell} style={{ width: "14%" }}>공급가액</th>
            <th className={headerCell} style={{ width: "12%" }}>세 액</th>
            <th className={headerCell} style={{ width: "15%" }}>비 고</th>
          </tr>
        </thead>
        <tbody ref={tableRef}>
          {items.map((item, i) => {
            const supply = calcSupply(item.qty, item.price);
            const autoTax = calcTax(item.qty, item.price);
            const isOverridden = item.taxOverride !== null;
            return (
              <tr key={i}>
                <td className={dataCell}>
                  <input
                    value={item.date}
                    onChange={e => handleDateInput(e, i)}
                    placeholder=""
                    className={cellInput}
                    data-testid={`input-item-date-${i}`}
                    onKeyDown={e => handleItemKeyDown(e, i, "date")}
                    onFocus={() => handleDateFocus(i)}
                    inputMode="numeric"
                  />
                </td>
                <td className={dataCell}>
                  <input
                    value={item.name}
                    onChange={e => updateItem(i, "name", e.target.value)}
                    placeholder=""
                    className={cellInputLeft}
                    data-testid={`input-item-name-${i}`}
                    onKeyDown={e => handleItemKeyDown(e, i, "name")}
                    onFocus={() => handleNameFocus(i)}
                  />
                </td>
                <td className={dataCell}>
                  <input
                    value={item.spec}
                    onChange={e => updateItem(i, "spec", e.target.value)}
                    placeholder=""
                    className={cellInput}
                    data-testid={`input-item-spec-${i}`}
                    onKeyDown={e => handleItemKeyDown(e, i, "spec")}
                  />
                </td>
                <td className={dataCell}>
                  <input
                    value={item.qty}
                    onChange={e => updateItem(i, "qty", e.target.value)}
                    placeholder=""
                    className={cellInputRight}
                    type="text"
                    inputMode="numeric"
                    data-testid={`input-item-qty-${i}`}
                    onKeyDown={e => handleItemKeyDown(e, i, "qty")}
                  />
                </td>
                <td className={dataCell}>
                  <input
                    value={item.price}
                    onChange={e => updateItem(i, "price", e.target.value)}
                    placeholder=""
                    className={cellInputRight}
                    type="text"
                    inputMode="numeric"
                    data-testid={`input-item-price-${i}`}
                    onKeyDown={e => handleItemKeyDown(e, i, "price")}
                  />
                </td>
                <td className={dataCell + " text-right text-[13px] px-1.5"} data-testid={`text-supply-${i}`}>
                  {fmt(supply)}
                </td>
                <td className={dataCell + " px-0"} data-testid={`text-tax-${i}`}>
                  <input
                    value={isOverridden ? item.taxOverride! : fmt(autoTax)}
                    onChange={e => {
                      const v = e.target.value.replace(/[^0-9]/g, "");
                      setItems(prev => {
                        const next = [...prev];
                        next[i] = { ...next[i], taxOverride: v };
                        return next;
                      });
                    }}
                    onFocus={() => {
                      if (!isOverridden) {
                        setItems(prev => {
                          const next = [...prev];
                          next[i] = { ...next[i], taxOverride: autoTax === 0 ? "" : String(autoTax) };
                          return next;
                        });
                      }
                    }}
                    onBlur={e => {
                      const v = e.target.value.replace(/[^0-9]/g, "").trim();
                      if (v === "") {
                        setItems(prev => {
                          const next = [...prev];
                          next[i] = { ...next[i], taxOverride: null };
                          return next;
                        });
                      }
                    }}
                    className={cellInputRight + (isOverridden ? " text-[#1565c0]" : "")}
                    type="text"
                    inputMode="numeric"
                    title="클릭하여 세액 직접 수정 (비우면 자동계산)"
                    data-testid={`input-item-tax-${i}`}
                  />
                </td>
                <td className={dataCell}>
                  <input
                    value={item.remark}
                    onChange={e => updateItem(i, "remark", e.target.value)}
                    className={cellInputLeft}
                    data-testid={`input-item-remark-${i}`}
                    onKeyDown={e => handleItemKeyDown(e, i, "remark")}
                  />
                </td>
              </tr>
            );
          })}
          <tr className="bg-[#fce4ec]">
            <td className={headerCell}>합 계</td>
            <td className={headerCell}></td>
            <td className={headerCell}></td>
            <td className={headerCell + " text-right !text-[13px]"} data-testid="text-qty-total">{fmt(totalQty)}</td>
            <td className={headerCell} data-testid="text-unit-price-total"></td>
            <td className={headerCell + " text-right !text-[13px]"} data-testid="text-supply-total">{fmt(totalSupply)}</td>
            <td className={headerCell + " text-right !text-[13px]"} data-testid="text-tax-total">{fmt(totalTax)}</td>
            <td className={headerCell}></td>
          </tr>
        </tbody>
      </table>

      <table className="w-full border-collapse mb-2">
        <tbody>
          <tr>
            <td className={labelCell} style={{ width: "12.5%" }}>전미수잔액</td>
            <td className={dataCell + " text-right px-1.5"} style={{ width: "12.5%" }}>
              <input value={prevBalance} onChange={e => {
                const raw = e.target.value.replace(/[^0-9]/g, "");
                setPrevBalance(raw ? Number(raw).toLocaleString("ko-KR") : "");
              }} className={cellInputRight} type="text" inputMode="numeric" placeholder="0" data-testid="input-prev-balance" />
            </td>
            <td className={labelCell} style={{ width: "12.5%" }}>당일합계</td>
            <td className={dataCell + " text-right text-[13px] px-1.5 leading-[22px]"} style={{ width: "12.5%" }} data-testid="text-grand-total">
              {fmt(totalAmount)}
            </td>
            <td className={labelCell} style={{ width: "12.5%" }}>입 금 액</td>
            <td className={dataCell + " text-right px-1.5"} style={{ width: "12.5%" }}>
              <input value={depositAmount} onChange={e => {
                const raw = e.target.value.replace(/[^0-9]/g, "");
                setDepositAmount(raw ? Number(raw).toLocaleString("ko-KR") : "");
              }} className={cellInputRight} type="text" inputMode="numeric" placeholder="0" data-testid="input-deposit" />
            </td>
            <td className={labelCell} style={{ width: "12.5%" }}>총미수잔액</td>
            <td className={dataCell + " text-right text-[13px] px-1.5 leading-[22px]"} style={{ width: "12.5%" }} data-testid="text-outstanding-balance">
              {fmt(totalOutstanding)}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="border border-[#e0e0e0] p-2 min-h-[40px] mb-2">
        <textarea
          value={memo}
          onChange={e => setMemo(e.target.value)}
          placeholder="비고 메모 (예: 전화주시면 마중나갈께요..)"
          className="w-full bg-transparent border-none outline-none text-[13px] resize-none font-[NanumSquare]"
          rows={2}
          data-testid="input-memo"
        />
      </div>
    </div>
  );
});

TransactionStatementForm.displayName = "TransactionStatementForm";

export { TransactionStatementForm };
