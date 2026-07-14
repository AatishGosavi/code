import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line,
} from "recharts";
import {
  LayoutDashboard, Gauge, PackageCheck, Boxes, RefreshCcw, Bell,
  Search, ChevronDown, Minus, Factory, Calendar, Menu, ArrowUpRight,
  ArrowDownRight, Table as TableIcon,
} from "lucide-react";

/* ---------------------------------------------------------------
   TOKENS
--------------------------------------------------------------- */
const C = {
  bg: "#0F1318",
  surface: "#161C24",
  surface2: "#1D242E",
  border: "#2A3340",
  borderSoft: "#232B36",
  text: "#E8ECF1",
  textDim: "#8B96A5",
  textFaint: "#5E6B7A",
  amber: "#F2A93B",
  amberSoft: "#F2A93B22",
  green: "#42B883",
  greenSoft: "#42B88322",
  red: "#E4584B",
  redSoft: "#E4584B22",
  blue: "#5B8DEF",
  blueSoft: "#5B8DEF22",
  purple: "#9B8CF2",
};

const fontImport = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
`;
const fontDisplay = "'Space Grotesk', sans-serif";
const fontBody = "'Inter', sans-serif";
const fontMono = "'IBM Plex Mono', monospace";

/* ---------------------------------------------------------------
   SAMPLE DATA (mirrors the uploaded Plan vs Actual workbook)
--------------------------------------------------------------- */
const PRODUCTS = ["D-250", "A1-250", "A2-250", "A2-200", "A1-200"];

const draw = {
  "D-250":  { monthPlan: 185000, preformPlan: 190000, ondatePlan: 6800, ondateActual: 6550, cumPlan: 138800, cumActual: 132400, reqTotal: 46200, askingRate: 2010, preformConsumed: 129800 },
  "A1-250": { monthPlan: 162000, preformPlan: 166000, ondatePlan: 5950, ondateActual: 6120, cumPlan: 121200, cumActual: 124300, reqTotal: 37700, askingRate: 1720, preformConsumed: 118500 },
  "A2-250": { monthPlan: 210000, preformPlan: 215500, ondatePlan: 7700, ondateActual: 7180, cumPlan: 157200, cumActual: 145900, reqTotal: 64100, askingRate: 2330, preformConsumed: 141200 },
  "A2-200": { monthPlan: 95000,  preformPlan: 97500,  ondatePlan: 3480, ondateActual: 3510, cumPlan: 71000,  cumActual: 71800,  reqTotal: 23200, askingRate: 1055, preformConsumed: 69700 },
  "A1-200": { monthPlan: 118000, preformPlan: 121000, ondatePlan: 4320, ondateActual: 4090, cumPlan: 88200,  cumActual: 82700,  reqTotal: 35300, askingRate: 1285, preformConsumed: 79900 },
};

const pack = {
  "D-250":  { monthPlan: 185000, ondatePlan: 6600, ondateActual: 6210, cumPlan: 134900, cumActual: 126800, reqTotal: 58100, askingRate: 2530 },
  "A1-250": { monthPlan: 162000, ondatePlan: 5800, ondateActual: 5920, cumPlan: 117300, cumActual: 119600, reqTotal: 42400, askingRate: 1935 },
  "A2-250": { monthPlan: 210000, ondatePlan: 7500, ondateActual: 6890, cumPlan: 152600, cumActual: 140100, reqTotal: 69900, askingRate: 2540 },
  "A2-200": { monthPlan: 95000,  ondatePlan: 3400, ondateActual: 3350, cumPlan: 69200,  cumActual: 68100,  reqTotal: 26900, askingRate: 1225 },
  "A1-200": { monthPlan: 118000, ondatePlan: 4200, ondateActual: 3870, cumPlan: 85700,  cumActual: 78900,  reqTotal: 39100, askingRate: 1425 },
};

const wipBalance = {
  "D-250":  { balanceDayDraw: 46200, addedInPack: 38900, wip: 40000, addedFromWip: 36000, totalBalancePack: 58100, packingPrediction: 55200 },
  "A1-250": { balanceDayDraw: 37700, addedInPack: 33800, wip: 18500, addedFromWip: 15200, totalBalancePack: 42400, packingPrediction: 40100 },
  "A2-250": { balanceDayDraw: 64100, addedInPack: 55600, wip: 26200, addedFromWip: 22800, totalBalancePack: 69900, packingPrediction: 66700 },
  "A2-200": { balanceDayDraw: 23200, addedInPack: 21100, wip: 9800,  addedFromWip: 8200,  totalBalancePack: 26900, packingPrediction: 25300 },
  "A1-200": { balanceDayDraw: 35300, addedInPack: 30200, wip: 14100, addedFromWip: 11900, totalBalancePack: 39100, packingPrediction: 36800 },
};

const fgStock = {
  "D-250":  { opening: 82000, pack: 38900, dispatch: 41200, closing: 79700 },
  "A1-250": { opening: 45600, pack: 33800, dispatch: 30900, closing: 48500 },
  "A2-250": { opening: 96200, pack: 55600, dispatch: 58100, closing: 93700 },
  "A2-200": { opening: 28100, pack: 21100, dispatch: 19800, closing: 29400 },
  "A1-200": { opening: 39800, pack: 30200, dispatch: 27600, closing: 42400 },
};

const wipAdy = {
  "D-250":  { opening: 42000, closing: 40000, ady: 3.8 },
  "A1-250": { opening: 20200, closing: 18500, ady: 2.9 },
  "A2-250": { opening: 28900, closing: 26200, ady: 4.1 },
  "A2-200": { opening: 11200, closing: 9800,  ady: 2.2 },
  "A1-200": { opening: 16400, closing: 14100, ady: 2.6 },
};

const rewinding = [
  { type: "PT Rewinding",    ftOndate: 96.2, ftCum: 95.4, ovOndate: 98.8, ovCum: 98.1 },
  { type: "Optical Rew",     ftOndate: 94.8, ftCum: 93.9, ovOndate: 97.6, ovCum: 97.0 },
  { type: "Geometrical Rew", ftOndate: 97.1, ftCum: 96.5, ovOndate: 99.0, ovCum: 98.6 },
  { type: "Col Rewinding",   ftOndate: 92.4, ftCum: 91.8, ovOndate: 96.3, ovCum: 95.7 },
  { type: "Overall Rew",     ftOndate: 95.1, ftCum: 94.4, ovOndate: 97.9, ovCum: 97.3 },
];

const dailyTrend = [
  { day: "Jul 08", plan: 6900, actual: 6420 },
  { day: "Jul 09", plan: 6900, actual: 6710 },
  { day: "Jul 10", plan: 6900, actual: 6980 },
  { day: "Jul 11", plan: 6900, actual: 6540 },
  { day: "Jul 12", plan: 6900, actual: 6690 },
  { day: "Jul 13", plan: 6900, actual: 7050 },
  { day: "Jul 14", plan: 6900, actual: 6810 },
];

const sum = (obj, key) => PRODUCTS.reduce((a, p) => a + (obj[p]?.[key] ?? 0), 0);
const nf = (n) => Math.round(n).toLocaleString("en-IN");
const pct = (a, b) => (b === 0 ? 0 : ((a - b) / b) * 100);

/* ---------------------------------------------------------------
   PRIMITIVES
--------------------------------------------------------------- */
function Delta({ value }) {
  const good = value >= 0;
  const Icon = value === 0 ? Minus : good ? ArrowUpRight : ArrowDownRight;
  const color = value === 0 ? C.textDim : good ? C.green : C.red;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color, fontFamily: fontMono, fontSize: 12, fontWeight: 600 }}>
      <Icon size={13} strokeWidth={2.5} />
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function StatCard({ label, value, unit, sub, deltaValue, accent = C.blue, compact }) {
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
      padding: compact ? "12px 14px" : "16px 18px", flex: 1, minWidth: compact ? 150 : 190,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: accent }} />
      <div style={{ fontFamily: fontBody, fontSize: compact ? 11 : 12, color: C.textDim, marginBottom: 7, letterSpacing: 0.3 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontFamily: fontMono, fontSize: compact ? 20 : 26, fontWeight: 600, color: C.text }}>{value}</span>
        {unit && <span style={{ fontFamily: fontBody, fontSize: 12, color: C.textFaint }}>{unit}</span>}
      </div>
      <div style={{ marginTop: 7, display: "flex", alignItems: "center", gap: 8, minHeight: 16 }}>
        {deltaValue !== undefined && <Delta value={deltaValue} />}
        {sub && <span style={{ fontFamily: fontBody, fontSize: 11.5, color: C.textFaint }}>{sub}</span>}
      </div>
    </div>
  );
}

function GaugeDial({ value, max, label, unit, danger = 15, warn = 25 }) {
  const clamped = Math.min(value, max);
  const angle = (clamped / max) * 180;
  const color = value <= danger ? C.red : value <= warn ? C.amber : C.green;
  const r = 70, cx = 90, cy = 90;
  const toXY = (deg) => {
    const rad = (Math.PI * (180 - deg)) / 180;
    return [cx + r * Math.cos(rad), cy - r * Math.sin(rad)];
  };
  const [nx, ny] = toXY(angle);
  const ticks = [0, 45, 90, 135, 180];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width="180" height="110" viewBox="0 0 180 110">
        <path d={`M 20 90 A 70 70 0 0 1 160 90`} fill="none" stroke={C.borderSoft} strokeWidth="12" strokeLinecap="round" />
        <path
          d={`M 20 90 A 70 70 0 0 1 ${cx + r * Math.cos((Math.PI * (180 - angle)) / 180)} ${cy - r * Math.sin((Math.PI * (180 - angle)) / 180)}`}
          fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
        />
        {ticks.map((t) => {
          const [tx, ty] = toXY(t);
          return <circle key={t} cx={tx} cy={ty} r="2" fill={C.textFaint} />;
        })}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={C.text} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="4.5" fill={C.text} />
      </svg>
      <div style={{ marginTop: -8, fontFamily: fontMono, fontSize: 22, fontWeight: 600, color }}>{value}<span style={{ fontSize: 12, color: C.textFaint, marginLeft: 3 }}>{unit}</span></div>
      <div style={{ fontFamily: fontBody, fontSize: 11.5, color: C.textDim, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function LedBar({ value, target, segments = 12 }) {
  const filled = Math.round(Math.min(value / target, 1.3) * segments);
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {Array.from({ length: segments }).map((_, i) => {
        const on = i < filled;
        let color = C.borderSoft;
        if (on) {
          const posRatio = i / segments;
          color = posRatio < 0.55 ? C.red : posRatio < 0.8 ? C.amber : C.green;
        }
        return <div key={i} style={{ width: 6, height: 14, borderRadius: 1.5, background: color }} />;
      })}
    </div>
  );
}

function SectionTitle({ eyebrow, title, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
      <div>
        {eyebrow && <div style={{ fontFamily: fontMono, fontSize: 11, letterSpacing: 1.5, color: C.amber, textTransform: "uppercase", marginBottom: 4 }}>{eyebrow}</div>}
        <div style={{ fontFamily: fontDisplay, fontSize: 19, fontWeight: 600, color: C.text }}>{title}</div>
      </div>
      {action}
    </div>
  );
}

function Card({ children, style }) {
  return <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, ...style }}>{children}</div>;
}

function Table({ columns, rows, highlightLastRow = true }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: fontMono, fontSize: 12.5, minWidth: 640 }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} style={{
                textAlign: c.align || "right", padding: "9px 12px", color: C.textDim, fontFamily: fontBody,
                fontSize: 11, fontWeight: 600, letterSpacing: 0.3, textTransform: "uppercase",
                borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap",
              }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const isTotal = highlightLastRow && i === rows.length - 1;
            return (
              <tr key={i} style={{ background: isTotal ? C.surface2 : "transparent" }}>
                {columns.map((c) => (
                  <td key={c.key} style={{
                    textAlign: c.align || "right", padding: "9px 12px", color: isTotal ? C.text : C.textDim,
                    fontWeight: isTotal ? 600 : 400, borderBottom: `1px solid ${C.borderSoft}`, whiteSpace: "nowrap",
                  }}>
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function GapCell({ v }) {
  const color = v > 0 ? C.green : v < 0 ? C.red : C.textFaint;
  return <span style={{ color, fontWeight: 600 }}>{v > 0 ? "+" : ""}{nf(v)}</span>;
}

/* ---------------------------------------------------------------
   NAV (anchors — everything lives on one scrollable page)
--------------------------------------------------------------- */
const NAV = [
  { key: "command", label: "Command Center", icon: LayoutDashboard },
  { key: "draw", label: "Draw Production", icon: Gauge },
  { key: "packing", label: "Packing", icon: PackageCheck },
  { key: "wip", label: "WIP & FG Stock", icon: Boxes },
  { key: "rewinding", label: "Rewinding", icon: RefreshCcw },
  { key: "excel", label: "Excel Report View", icon: TableIcon },
];

/* ---------------------------------------------------------------
   EXCEL-REPLICA TOKENS — mirrors the uploaded workbook's own look
   (white paper, thin grey gridlines) rather than the dark theme
--------------------------------------------------------------- */
const E = {
  paper: "#FFFFFF",
  grid: "#BFBFBF",
  headerBg: "#1F4E78",
  headerText: "#FFFFFF",
  subHeaderBg: "#DCE6F1",
  totalBg: "#DDEBF7",
  bandBg: "#F7F9FB",
  text: "#1A1A1A",
  textDim: "#5A5A5A",
  font: "Calibri, Arial, sans-serif",
};

function XlCell({ children, header, sub, total, align = "right", ...props }) {
  return (
    <td
      {...props}
      style={{
        border: `1px solid ${E.grid}`,
        padding: "5px 9px",
        fontFamily: E.font,
        fontSize: 12.5,
        textAlign: header ? "center" : align,
        background: header ? E.headerBg : sub ? E.subHeaderBg : total ? E.totalBg : E.paper,
        color: header ? E.headerText : E.text,
        fontWeight: header || total ? 700 : 400,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </td>
  );
}

function XlTh({ children, colSpan, rowSpan, sub }) {
  return (
    <th
      colSpan={colSpan}
      rowSpan={rowSpan}
      style={{
        border: `1px solid ${E.grid}`,
        padding: "6px 9px",
        fontFamily: E.font,
        fontSize: 12.5,
        textAlign: "center",
        background: sub ? E.subHeaderBg : E.headerBg,
        color: sub ? E.text : E.headerText,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}

function XlPaper({ tabLabel, children }) {
  return (
    <div style={{ background: E.paper, borderRadius: 10, overflow: "hidden", border: `1px solid ${C.border}`, marginBottom: 26 }}>
      <div style={{
        background: "#E9EDF1", padding: "7px 14px", display: "flex", alignItems: "center", gap: 8,
        borderBottom: `1px solid ${E.grid}`, fontFamily: E.font,
      }}>
        <TableIcon size={13} color="#217346" />
        <span style={{ fontSize: 12, color: "#3a3a3a", fontWeight: 600 }}>{tabLabel}</span>
      </div>
      <div style={{ padding: 16, overflowX: "auto" }}>{children}</div>
    </div>
  );
}

/* ---------------------------------------------------------------
   CHART / TABLE DATA PREP (shared)
--------------------------------------------------------------- */
const drawBarData = PRODUCTS.map((p) => ({ name: p, Plan: draw[p].cumPlan, Actual: draw[p].cumActual }));
const packBarData = PRODUCTS.map((p) => ({ name: p, Plan: pack[p].cumPlan, Actual: pack[p].cumActual }));
const drawOndateChart = PRODUCTS.map((p) => ({ name: p, Plan: draw[p].ondatePlan, Actual: draw[p].ondateActual }));
const fgChartData = PRODUCTS.map((p) => ({ name: p, Opening: fgStock[p].opening, Closing: fgStock[p].closing }));
const rewChartData = rewinding.map((r) => ({ name: r.type.replace(" Rewinding", "").replace(" Rew", ""), "First Time": r.ftCum, "Overall": r.ovCum }));

const drawRows = PRODUCTS.map((p) => ({ product: p, ...draw[p] }));
const drawTotal = {
  product: "Total", monthPlan: sum(draw, "monthPlan"), preformPlan: sum(draw, "preformPlan"),
  ondatePlan: sum(draw, "ondatePlan"), ondateActual: sum(draw, "ondateActual"),
  cumPlan: sum(draw, "cumPlan"), cumActual: sum(draw, "cumActual"),
  reqTotal: sum(draw, "reqTotal"), askingRate: sum(draw, "askingRate"), preformConsumed: sum(draw, "preformConsumed"),
};
const drawColumns = [
  { key: "product", label: "Product", align: "left" },
  { key: "monthPlan", label: "Month Draw Plan", render: (r) => nf(r.monthPlan) },
  { key: "preformPlan", label: "Preform Plan", render: (r) => nf(r.preformPlan) },
  { key: "ondatePlan", label: "Ondate Plan", render: (r) => nf(r.ondatePlan) },
  { key: "ondateActual", label: "Ondate Actual", render: (r) => nf(r.ondateActual) },
  { key: "ondateGap", label: "Ondate Gap", render: (r) => <GapCell v={r.ondateActual - r.ondatePlan} /> },
  { key: "cumPlan", label: "Cum. Plan", render: (r) => nf(r.cumPlan) },
  { key: "cumActual", label: "Cum. Actual", render: (r) => nf(r.cumActual) },
  { key: "cumGap", label: "Cum. Gap", render: (r) => <GapCell v={r.cumActual - r.cumPlan} /> },
  { key: "reqTotal", label: "Req. Total Draw", render: (r) => nf(r.reqTotal) },
  { key: "askingRate", label: "Asking Rate/Day", render: (r) => nf(r.askingRate) },
  { key: "preformConsumed", label: "Preform Consumed", render: (r) => nf(r.preformConsumed) },
];

const packRows = PRODUCTS.map((p) => ({ product: p, ...pack[p] }));
const packTotal = {
  product: "Total", monthPlan: sum(pack, "monthPlan"), ondatePlan: sum(pack, "ondatePlan"),
  ondateActual: sum(pack, "ondateActual"), cumPlan: sum(pack, "cumPlan"), cumActual: sum(pack, "cumActual"),
  reqTotal: sum(pack, "reqTotal"), askingRate: sum(pack, "askingRate"),
};
const packColumns = [
  { key: "product", label: "Product", align: "left" },
  { key: "monthPlan", label: "Month Pack Plan", render: (r) => nf(r.monthPlan) },
  { key: "ondatePlan", label: "Ondate Plan", render: (r) => nf(r.ondatePlan) },
  { key: "ondateActual", label: "Ondate Actual", render: (r) => nf(r.ondateActual) },
  { key: "ondateGap", label: "Ondate Gap", render: (r) => <GapCell v={r.ondateActual - r.ondatePlan} /> },
  { key: "cumPlan", label: "Cum. Plan", render: (r) => nf(r.cumPlan) },
  { key: "cumActual", label: "Cum. Actual", render: (r) => nf(r.cumActual) },
  { key: "cumGap", label: "Cum. Gap", render: (r) => <GapCell v={r.cumActual - r.cumPlan} /> },
  { key: "reqTotal", label: "Req. Total Pack", render: (r) => nf(r.reqTotal) },
  { key: "askingRate", label: "Asking Rate/Day", render: (r) => nf(r.askingRate) },
];

const wipRows = PRODUCTS.map((p) => ({ product: p, ...wipBalance[p] }));
const wipTotal = {
  product: "Total", balanceDayDraw: sum(wipBalance, "balanceDayDraw"), addedInPack: sum(wipBalance, "addedInPack"),
  wip: sum(wipBalance, "wip"), addedFromWip: sum(wipBalance, "addedFromWip"),
  totalBalancePack: sum(wipBalance, "totalBalancePack"), packingPrediction: sum(wipBalance, "packingPrediction"),
};
const wipColumns = [
  { key: "product", label: "Product", align: "left" },
  { key: "balanceDayDraw", label: "Balance Day Draw", render: (r) => nf(r.balanceDayDraw) },
  { key: "addedInPack", label: "Added in Pack", render: (r) => nf(r.addedInPack) },
  { key: "wip", label: "WIP", render: (r) => nf(r.wip) },
  { key: "addedFromWip", label: "Added From WIP", render: (r) => nf(r.addedFromWip) },
  { key: "totalBalancePack", label: "Total Balance Pack", render: (r) => nf(r.totalBalancePack) },
  { key: "packingPrediction", label: "Packing Prediction", render: (r) => nf(r.packingPrediction) },
];

const fgRows = PRODUCTS.map((p) => ({ product: p, ...fgStock[p] }));
const fgTotal = { product: "Total", opening: sum(fgStock, "opening"), pack: sum(fgStock, "pack"), dispatch: sum(fgStock, "dispatch"), closing: sum(fgStock, "closing") };
const fgColumns = [
  { key: "product", label: "Product", align: "left" },
  { key: "opening", label: "Opening", render: (r) => nf(r.opening) },
  { key: "pack", label: "Pack", render: (r) => nf(r.pack) },
  { key: "dispatch", label: "Dispatch", render: (r) => nf(r.dispatch) },
  { key: "closing", label: "Closing", render: (r) => nf(r.closing) },
];

const adyRows = PRODUCTS.map((p) => ({ product: p, ...wipAdy[p] }));
const adyTotal = { product: "Total", opening: sum(wipAdy, "opening"), closing: sum(wipAdy, "closing"), ady: (sum(wipAdy, "closing") / sum(fgStock, "dispatch") * 30).toFixed(1) };
const adyColumns = [
  { key: "product", label: "Product", align: "left" },
  { key: "opening", label: "Opening", render: (r) => nf(r.opening) },
  { key: "closing", label: "Closing", render: (r) => nf(r.closing) },
  { key: "ady", label: "ADY (days)", render: (r) => r.ady },
];

const rewColumns = [
  { key: "type", label: "Process", align: "left" },
  { key: "ftOndate", label: "First Time — Ondate %", render: (r) => r.ftOndate.toFixed(1) },
  { key: "ftCum", label: "First Time — Cum %", render: (r) => r.ftCum.toFixed(1) },
  { key: "ovOndate", label: "Overall — Ondate %", render: (r) => r.ovOndate.toFixed(1) },
  { key: "ovCum", label: "Overall — Cum %", render: (r) => r.ovCum.toFixed(1) },
];
const rewOverall = rewinding.find((r) => r.type === "Overall Rew");

const chartAxis = { stroke: C.textFaint, tick: { fontSize: 11, fontFamily: fontMono } };
const tooltipStyle = { background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: fontMono, fontSize: 12 };

/* ---------------------------------------------------------------
   SECTIONS
--------------------------------------------------------------- */
function CommandCenter() {
  const drawCumPlan = sum(draw, "cumPlan"), drawCumActual = sum(draw, "cumActual");
  const packCumPlan = sum(pack, "cumPlan"), packCumActual = sum(pack, "cumActual");
  const totalWip = sum(wipAdy, "closing");
  const totalFgClosing = sum(fgStock, "closing");

  return (
    <>
      <SectionTitle eyebrow="Whole Plant · May 2026" title="Command center" action={
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: fontMono, fontSize: 12, color: C.textDim }}>
          <Calendar size={14} /> As on 04 Jul 2026 · Balance days 27.5
        </div>
      } />

      {/* row 1: top-line KPIs across every stage */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
        <StatCard label="Draw — Cum. Actual" value={nf(drawCumActual)} unit="FKM" sub={`Plan ${nf(drawCumPlan)}`} deltaValue={pct(drawCumActual, drawCumPlan)} accent={C.blue} />
        <StatCard label="Pack — Cum. Actual" value={nf(packCumActual)} unit="FKM" sub={`Plan ${nf(packCumPlan)}`} deltaValue={pct(packCumActual, packCumPlan)} accent={C.purple} />
        <StatCard label="WIP Closing" value={nf(totalWip)} unit="FKM" sub="Across all lines" accent={C.amber} />
        <StatCard label="FG Closing Stock" value={nf(totalFgClosing)} unit="FKM" sub="Warehouse total" accent={C.green} />
        <StatCard label="Draw Asking Rate" value={nf(sum(draw, "askingRate"))} unit="/day" sub="To hit month plan" accent={C.blue} />
        <StatCard label="Pack Asking Rate" value={nf(sum(pack, "askingRate"))} unit="/day" sub="To hit month plan" accent={C.purple} />
        <StatCard label="Packing Prediction" value={nf(sum(wipBalance, "packingPrediction"))} unit="FKM" sub="Model estimate" accent={C.green} />
        <StatCard label="Overall Rew — Cum." value={rewOverall.ovCum.toFixed(1)} unit="%" sub={`First-time ${rewOverall.ftCum.toFixed(1)}%`} deltaValue={rewOverall.ovCum - rewOverall.ftCum} accent={C.red} />
      </div>

      {/* row 2: gauge + trend */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
        <Card style={{ flex: "0 0 220px", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <GaugeDial value={27.5} max={31} label="Balance Days" unit="d" />
        </Card>
        <Card style={{ flex: 2, minWidth: 320 }}>
          <SectionTitle title="Daily draw — plan vs actual (last 7 days)" />
          <ResponsiveContainer width="100%" height={170}>
            <LineChart data={dailyTrend}>
              <CartesianGrid stroke={C.borderSoft} vertical={false} />
              <XAxis dataKey="day" {...chartAxis} />
              <YAxis {...chartAxis} width={40} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="plan" stroke={C.textFaint} strokeDasharray="4 3" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="actual" stroke={C.amber} dot={{ r: 3 }} strokeWidth={2.5} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* row 3: four mini charts, one per stage, all visible together */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        <Card>
          <SectionTitle title="Draw — cumulative" />
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={drawBarData}>
              <CartesianGrid stroke={C.borderSoft} vertical={false} />
              <XAxis dataKey="name" {...chartAxis} />
              <YAxis {...chartAxis} width={40} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="Plan" fill={C.textFaint} radius={[3, 3, 0, 0]} />
              <Bar dataKey="Actual" fill={C.blue} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionTitle title="Packing — cumulative" />
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={packBarData}>
              <CartesianGrid stroke={C.borderSoft} vertical={false} />
              <XAxis dataKey="name" {...chartAxis} />
              <YAxis {...chartAxis} width={40} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="Plan" fill={C.textFaint} radius={[3, 3, 0, 0]} />
              <Bar dataKey="Actual" fill={C.purple} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionTitle title="FG stock — open vs close" />
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={fgChartData}>
              <CartesianGrid stroke={C.borderSoft} vertical={false} />
              <XAxis dataKey="name" {...chartAxis} />
              <YAxis {...chartAxis} width={40} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="Opening" fill={C.textFaint} radius={[3, 3, 0, 0]} />
              <Bar dataKey="Closing" fill={C.green} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionTitle title="Rewinding — cumulative %" />
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={rewChartData}>
              <CartesianGrid stroke={C.borderSoft} vertical={false} />
              <XAxis dataKey="name" {...chartAxis} />
              <YAxis {...chartAxis} width={34} domain={[85, 100]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="First Time" fill={C.amber} radius={[3, 3, 0, 0]} />
              <Bar dataKey="Overall" fill={C.green} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </>
  );
}

function DrawSection() {
  return (
    <>
      <SectionTitle eyebrow="OF — Production" title="Draw plan vs actual" />
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <StatCard compact label="Cumulative Actual" value={nf(sum(draw, "cumActual"))} unit="FKM" deltaValue={pct(sum(draw, "cumActual"), sum(draw, "cumPlan"))} sub={`Plan ${nf(sum(draw, "cumPlan"))}`} accent={C.blue} />
        <StatCard compact label="Ondate Actual" value={nf(sum(draw, "ondateActual"))} unit="FKM" deltaValue={pct(sum(draw, "ondateActual"), sum(draw, "ondatePlan"))} sub={`Plan ${nf(sum(draw, "ondatePlan"))}`} accent={C.green} />
        <StatCard compact label="Required Total Draw" value={nf(sum(draw, "reqTotal"))} unit="FKM" sub="Balance to complete" accent={C.amber} />
        <StatCard compact label="Preform Consumed" value={nf(sum(draw, "preformConsumed"))} unit="FKM" sub="Till date" accent={C.purple} />
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
        <Card style={{ flex: 2, minWidth: 340 }}>
          <SectionTitle title="Ondate — plan vs actual" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={drawOndateChart}>
              <CartesianGrid stroke={C.borderSoft} vertical={false} />
              <XAxis dataKey="name" {...chartAxis} />
              <YAxis {...chartAxis} width={45} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontFamily: fontBody, fontSize: 12 }} />
              <Bar dataKey="Plan" fill={C.textFaint} radius={[3, 3, 0, 0]} />
              <Bar dataKey="Actual" fill={C.blue} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card style={{ flex: 1, minWidth: 260 }}>
          <SectionTitle title="Asking rate / day" />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {PRODUCTS.map((p) => (
              <div key={p}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontFamily: fontBody, fontSize: 12.5, color: C.textDim }}>{p}</span>
                  <span style={{ fontFamily: fontMono, fontSize: 12, color: C.text }}>{nf(draw[p].askingRate)}</span>
                </div>
                <LedBar value={draw[p].askingRate} target={draw[p].askingRate * 0.9} />
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card>
        <SectionTitle title="Product-wise detail" />
        <Table columns={drawColumns} rows={[...drawRows, drawTotal]} />
      </Card>
    </>
  );
}

function PackingSection() {
  return (
    <>
      <SectionTitle eyebrow="OF — Packing" title="Packing plan vs actual" />
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <StatCard compact label="Cumulative Actual" value={nf(sum(pack, "cumActual"))} unit="FKM" deltaValue={pct(sum(pack, "cumActual"), sum(pack, "cumPlan"))} sub={`Plan ${nf(sum(pack, "cumPlan"))}`} accent={C.purple} />
        <StatCard compact label="Ondate Actual" value={nf(sum(pack, "ondateActual"))} unit="FKM" deltaValue={pct(sum(pack, "ondateActual"), sum(pack, "ondatePlan"))} sub={`Plan ${nf(sum(pack, "ondatePlan"))}`} accent={C.green} />
        <StatCard compact label="Required Total Pack" value={nf(sum(pack, "reqTotal"))} unit="FKM" sub="Balance to complete" accent={C.amber} />
        <StatCard compact label="Packing Prediction" value={nf(sum(wipBalance, "packingPrediction"))} unit="FKM" sub="Model estimate" accent={C.blue} />
      </div>
      <Card style={{ marginBottom: 16 }}>
        <SectionTitle title="Product-wise detail" />
        <Table columns={packColumns} rows={[...packRows, packTotal]} />
      </Card>
      <Card>
        <SectionTitle title="Balance day draw, WIP & packing prediction" />
        <Table columns={wipColumns} rows={[...wipRows, wipTotal]} />
      </Card>
    </>
  );
}

function WipFgSection() {
  return (
    <>
      <SectionTitle eyebrow="Stock & WIP" title="WIP and finished goods stock" />
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <StatCard compact label="FG Opening" value={nf(fgTotal.opening)} unit="FKM" accent={C.blue} />
        <StatCard compact label="FG Closing" value={nf(fgTotal.closing)} unit="FKM" deltaValue={pct(fgTotal.closing, fgTotal.opening)} accent={C.green} />
        <StatCard compact label="Dispatch (period)" value={nf(fgTotal.dispatch)} unit="FKM" accent={C.amber} />
        <StatCard compact label="WIP Closing" value={nf(sum(wipAdy, "closing"))} unit="FKM" accent={C.purple} />
      </div>
      <Card style={{ marginBottom: 16 }}>
        <SectionTitle title="Opening vs closing stock by product" />
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={fgChartData}>
            <CartesianGrid stroke={C.borderSoft} vertical={false} />
            <XAxis dataKey="name" {...chartAxis} />
            <YAxis {...chartAxis} width={45} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontFamily: fontBody, fontSize: 12 }} />
            <Bar dataKey="Opening" fill={C.textFaint} radius={[3, 3, 0, 0]} />
            <Bar dataKey="Closing" fill={C.green} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <Card style={{ flex: 1, minWidth: 320 }}>
          <SectionTitle title="FG stock update" />
          <Table columns={fgColumns} rows={[...fgRows, fgTotal]} />
        </Card>
        <Card style={{ flex: 1, minWidth: 320 }}>
          <SectionTitle title="WIP & average days yield" />
          <Table columns={adyColumns} rows={[...adyRows, adyTotal]} />
        </Card>
      </div>
    </>
  );
}

function RewindingSection() {
  return (
    <>
      <SectionTitle eyebrow="Quality" title="Rewinding efficiency — first time vs overall" />
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <StatCard compact label="Overall Rew — First Time" value={rewOverall.ftCum.toFixed(1)} unit="%" sub="Cumulative" accent={C.amber} />
        <StatCard compact label="Overall Rew — Overall" value={rewOverall.ovCum.toFixed(1)} unit="%" sub="Cumulative" accent={C.green} />
        <StatCard compact label="Best Process" value="Geometrical" sub="99.0% ondate" accent={C.blue} />
        <StatCard compact label="Needs Attention" value="Col Rewinding" sub="92.4% ondate" accent={C.red} />
      </div>
      <Card style={{ marginBottom: 16 }}>
        <SectionTitle title="Cumulative efficiency by process" />
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={rewChartData}>
            <CartesianGrid stroke={C.borderSoft} vertical={false} />
            <XAxis dataKey="name" {...chartAxis} />
            <YAxis {...chartAxis} width={40} domain={[85, 100]} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontFamily: fontBody, fontSize: 12 }} />
            <Bar dataKey="First Time" fill={C.amber} radius={[3, 3, 0, 0]} />
            <Bar dataKey="Overall" fill={C.green} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card>
        <SectionTitle title="Process detail" />
        <Table columns={rewColumns} rows={rewinding} />
      </Card>
    </>
  );
}

function ExcelReportSection() {
  return (
    <>
      <SectionTitle eyebrow="Sheet1" title="OF — Production MIS Report (May 2026)" action={
        <div style={{ fontFamily: fontMono, fontSize: 11.5, color: C.textFaint }}>Exact layout of the uploaded workbook, populated with sample values</div>
      } />

      {/* ---- OF - Production (Draw) Plan Vs Actual ---- */}
      <XlPaper tabLabel="OF- Production Plan Vs Actual">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, fontFamily: E.font, fontSize: 12.5, color: E.textDim }}>
          <span><b style={{ color: E.text }}>Date:</b> 04-Jul-2026</span>
          <span><b style={{ color: E.text }}>Balance Days:</b> 27.5</span>
        </div>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 900 }}>
          <thead>
            <tr>
              <XlTh rowSpan={2}>Product</XlTh>
              <XlTh rowSpan={2}>Month Draw Plan (FKM)</XlTh>
              <XlTh rowSpan={2}>Preform Consumption Plan (FKM)</XlTh>
              <XlTh colSpan={3}>Ondate</XlTh>
              <XlTh colSpan={3}>Cumulative</XlTh>
              <XlTh rowSpan={2}>Required Total Draw</XlTh>
              <XlTh rowSpan={2}>Asking Rate/Day</XlTh>
              <XlTh rowSpan={2}>Till Date Preform Consumed</XlTh>
            </tr>
            <tr>
              <XlTh sub>Plan</XlTh><XlTh sub>Actual</XlTh><XlTh sub>Gap</XlTh>
              <XlTh sub>Plan</XlTh><XlTh sub>Actual</XlTh><XlTh sub>Gap</XlTh>
            </tr>
          </thead>
          <tbody>
            {[...drawRows, drawTotal].map((r, i) => {
              const isTotal = i === drawRows.length;
              return (
                <tr key={r.product}>
                  <XlCell align="left" total={isTotal}>{r.product}</XlCell>
                  <XlCell total={isTotal}>{nf(r.monthPlan)}</XlCell>
                  <XlCell total={isTotal}>{nf(r.preformPlan)}</XlCell>
                  <XlCell total={isTotal}>{nf(r.ondatePlan)}</XlCell>
                  <XlCell total={isTotal}>{nf(r.ondateActual)}</XlCell>
                  <XlCell total={isTotal}>{nf(r.ondateActual - r.ondatePlan)}</XlCell>
                  <XlCell total={isTotal}>{nf(r.cumPlan)}</XlCell>
                  <XlCell total={isTotal}>{nf(r.cumActual)}</XlCell>
                  <XlCell total={isTotal}>{nf(r.cumActual - r.cumPlan)}</XlCell>
                  <XlCell total={isTotal}>{nf(r.reqTotal)}</XlCell>
                  <XlCell total={isTotal}>{nf(r.askingRate)}</XlCell>
                  <XlCell total={isTotal}>{nf(r.preformConsumed)}</XlCell>
                </tr>
              );
            })}
          </tbody>
        </table>
      </XlPaper>

      {/* ---- OF - Packing Plan Vs Actual ---- */}
      <XlPaper tabLabel="OF - Packing Plan Vs Actual">
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 820 }}>
          <thead>
            <tr>
              <XlTh rowSpan={2}>Product</XlTh>
              <XlTh rowSpan={2}>Month Pack Plan (FKM)</XlTh>
              <XlTh colSpan={3}>Ondate</XlTh>
              <XlTh colSpan={3}>Cumulative</XlTh>
              <XlTh rowSpan={2}>Required Total Pack</XlTh>
              <XlTh rowSpan={2}>Asking Rate/Day</XlTh>
            </tr>
            <tr>
              <XlTh sub>Plan</XlTh><XlTh sub>Actual</XlTh><XlTh sub>Gap</XlTh>
              <XlTh sub>Plan</XlTh><XlTh sub>Actual</XlTh><XlTh sub>Gap</XlTh>
            </tr>
          </thead>
          <tbody>
            {[...packRows, packTotal].map((r, i) => {
              const isTotal = i === packRows.length;
              return (
                <tr key={r.product}>
                  <XlCell align="left" total={isTotal}>{r.product}</XlCell>
                  <XlCell total={isTotal}>{nf(r.monthPlan)}</XlCell>
                  <XlCell total={isTotal}>{nf(r.ondatePlan)}</XlCell>
                  <XlCell total={isTotal}>{nf(r.ondateActual)}</XlCell>
                  <XlCell total={isTotal}>{nf(r.ondateActual - r.ondatePlan)}</XlCell>
                  <XlCell total={isTotal}>{nf(r.cumPlan)}</XlCell>
                  <XlCell total={isTotal}>{nf(r.cumActual)}</XlCell>
                  <XlCell total={isTotal}>{nf(r.cumActual - r.cumPlan)}</XlCell>
                  <XlCell total={isTotal}>{nf(r.reqTotal)}</XlCell>
                  <XlCell total={isTotal}>{nf(r.askingRate)}</XlCell>
                </tr>
              );
            })}
          </tbody>
        </table>
      </XlPaper>

      {/* ---- Balance Day Draw / WIP / Packing Prediction ---- */}
      <XlPaper tabLabel="Balance Day Draw · WIP · Packing Prediction">
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 760 }}>
          <thead>
            <tr>
              <XlTh>Product</XlTh>
              <XlTh>Balance Day Draw</XlTh>
              <XlTh>Added in Pack</XlTh>
              <XlTh>WIP</XlTh>
              <XlTh>Added in Pack From WIP</XlTh>
              <XlTh>Total Balance Day Pack</XlTh>
              <XlTh>Packing Prediction</XlTh>
            </tr>
          </thead>
          <tbody>
            {[...wipRows, wipTotal].map((r, i) => {
              const isTotal = i === wipRows.length;
              return (
                <tr key={r.product}>
                  <XlCell align="left" total={isTotal}>{r.product}</XlCell>
                  <XlCell total={isTotal}>{nf(r.balanceDayDraw)}</XlCell>
                  <XlCell total={isTotal}>{nf(r.addedInPack)}</XlCell>
                  <XlCell total={isTotal}>{nf(r.wip)}</XlCell>
                  <XlCell total={isTotal}>{nf(r.addedFromWip)}</XlCell>
                  <XlCell total={isTotal}>{nf(r.totalBalancePack)}</XlCell>
                  <XlCell total={isTotal}>{nf(r.packingPrediction)}</XlCell>
                </tr>
              );
            })}
          </tbody>
        </table>
      </XlPaper>

      {/* ---- FG Stock Update  +  WIP & ADY (side by side, as in the sheet) ---- */}
      <XlPaper tabLabel="FG Stock Update  ·  WIP & ADY">
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <table style={{ borderCollapse: "collapse", minWidth: 440 }}>
            <thead>
              <tr><XlTh colSpan={5}>FG Stock Update</XlTh></tr>
              <tr>
                <XlTh sub>Product</XlTh><XlTh sub>Opening</XlTh><XlTh sub>Pack</XlTh><XlTh sub>Dispatch</XlTh><XlTh sub>Closing</XlTh>
              </tr>
            </thead>
            <tbody>
              {[...fgRows, fgTotal].map((r, i) => {
                const isTotal = i === fgRows.length;
                return (
                  <tr key={r.product}>
                    <XlCell align="left" total={isTotal}>{r.product}</XlCell>
                    <XlCell total={isTotal}>{nf(r.opening)}</XlCell>
                    <XlCell total={isTotal}>{nf(r.pack)}</XlCell>
                    <XlCell total={isTotal}>{nf(r.dispatch)}</XlCell>
                    <XlCell total={isTotal}>{nf(r.closing)}</XlCell>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <table style={{ borderCollapse: "collapse", minWidth: 340 }}>
            <thead>
              <tr><XlTh colSpan={4}>WIP & ADY</XlTh></tr>
              <tr>
                <XlTh sub>Product</XlTh><XlTh sub>Opening</XlTh><XlTh sub>Closing</XlTh><XlTh sub>ADY</XlTh>
              </tr>
            </thead>
            <tbody>
              {[...adyRows, adyTotal].map((r, i) => {
                const isTotal = i === adyRows.length;
                return (
                  <tr key={r.product}>
                    <XlCell align="left" total={isTotal}>{r.product}</XlCell>
                    <XlCell total={isTotal}>{nf(r.opening)}</XlCell>
                    <XlCell total={isTotal}>{nf(r.closing)}</XlCell>
                    <XlCell total={isTotal}>{r.ady}</XlCell>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </XlPaper>

      {/* ---- Rewinding: First Time Rew vs Overall Rew ---- */}
      <XlPaper tabLabel="First Time Rew  ·  Overall Rew">
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 560 }}>
          <thead>
            <tr>
              <XlTh rowSpan={2}>Process</XlTh>
              <XlTh colSpan={2}>First Time Rew</XlTh>
              <XlTh colSpan={2}>Overall Rew</XlTh>
            </tr>
            <tr>
              <XlTh sub>Ondate</XlTh><XlTh sub>Cumulative</XlTh>
              <XlTh sub>Ondate</XlTh><XlTh sub>Cumulative</XlTh>
            </tr>
          </thead>
          <tbody>
            {rewinding.map((r) => (
              <tr key={r.type}>
                <XlCell align="left" total={r.type === "Overall Rew"}>{r.type}</XlCell>
                <XlCell total={r.type === "Overall Rew"}>{r.ftOndate.toFixed(1)}</XlCell>
                <XlCell total={r.type === "Overall Rew"}>{r.ftCum.toFixed(1)}</XlCell>
                <XlCell total={r.type === "Overall Rew"}>{r.ovOndate.toFixed(1)}</XlCell>
                <XlCell total={r.type === "Overall Rew"}>{r.ovCum.toFixed(1)}</XlCell>
              </tr>
            ))}
          </tbody>
        </table>
      </XlPaper>
    </>
  );
}

/* ---------------------------------------------------------------
   SHELL — one scrollable page, sidebar is a scroll-spy jump nav
--------------------------------------------------------------- */
export default function ProductionDashboard() {
  const [active, setActive] = useState("command");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const sectionRefs = useRef({});
  const scrollRef = useRef(null);
  const isClickScroll = useRef(false);

  const registerRef = useCallback((key) => (el) => { sectionRefs.current[key] = el; }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const onScroll = () => {
      if (isClickScroll.current) return;
      let closest = "command", closestDist = Infinity;
      for (const item of NAV) {
        const el = sectionRefs.current[item.key];
        if (!el) continue;
        const dist = Math.abs(el.getBoundingClientRect().top - container.getBoundingClientRect().top - 20);
        if (dist < closestDist) { closestDist = dist; closest = item.key; }
      }
      setActive(closest);
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  const jumpTo = (key) => {
    setActive(key);
    isClickScroll.current = true;
    sectionRefs.current[key]?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => { isClickScroll.current = false; }, 700);
  };

  return (
    <div style={{ fontFamily: fontBody, background: C.bg, color: C.text, height: "100vh", display: "flex" }}>
      <style>{fontImport}{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { height: 8px; width: 8px; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.35; } }
      `}</style>

      {/* SIDEBAR */}
      <aside style={{
        width: sidebarOpen ? 232 : 68, transition: "width .2s ease", flexShrink: 0,
        background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column",
        padding: "18px 12px", height: "100vh",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 6px 20px", borderBottom: `1px solid ${C.borderSoft}`, marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: C.amberSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Factory size={17} color={C.amber} />
          </div>
          {sidebarOpen && (
            <div>
              <div style={{ fontFamily: fontDisplay, fontSize: 14.5, fontWeight: 700, lineHeight: 1.1 }}>OF PLANT MIS</div>
              <div style={{ fontFamily: fontMono, fontSize: 10.5, color: C.textFaint }}>Production Control</div>
            </div>
          )}
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <button
                key={item.key}
                onClick={() => jumpTo(item.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 11, padding: "10px 12px", borderRadius: 8,
                  background: isActive ? C.amberSoft : "transparent", border: "none", cursor: "pointer",
                  color: isActive ? C.amber : C.textDim, fontFamily: fontBody, fontSize: 13.5, fontWeight: isActive ? 600 : 500,
                  textAlign: "left", width: "100%", transition: "all .15s",
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = C.surface2; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <Icon size={17} strokeWidth={2} style={{ flexShrink: 0 }} />
                {sidebarOpen && item.label}
              </button>
            );
          })}
        </nav>

        <button onClick={() => setSidebarOpen((s) => !s)} style={{
          display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 8, border: `1px solid ${C.borderSoft}`,
          background: "transparent", color: C.textFaint, cursor: "pointer", fontFamily: fontBody, fontSize: 12,
        }}>
          <Menu size={15} /> {sidebarOpen && "Collapse"}
        </button>
      </aside>

      {/* MAIN — single scroll container holding every section */}
      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", height: "100vh" }}>
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 26px",
          borderBottom: `1px solid ${C.border}`, background: C.bg, zIndex: 10, flexShrink: 0,
        }}>
          <div>
            <div style={{ fontFamily: fontDisplay, fontSize: 17, fontWeight: 600 }}>Entire Plant — One-Page View</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: fontMono, fontSize: 11, color: C.textFaint, marginTop: 2 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, display: "inline-block", animation: "pulse 2s infinite" }} />
              Sample data — live feed connects once the PostgreSQL API is wired up
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 12px" }}>
              <Search size={14} color={C.textFaint} />
              <span style={{ fontFamily: fontBody, fontSize: 12.5, color: C.textFaint }}>Search product…</span>
            </div>
            <button style={{ background: "transparent", border: "none", color: C.textDim, cursor: "pointer", position: "relative" }}>
              <Bell size={18} />
              <span style={{ position: "absolute", top: -2, right: -2, width: 7, height: 7, borderRadius: "50%", background: C.red }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: C.blueSoft, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fontDisplay, fontSize: 12.5, color: C.blue, fontWeight: 700 }}>PM</div>
              <ChevronDown size={14} color={C.textFaint} />
            </div>
          </div>
        </header>

        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "24px 26px 60px" }}>
          <div ref={registerRef("command")} style={{ marginBottom: 44 }}><CommandCenter /></div>
          <div ref={registerRef("draw")} style={{ marginBottom: 44 }}><DrawSection /></div>
          <div ref={registerRef("packing")} style={{ marginBottom: 44 }}><PackingSection /></div>
          <div ref={registerRef("wip")} style={{ marginBottom: 44 }}><WipFgSection /></div>
          <div ref={registerRef("rewinding")} style={{ marginBottom: 44 }}><RewindingSection /></div>
          <div ref={registerRef("excel")}><ExcelReportSection /></div>
        </div>
      </main>
    </div>
  );
}
