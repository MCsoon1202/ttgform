import { useState, forwardRef, useCallback } from "react";

interface ItemRow {
  mmdd: string;
  name: string;
  qty: string;
  price: string;
  amount: string;
}

const emptyRow = (): ItemRow => ({ mmdd: "", name: "", qty: "", price: "", amount: "" });

function commaFormat(v: string): string {
  const digits = v.replace(/[^0-9]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString();
}

function parseNum(v: string): number {
  return Number(v.replace(/[^0-9]/g, "")) || 0;
}

function getTodayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDate(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, "");
  if (digits.length >= 8) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  }
  return digits;
}

function extractMonthDay(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[1]}/${parts[2]}`;
  }
  return "";
}

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

const BLANK_ROWS = 10;

const INFO_FIELDS = ["no", "bizNo", "company", "ceo", "address", "bizType", "itemType", "date", "remark"] as const;

const SimpleReceiptForm = forwardRef<HTMLDivElement>((_, ref) => {
  const [printMode, setPrintMode] = useState<"both" | "buyer" | "supplier">("both");
  const [info, setInfo] = useState({
    no: "",
    bizNo: "",
    company: "",
    ceo: "",
    address: "",
    bizType: "",
    itemType: "",
    date: getTodayStr(),
    total: "",
    remark: "",
  });

  const [items, setItems] = useState<ItemRow[]>(() => {
    const rows: ItemRow[] = [];
    for (let i = 0; i < BLANK_ROWS; i++) rows.push(emptyRow());
    rows[0] = { ...rows[0], mmdd: extractMonthDay(getTodayStr()) };
    return rows;
  });

  const updateInfo = useCallback((field: string, value: string) => {
    setInfo(prev => {
      const next = { ...prev, [field]: value };
      if (field === "date") {
        const md = extractMonthDay(value);
        if (md) {
          setItems(prev2 => {
            const rows = [...prev2];
            if (rows.length > 0 && (!rows[0].mmdd || rows[0].mmdd === extractMonthDay(prev.date))) {
              rows[0] = { ...rows[0], mmdd: md };
            }
            return rows;
          });
        }
      }
      return next;
    });
  }, []);

  const updateItem = useCallback((index: number, field: keyof ItemRow, value: string) => {
    setItems(prev => {
      const next = [...prev];
      const row = { ...next[index], [field]: value };
      if (field === "qty" || field === "price") {
        const q = parseNum(field === "qty" ? value : row.qty);
        const p = parseNum(field === "price" ? value : row.price);
        row.amount = q > 0 && p > 0 ? (q * p).toLocaleString() : "";
      }
      next[index] = row;
      return next;
    });
  }, []);

  const calcTotal = (): string => {
    let sum = 0;
    items.forEach(row => { sum += parseNum(row.amount); });
    return sum > 0 ? sum.toLocaleString() : "";
  };

  const handleInfoKeyDown = useCallback((e: React.KeyboardEvent, field: string) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter") {
      e.preventDefault();
      const idx = INFO_FIELDS.indexOf(field as any);
      if (idx < 0) return;
      if (idx < INFO_FIELDS.length - 1) {
        const nextField = INFO_FIELDS[idx + 1];
        const next = document.querySelector(`[data-info-field="${nextField}"]`) as HTMLInputElement;
        next?.focus();
      } else {
        const next = document.querySelector(`[data-item-row="0"][data-item-field="mmdd"]`) as HTMLInputElement;
        next?.focus();
      }
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, rowIdx: number, fieldIdx: number) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter") {
      e.preventDefault();
      const fields: (keyof ItemRow)[] = ["mmdd", "name", "qty", "price", "amount"];
      const nextField = fieldIdx + 1;
      if (nextField < fields.length) {
        const next = document.querySelector(`[data-item-row="${rowIdx}"][data-item-field="${fields[nextField]}"]`) as HTMLInputElement;
        next?.focus();
      } else {
        if (rowIdx === items.length - 1) {
          setItems(prev => [...prev, emptyRow()]);
          setTimeout(() => {
            const next = document.querySelector(`[data-item-row="${rowIdx + 1}"][data-item-field="mmdd"]`) as HTMLInputElement;
            next?.focus();
          }, 50);
        } else {
          const next = document.querySelector(`[data-item-row="${rowIdx + 1}"][data-item-field="mmdd"]`) as HTMLInputElement;
          next?.focus();
        }
      }
    }
  }, [items.length]);

  const totalDisplay = calcTotal();

  const thStyle: React.CSSProperties = {
    height: "24px",
    padding: "2px 4px",
    verticalAlign: "middle",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    background: "#fff",
    fontWeight: 800,
    textAlign: "center",
    fontSize: "11px",
  };

  const tdStyle: React.CSSProperties = {
    height: "24px",
    padding: "2px 4px",
    verticalAlign: "middle",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    fontSize: "11px",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: "22px",
    lineHeight: "22px",
    border: "none",
    outline: "none",
    background: "transparent",
    font: "inherit",
    color: "inherit",
    padding: 0,
    fontSize: "11px",
  };

  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "fixed",
    fontSize: "11px",
  };

  const renderReceipt = (type: "buyer" | "supplier") => {
    const isBuyer = type === "buyer";
    const borderColor = isBuyer ? "#4a7cff" : "#ff6b6b";
    const titleColor = isBuyer ? "#2255cc" : "#cc3333";
    const label = isBuyer ? "공급받는자용" : "공급자용";
    const sectionClass = isBuyer ? "receipt-buyer" : "receipt-supplier";
    const cellBorder = `1px solid ${borderColor}`;

    const isHidden = (printMode === "buyer" && type === "supplier") ||
                     (printMode === "supplier" && type === "buyer");

    const thC: React.CSSProperties = { ...thStyle, border: cellBorder };
    const tdC: React.CSSProperties = { ...tdStyle, border: cellBorder };

    return (
      <div
        className={sectionClass}
        style={{
          background: "#fff",
          border: `2px solid ${borderColor}`,
          padding: "8px",
          borderRadius: "4px",
          WebkitPrintColorAdjust: "exact",
          printColorAdjust: "exact",
          ...(isHidden ? { display: "none" } : {}),
        } as React.CSSProperties}
        data-testid={`receipt-${type}`}
      >
        <div style={{ textAlign: "center", fontSize: "16px", fontWeight: 900, letterSpacing: "-0.5px", margin: "2px 0 6px", color: titleColor }}>
          영 수 증 ({label})
        </div>
        <div style={{ fontSize: "10px", fontWeight: 700, textAlign: "right", margin: "-2px 0 4px" }}>귀중</div>

        <table style={tableStyle}>
          <colgroup>
            <col style={{ width: "18%" }} />
            <col style={{ width: "42%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "24%" }} />
          </colgroup>
          <tbody>
            <tr>
              <th style={thC}>NO.</th>
              <td style={tdC} colSpan={3}>
                <input style={inputStyle} value={info.no} onChange={e => updateInfo("no", e.target.value)} onKeyDown={e => handleInfoKeyDown(e, "no")} data-info-field="no" placeholder="001" data-testid={`input-no-${type}`} />
              </td>
            </tr>
            <tr>
              <th style={thC}><span>사업자</span><br /><span>등록번호</span></th>
              <td style={tdC} colSpan={3}>
                <input style={inputStyle} value={info.bizNo} onChange={e => updateInfo("bizNo", formatRegNumber(e.target.value))} onKeyDown={e => handleInfoKeyDown(e, "bizNo")} data-info-field="bizNo" placeholder="000-00-00000" data-testid={`input-bizno-${type}`} />
              </td>
            </tr>
            <tr>
              <th style={thC}>상호</th>
              <td style={tdC}>
                <input style={inputStyle} value={info.company} onChange={e => updateInfo("company", e.target.value)} onKeyDown={e => handleInfoKeyDown(e, "company")} data-info-field="company" placeholder="상호명" data-testid={`input-company-${type}`} />
              </td>
              <th style={thC}><span>성명</span><br /><span>(대표)</span></th>
              <td style={tdC}>
                <input style={inputStyle} value={info.ceo} onChange={e => updateInfo("ceo", e.target.value)} onKeyDown={e => handleInfoKeyDown(e, "ceo")} data-info-field="ceo" placeholder="대표자" data-testid={`input-ceo-${type}`} />
              </td>
            </tr>
            <tr>
              <th style={thC}><span>사업장</span><br /><span>소재지</span></th>
              <td style={tdC} colSpan={3}>
                <input style={inputStyle} value={info.address} onChange={e => updateInfo("address", e.target.value)} onKeyDown={e => handleInfoKeyDown(e, "address")} data-info-field="address" placeholder="사업장 주소" data-testid={`input-address-${type}`} />
              </td>
            </tr>
            <tr>
              <th style={thC}>업태</th>
              <td style={tdC}>
                <input style={inputStyle} value={info.bizType} onChange={e => updateInfo("bizType", e.target.value)} onKeyDown={e => handleInfoKeyDown(e, "bizType")} data-info-field="bizType" placeholder="업태" data-testid={`input-biztype-${type}`} />
              </td>
              <th style={thC}>종목</th>
              <td style={tdC}>
                <input style={inputStyle} value={info.itemType} onChange={e => updateInfo("itemType", e.target.value)} onKeyDown={e => handleInfoKeyDown(e, "itemType")} data-info-field="itemType" placeholder="종목" data-testid={`input-itemtype-${type}`} />
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ fontWeight: 900, textAlign: "center", color: titleColor, padding: "4px 0", fontSize: "12px" }}>공 급 가 액</div>

        <table style={tableStyle}>
          <colgroup>
            <col style={{ width: "28%" }} />
            <col style={{ width: "44%" }} />
            <col style={{ width: "28%" }} />
          </colgroup>
          <tbody>
            <tr>
              <th style={thC}>작성일자</th>
              <th style={thC}>금액</th>
              <th style={thC}>비고</th>
            </tr>
            <tr>
              <td style={tdC}>
                <input style={{ ...inputStyle, textAlign: "center" }} value={info.date} onChange={e => updateInfo("date", formatDate(e.target.value))} onKeyDown={e => handleInfoKeyDown(e, "date")} data-info-field="date" placeholder="YYYY-MM-DD" data-testid={`input-date-${type}`} />
              </td>
              <td style={{ ...tdC, textAlign: "right", fontWeight: 700 }} data-testid={`text-total-top-${type}`}>
                {totalDisplay}
              </td>
              <td style={tdC}>
                <input style={inputStyle} value={info.remark} onChange={e => updateInfo("remark", e.target.value)} onKeyDown={e => handleInfoKeyDown(e, "remark")} data-info-field="remark" data-testid={`input-remark-${type}`} />
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ fontWeight: 900, textAlign: "center", color: titleColor, padding: "4px 0", fontSize: "11px" }}>
          귀하께서 아래와 같이 정히 영수(청구)함.
        </div>

        <table style={tableStyle}>
          <colgroup>
            <col style={{ width: "16%" }} />
            <col style={{ width: "34%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "19%" }} />
            <col style={{ width: "19%" }} />
          </colgroup>
          <tbody>
            <tr>
              <th style={thC}>월일</th>
              <th style={thC}>품 목</th>
              <th style={thC}>수량</th>
              <th style={thC}>단 가</th>
              <th style={thC}>공급가액</th>
            </tr>
            {items.map((row, idx) => (
              <tr key={idx}>
                <td style={tdC}>
                  <input style={{ ...inputStyle, textAlign: "center" }} value={row.mmdd}
                    onChange={e => updateItem(idx, "mmdd", e.target.value)}
                    onKeyDown={e => handleKeyDown(e, idx, 0)}
                    data-item-row={idx} data-item-field="mmdd"
                    data-testid={`input-mmdd-${type}-${idx}`} />
                </td>
                <td style={tdC}>
                  <input style={inputStyle} value={row.name}
                    onChange={e => updateItem(idx, "name", e.target.value)}
                    onKeyDown={e => handleKeyDown(e, idx, 1)}
                    data-item-row={idx} data-item-field="name"
                    data-testid={`input-name-${type}-${idx}`} />
                </td>
                <td style={tdC}>
                  <input style={{ ...inputStyle, textAlign: "center" }} value={row.qty}
                    onChange={e => updateItem(idx, "qty", e.target.value)}
                    onKeyDown={e => handleKeyDown(e, idx, 2)}
                    data-item-row={idx} data-item-field="qty"
                    data-testid={`input-qty-${type}-${idx}`} />
                </td>
                <td style={tdC}>
                  <input style={{ ...inputStyle, textAlign: "right" }} value={row.price}
                    onChange={e => updateItem(idx, "price", commaFormat(e.target.value))}
                    onKeyDown={e => handleKeyDown(e, idx, 3)}
                    data-item-row={idx} data-item-field="price"
                    data-testid={`input-price-${type}-${idx}`} />
                </td>
                <td style={tdC}>
                  <input style={{ ...inputStyle, textAlign: "right" }} value={row.amount}
                    onChange={e => updateItem(idx, "amount", commaFormat(e.target.value))}
                    onKeyDown={e => handleKeyDown(e, idx, 4)}
                    data-item-row={idx} data-item-field="amount"
                    data-testid={`input-amount-${type}-${idx}`} />
                </td>
              </tr>
            ))}
            <tr>
              <th style={thC} colSpan={4}>합 &nbsp;&nbsp;계</th>
              <td style={{ ...tdC, textAlign: "right", fontWeight: 700 }}>
                {totalDisplay}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div ref={ref} style={{ minWidth: 640 }}>
      <table style={{ width: "100%", maxWidth: "1100px", borderCollapse: "separate", borderSpacing: "14px 0" }}>
        <tbody>
          <tr>
            <td style={{ width: "50%", verticalAlign: "top", padding: 0 }}>
              {renderReceipt("buyer")}
            </td>
            <td style={{ width: "50%", verticalAlign: "top", padding: 0 }}>
              {renderReceipt("supplier")}
            </td>
          </tr>
        </tbody>
      </table>
      <div className="sr-print-controls" style={{
        display: "flex",
        gap: "12px",
        alignItems: "center",
        flexWrap: "wrap",
        padding: "8px 12px",
        border: "1px solid #e6e6ea",
        borderRadius: "8px",
        marginTop: "14px",
        background: "#fafafa",
        fontSize: "13px",
      }}>
        <span style={{ fontWeight: 700, fontSize: "13px" }}>출력 선택:</span>
        <label style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
          <input type="radio" name="receiptPrintMode" value="both" checked={printMode === "both"} onChange={() => setPrintMode("both")} data-testid="radio-both" />
          둘 다 출력
        </label>
        <label style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
          <input type="radio" name="receiptPrintMode" value="buyer" checked={printMode === "buyer"} onChange={() => setPrintMode("buyer")} data-testid="radio-buyer" />
          공급받는자용만
        </label>
        <label style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
          <input type="radio" name="receiptPrintMode" value="supplier" checked={printMode === "supplier"} onChange={() => setPrintMode("supplier")} data-testid="radio-supplier" />
          공급자용만
        </label>
      </div>
    </div>
  );
});

SimpleReceiptForm.displayName = "SimpleReceiptForm";

export { SimpleReceiptForm };
