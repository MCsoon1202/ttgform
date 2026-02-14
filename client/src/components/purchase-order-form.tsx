import React, { useCallback, useMemo, useState, forwardRef } from "react";

type VatType = "별도" | "포함" | "없음";

interface ItemRow {
  name: string;
  spec: string;
  qty: string;
  unitPrice: string;
  remark: string;
  taxOverride: string | null;
}

const makeEmptyRow = (): ItemRow => ({
  name: "",
  spec: "",
  qty: "",
  unitPrice: "",
  remark: "",
  taxOverride: null,
});

function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function onlyDigits(v: string) {
  return String(v ?? "").replace(/[^0-9]/g, "");
}

function formatRegNo(raw: string) {
  const digits = onlyDigits(raw);
  if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
  if (digits.length === 13) return `${digits.slice(0, 6)}-${digits.slice(6)}`;
  return digits;
}

function parseNum(v: string): number {
  const cleaned = String(v ?? "").replace(/,/g, "").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function fmt(n: number): string {
  return n === 0 ? "" : n.toLocaleString("ko-KR");
}

const PurchaseOrderForm = forwardRef<HTMLDivElement>((_, ref) => {
  const [left, setLeft] = useState({
    quoteTo: "",
    estimateDate: todayISO(),
    tel: "",
    fax: "",
    subject: "",
  });

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

  const [vatType, setVatType] = useState<VatType>("별도");

  const [items, setItems] = useState<ItemRow[]>(() => Array.from({ length: 6 }, makeEmptyRow));

  const addRow = useCallback(() => setItems((p) => [...p, makeEmptyRow()]), []);
  const removeRow = useCallback(() => setItems((p) => (p.length > 1 ? p.slice(0, -1) : p)), []);

  const focusByTestId = useCallback((testId: string) => {
    setTimeout(() => {
      const el = document.querySelector(`[data-testid="${testId}"]`) as
        | HTMLInputElement
        | HTMLTextAreaElement
        | HTMLSelectElement
        | null;
      if (el) el.focus();
    }, 10);
  }, []);

  const TOP_ORDER = useMemo(
    () => [
      "input-quote-to",
      "input-estimate-date",
      "input-quote-tel",
      "input-quote-fax",
      "input-subject",

      "input-supplier-reg",
      "input-supplier-name",
      "input-supplier-rep",
      "input-supplier-address",
      "input-supplier-industry",
      "input-supplier-sector",
      "input-supplier-phone",
      "input-supplier-fax",
    ],
    []
  );

  const onTopEnter = useCallback(
    (currentId: string) => (e: React.KeyboardEvent) => {
      if (e.key !== "Enter") return;
      e.preventDefault();

      const idx = TOP_ORDER.indexOf(currentId);
      if (idx >= 0 && idx < TOP_ORDER.length - 1) {
        focusByTestId(TOP_ORDER[idx + 1]);
        return;
      }
      focusByTestId("input-item-name-0");
    },
    [TOP_ORDER, focusByTestId]
  );

  const ITEM_ORDER = ["name", "spec", "qty", "unitPrice", "remark"] as const;

  const focusItemCell = useCallback((row: number, field: (typeof ITEM_ORDER)[number]) => {
    focusByTestId(`input-item-${field}-${row}`);
  }, [focusByTestId]);

  const onItemEnter = useCallback(
    (row: number, field: (typeof ITEM_ORDER)[number]) => (e: React.KeyboardEvent) => {
      if (e.key !== "Enter") return;
      e.preventDefault();

      const idx = ITEM_ORDER.indexOf(field);
      if (idx < ITEM_ORDER.length - 1) {
        focusItemCell(row, ITEM_ORDER[idx + 1]);
        return;
      }

      setItems((prev) => {
        if (row === prev.length - 1) return [...prev, makeEmptyRow()];
        return prev;
      });
      focusItemCell(row + 1, "name");
    },
    [focusItemCell]
  );

  const updateItem = useCallback((row: number, key: keyof ItemRow, value: string | null) => {
    setItems((prev) => {
      const next = [...prev];
      next[row] = { ...next[row], [key]: value } as ItemRow;
      return next;
    });
  }, []);

  const calcSupply = useCallback(
    (qty: string, unitPrice: string) => {
      const total = parseNum(qty) * parseNum(unitPrice);
      if (vatType === "포함") return Math.round(total / 1.1);
      return total;
    },
    [vatType]
  );

  const calcTax = useCallback(
    (qty: string, unitPrice: string) => {
      const total = parseNum(qty) * parseNum(unitPrice);
      if (vatType === "별도") return Math.round(total * 0.1);
      if (vatType === "포함") return Math.round(total - Math.round(total / 1.1));
      return 0;
    },
    [vatType]
  );

  const getRowTax = useCallback((it: ItemRow) => {
    if (it.taxOverride !== null) {
      return parseFloat(it.taxOverride.replace(/,/g, "")) || 0;
    }
    return calcTax(it.qty, it.unitPrice);
  }, [calcTax]);

  const totals = useMemo(() => {
    let qtySum = 0;
    let supplySum = 0;
    let taxSum = 0;

    for (const it of items) {
      qtySum += parseNum(it.qty);
      supplySum += calcSupply(it.qty, it.unitPrice);
      taxSum += getRowTax(it);
    }

    return {
      qtySum,
      supplySum,
      taxSum,
      amountSum: supplySum + taxSum,
    };
  }, [items, calcSupply, getRowTax]);

  const baseFont = "NanumSquare, sans-serif";
  const line = "border border-gray-400";
  const th = `text-[11px] font-bold text-center px-1.5 py-1 ${line}`;
  const td = `px-1 py-0.5 align-middle ${line}`;

  const cellBase =
    "w-full bg-transparent border-none outline-none text-[12px] px-1 leading-[22px] h-[22px]";
  const cellLeft = cellBase + " text-left";
  const cellCenter = cellBase + " text-center";
  const cellRight = cellBase + " text-right";

  const lLabel = `text-[11px] font-bold text-center px-1.5 whitespace-nowrap ${line}`;
  const lData = `px-1 ${line}`;

  const rBox = "border border-red-500 rounded-sm";
  const rLabel = "text-[11px] font-bold text-center px-1.5 whitespace-nowrap border border-red-500";
  const rData = "px-1 border border-red-500";

  return (
    <div
      ref={ref}
      className="bg-white p-6 mx-auto"
      style={{ maxWidth: 820, minWidth: 640, fontFamily: baseFont, color: "#111" }}
      data-testid="purchase-order-form"
    >
      <div className="text-center mb-3">
        <h2 className="text-[28px] font-black tracking-[0.6em] border-b-2 border-black pb-1 inline-block">
          수주서
        </h2>
      </div>

      <div className="flex gap-3 mb-3">
        <div className="flex-1 border border-gray-400 rounded-sm">
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className={lLabel} style={{ width: "22%" }}>
                  거래처명
                </td>
                <td className={lData}>
                  <input
                    className={cellLeft}
                    placeholder="거래처명"
                    value={left.quoteTo}
                    onChange={(e) => setLeft((p) => ({ ...p, quoteTo: e.target.value }))}
                    onKeyDown={onTopEnter("input-quote-to")}
                    data-testid="input-quote-to"
                  />
                </td>
              </tr>
              <tr>
                <td className={lLabel}>수주일자</td>
                <td className={lData}>
                  <input
                    type="date"
                    className={cellCenter}
                    value={left.estimateDate}
                    onChange={(e) => setLeft((p) => ({ ...p, estimateDate: e.target.value }))}
                    onKeyDown={onTopEnter("input-estimate-date")}
                    data-testid="input-estimate-date"
                  />
                </td>
              </tr>
              <tr>
                <td className={lLabel}>전화번호</td>
                <td className={lData}>
                  <input
                    className={cellLeft}
                    placeholder="전화번호"
                    value={left.tel}
                    onChange={(e) => setLeft((p) => ({ ...p, tel: e.target.value }))}
                    onKeyDown={onTopEnter("input-quote-tel")}
                    data-testid="input-quote-tel"
                  />
                </td>
              </tr>
              <tr>
                <td className={lLabel}>팩스번호</td>
                <td className={lData}>
                  <input
                    className={cellLeft}
                    placeholder="팩스번호"
                    value={left.fax}
                    onChange={(e) => setLeft((p) => ({ ...p, fax: e.target.value }))}
                    onKeyDown={onTopEnter("input-quote-fax")}
                    data-testid="input-quote-fax"
                  />
                </td>
              </tr>
              <tr>
                <td className={lLabel}>제목</td>
                <td className={lData}>
                  <input
                    className={cellLeft}
                    placeholder="수주 제목"
                    value={left.subject}
                    onChange={(e) => setLeft((p) => ({ ...p, subject: e.target.value }))}
                    onKeyDown={onTopEnter("input-subject")}
                    data-testid="input-subject"
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <div className="px-3 py-2 border-t border-gray-300 text-[12px]">
            <p className="font-bold">견적요청에 감사합니다, 아래와 같이 수주합니다.</p>
          </div>
        </div>

        <div className={"flex-1 " + rBox}>
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className={rLabel} style={{ width: "22%" }}>
                  등록번호
                </td>
                <td className={rData} colSpan={3}>
                  <input
                    className={cellLeft}
                    placeholder="000-00-00000"
                    value={formatRegNo(supplier.regNumber)}
                    onChange={(e) => setSupplier((p) => ({ ...p, regNumber: onlyDigits(e.target.value) }))}
                    onKeyDown={onTopEnter("input-supplier-reg")}
                    data-testid="input-supplier-reg"
                  />
                </td>
              </tr>

              <tr>
                <td className={rLabel}>상호</td>
                <td className={rData} style={{ width: "40%" }}>
                  <input
                    className={cellLeft}
                    placeholder="상호명"
                    value={supplier.companyName}
                    onChange={(e) => setSupplier((p) => ({ ...p, companyName: e.target.value }))}
                    onKeyDown={onTopEnter("input-supplier-name")}
                    data-testid="input-supplier-name"
                  />
                </td>

                <td className={rLabel} style={{ width: "12%" }}>
                  성명
                </td>
                <td className={rData}>
                  <div className="flex items-center gap-0.5">
                    <input
                      className={cellLeft + " flex-1"}
                      placeholder="대표자"
                      value={supplier.representative}
                      onChange={(e) => setSupplier((p) => ({ ...p, representative: e.target.value }))}
                      onKeyDown={onTopEnter("input-supplier-rep")}
                      data-testid="input-supplier-rep"
                    />
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">(인)</span>
                  </div>
                </td>
              </tr>

              <tr>
                <td className={rLabel}>주소</td>
                <td className={rData} colSpan={3}>
                  <input
                    className={cellLeft}
                    placeholder="공급자 주소"
                    value={supplier.address}
                    onChange={(e) => setSupplier((p) => ({ ...p, address: e.target.value }))}
                    onKeyDown={onTopEnter("input-supplier-address")}
                    data-testid="input-supplier-address"
                  />
                </td>
              </tr>

              <tr>
                <td className={rLabel}>업태</td>
                <td className={rData}>
                  <input
                    className={cellLeft}
                    placeholder="업태"
                    value={supplier.industry}
                    onChange={(e) => setSupplier((p) => ({ ...p, industry: e.target.value }))}
                    onKeyDown={onTopEnter("input-supplier-industry")}
                    data-testid="input-supplier-industry"
                  />
                </td>

                <td className={rLabel}>종목</td>
                <td className={rData}>
                  <input
                    className={cellLeft}
                    placeholder="종목"
                    value={supplier.sector}
                    onChange={(e) => setSupplier((p) => ({ ...p, sector: e.target.value }))}
                    onKeyDown={onTopEnter("input-supplier-sector")}
                    data-testid="input-supplier-sector"
                  />
                </td>
              </tr>

              <tr>
                <td className={rLabel}>전화번호</td>
                <td className={rData}>
                  <input
                    className={cellLeft}
                    placeholder="전화번호"
                    value={supplier.phone}
                    onChange={(e) => setSupplier((p) => ({ ...p, phone: e.target.value }))}
                    onKeyDown={onTopEnter("input-supplier-phone")}
                    data-testid="input-supplier-phone"
                  />
                </td>

                <td className={rLabel}>팩스번호</td>
                <td className={rData}>
                  <input
                    className={cellLeft}
                    placeholder="팩스번호"
                    value={supplier.fax}
                    onChange={(e) => setSupplier((p) => ({ ...p, fax: e.target.value }))}
                    onKeyDown={onTopEnter("input-supplier-fax")}
                    data-testid="input-supplier-fax"
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <div className="px-3 py-2 border-t border-red-400 text-[12px] text-gray-500 text-center">
            공급자정보
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center border border-gray-400 rounded-sm flex-1" style={{ maxWidth: 340 }}>
          <span className="text-[13px] font-bold px-3 py-2 whitespace-nowrap border-r border-gray-400">
            합계금액 :
          </span>
          <span className="text-[18px] font-black px-4 py-2 flex-1 text-right tracking-wide">
            {totals.amountSum > 0 ? `\\${totals.amountSum.toLocaleString("ko-KR")}` : "\\0"}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[12px] print-controls">
          <span className="text-gray-600 whitespace-nowrap font-bold">부가세</span>
          <select
            value={vatType}
            onChange={(e) => setVatType(e.target.value as VatType)}
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
          >
            + 행 추가
          </button>
          <button
            onClick={removeRow}
            className="border border-gray-300 rounded-sm text-[12px] px-3 py-1 bg-white active:bg-gray-100"
            type="button"
          >
            - 행 삭제
          </button>
        </div>
      </div>

      <table className="w-full border-collapse mb-2">
        <thead>
          <tr>
            <th className={th} style={{ width: "6%" }}>순번</th>
            <th className={th} style={{ width: "24%" }}>품목</th>
            <th className={th} style={{ width: "12%" }}>규격</th>
            <th className={th} style={{ width: "10%" }}>수량</th>
            <th className={th} style={{ width: "12%" }}>단가</th>
            <th className={th} style={{ width: "13%" }}>공급가액</th>
            <th className={th} style={{ width: "10%" }}>세액</th>
            <th className={th} style={{ width: "13%" }}>비고</th>
          </tr>
        </thead>

        <tbody>
          {items.map((it, i) => {
            const supply = calcSupply(it.qty, it.unitPrice);
            const autoTax = calcTax(it.qty, it.unitPrice);
            const isOverridden = it.taxOverride !== null;

            return (
              <tr key={i}>
                <td className={td + " text-center text-[12px]"}>{i + 1}</td>

                <td className={td}>
                  <input
                    className={cellLeft}
                    value={it.name}
                    onChange={(e) => updateItem(i, "name", e.target.value)}
                    onKeyDown={onItemEnter(i, "name")}
                    data-testid={`input-item-name-${i}`}
                  />
                </td>

                <td className={td}>
                  <input
                    className={cellCenter}
                    value={it.spec}
                    onChange={(e) => updateItem(i, "spec", e.target.value)}
                    onKeyDown={onItemEnter(i, "spec")}
                    data-testid={`input-item-spec-${i}`}
                  />
                </td>

                <td className={td}>
                  <input
                    className={cellRight}
                    inputMode="numeric"
                    value={it.qty}
                    onChange={(e) => updateItem(i, "qty", e.target.value)}
                    onKeyDown={onItemEnter(i, "qty")}
                    data-testid={`input-item-qty-${i}`}
                  />
                </td>

                <td className={td}>
                  <input
                    className={cellRight}
                    inputMode="numeric"
                    value={it.unitPrice}
                    onChange={(e) => updateItem(i, "unitPrice", e.target.value)}
                    onKeyDown={onItemEnter(i, "unitPrice")}
                    data-testid={`input-item-unitPrice-${i}`}
                  />
                </td>

                <td className={td + " text-right text-[12px] px-1.5"}>{fmt(supply)}</td>
                <td className={td + " !px-0"}>
                  <input
                    value={isOverridden ? it.taxOverride! : fmt(autoTax)}
                    onChange={(e) => {
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
                    onBlur={(e) => {
                      const v = e.target.value.replace(/[^0-9]/g, "").trim();
                      if (v === "") {
                        setItems(prev => {
                          const next = [...prev];
                          next[i] = { ...next[i], taxOverride: null };
                          return next;
                        });
                      }
                    }}
                    className={cellRight + (isOverridden ? " text-[#1565c0]" : "")}
                    type="text"
                    inputMode="numeric"
                    title="클릭하여 세액 직접 수정 (비우면 자동계산)"
                    data-testid={`input-item-tax-${i}`}
                  />
                </td>

                <td className={td}>
                  <input
                    className={cellLeft}
                    value={it.remark}
                    onChange={(e) => updateItem(i, "remark", e.target.value)}
                    onKeyDown={onItemEnter(i, "remark")}
                    data-testid={`input-item-remark-${i}`}
                  />
                </td>
              </tr>
            );
          })}

          <tr>
            <td className={th}></td>
            <td className={th} colSpan={2}>합계</td>
            <td className={th + " text-right !text-[12px]"}>{fmt(totals.qtySum)}</td>
            <td className={th + " text-right !text-[12px]"}></td>
            <td className={th + " text-right !text-[12px]"}>{fmt(totals.supplySum)}</td>
            <td className={th + " text-right !text-[12px]"}>{fmt(totals.taxSum)}</td>
            <td className={th}></td>
          </tr>
        </tbody>
      </table>

      <table className="w-full border-collapse mb-2">
        <tbody>
          <tr>
            <td className={th} style={{ width: "12%" }}>납기일자</td>
            <td className={td} style={{ width: "38%" }}>
              <input type="date" className={cellCenter} data-testid="input-delivery-date" />
            </td>
            <td className={th} style={{ width: "12%" }}>납품장소</td>
            <td className={td} style={{ width: "38%" }}>
              <input className={cellLeft} data-testid="input-delivery-place" />
            </td>
          </tr>
          <tr>
            <td className={th}>유효일자</td>
            <td className={td}>
              <input type="date" className={cellCenter} data-testid="input-valid-until" />
            </td>
            <td className={th}>결제조건</td>
            <td className={td}>
              <input className={cellLeft} data-testid="input-payment-terms" />
            </td>
          </tr>
          <tr>
            <td className={th}>비고</td>
            <td className={td} colSpan={3}>
              <textarea
                className="w-full bg-transparent border-none outline-none text-[12px] resize-none leading-[18px]"
                rows={2}
                data-testid="input-note"
                placeholder="추가 전달사항"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <div className="text-[11px] text-gray-500 print-controls">* 입력한 데이터는 서버에 저장되지 않습니다.</div>
    </div>
  );
});

PurchaseOrderForm.displayName = "PurchaseOrderForm";
export { PurchaseOrderForm };
