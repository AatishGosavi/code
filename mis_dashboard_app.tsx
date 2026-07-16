import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart3, 
  Layers, 
  Settings, 
  PlusCircle, 
  Search, 
  Download, 
  ArrowUpDown, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Sparkles, 
  FileSpreadsheet, 
  Database,
  Terminal,
  Columns,
  Sliders,
  HelpCircle,
  Calendar,
  Clock,
  Code,
  LayoutGrid,
  Check,
  ChevronDown,
  ChevronRight,
  Eye,
  Activity,
  Play,
  Info,
  ListFilter,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Edit3,
  X
} from 'lucide-react';

// MOCK POSTGRES DATABASE DICTIONARY (Simulating system catalog "information_schema.columns")
const POSTGRES_TABLE_DICTIONARY = {
  'v_production_plan_vs_actual': [
    { name: 'product', type: 'VARCHAR', sample: 'D-250' },
    { name: 'monthdrawplan', type: 'NUMERIC', sample: 45000 },
    { name: 'preformconsplan', type: 'NUMERIC', sample: 42000 },
    { name: 'on_date_plan', type: 'NUMERIC', sample: 1500 },
    { name: 'on_date_actual', type: 'NUMERIC', sample: 1450 },
    { name: 'on_date_gap', type: 'NUMERIC', sample: -50 },
    { name: 'cum_plan', type: 'NUMERIC', sample: 18000 },
    { name: 'cum_actual', type: 'NUMERIC', sample: 17200 },
    { name: 'cum_gap', type: 'NUMERIC', sample: -800 },
    { name: 'req_total_draw', type: 'NUMERIC', sample: 27800 },
    { name: 'asking_rate_per_day', type: 'NUMERIC', sample: 1011 },
    { name: 'preform_consumed', type: 'NUMERIC', sample: 16500 }
  ],
  'v_department_pt_shift_report': [
    { name: 'operator', type: 'VARCHAR', sample: 'Line-01 (Rajesh)' },
    { name: 'targetpcs', type: 'NUMERIC', sample: 1200 },
    { name: 'actualpcs', type: 'NUMERIC', sample: 1180 },
    { name: 'variance_gap', type: 'NUMERIC', sample: -20 },
    { name: 'hoursworked', type: 'NUMERIC', sample: 7.8 },
    { name: 'reject_count', type: 'NUMERIC', sample: 12 }
  ],
  'v_preform_quality_acceptance': [
    { name: 'batch_no', type: 'VARCHAR', sample: 'B-9021' },
    { name: 'preform_type', type: 'VARCHAR', sample: 'PF-250-Core' },
    { name: 'supplier', type: 'VARCHAR', sample: 'Nippon Glass' },
    { name: 'qty_received', type: 'NUMERIC', sample: 5000 },
    { name: 'qty_accepted', type: 'NUMERIC', sample: 4980 },
    { name: 'deviation_gap', type: 'NUMERIC', sample: -20 }
  ],
  'v_draw_speed_and_tension': [
    { name: 'tower_id', type: 'VARCHAR', sample: 'Tower-A' },
    { name: 'draw_speed_target', type: 'NUMERIC', sample: 1800 },
    { name: 'draw_speed_actual', type: 'NUMERIC', sample: 1795 },
    { name: 'tension_grams', type: 'NUMERIC', sample: 145 },
    { name: 'helium_flow', type: 'NUMERIC', sample: 12.5 }
  ],
  'v_qc_product_rejections': [
    { name: 'reject_id', type: 'VARCHAR', sample: 'QC-ERR-10' },
    { name: 'reason', type: 'VARCHAR', sample: 'High Cladding Eccentricity' },
    { name: 'tested_qty', type: 'NUMERIC', sample: 15000 },
    { name: 'rejected_qty', type: 'NUMERIC', sample: 180 },
    { name: 'recovery_percentage', type: 'NUMERIC', sample: 10 }
  ],
  'v_despatch_shipping_register': [
    { name: 'invoice_no', type: 'VARCHAR', sample: 'INV-2026-501' },
    { name: 'destination', type: 'VARCHAR', sample: 'Mumbai Hub' },
    { name: 'vehicle_id', type: 'VARCHAR', sample: 'MH-04-EY-9912' },
    { name: 'target_tons', type: 'NUMERIC', sample: 40 },
    { name: 'loaded_tons', type: 'NUMERIC', sample: 39.5 }
  ]
};

// INITIAL REGISTERED POSTGRESQL VIEWS & TABLES
const INITIAL_DB_VIEWS = [
  {
    id: 'consolidated-may-2026',
    title: 'v_consolidated_may_2026_sheet',
    displayName: 'May 2026 Sheet (All Tables)',
    category: 'Production Report',
    sourceType: 'view',
    isSystemLocked: true, // Prevents deletion of crucial master sheets
    description: 'Unified master report showing stacked Production, Packing, and WIP forecasts.',
    meta: { date: '2026-07-04', balanceDays: 27.5 },
    isConsolidated: true,
    sqlQuery: `-- Combined View fetching data across three underlying views\nSELECT * FROM v_production_plan_vs_actual;\nSELECT * FROM v_packing_plan_vs_actual;\nSELECT * FROM v_wip_balance_and_prediction;`,
    tables: [
      {
        title: 'OF - Production Plan Vs Actual',
        headers: [
          { label: 'Product Details', colspan: 3, columns: ['product', 'monthDrawPlan', 'preformConsPlan'] },
          { label: 'Ondate Draw', colspan: 3, columns: ['onDatePlan', 'onDateActual', 'onDateGap'] },
          { label: 'Cumulative Draw', colspan: 3, columns: ['cumPlan', 'cumActual', 'cumGap'] },
          { label: 'Balance Day Draw Requirements', colspan: 2, columns: ['reqTotalDraw', 'askingRatePerDay'] },
          { label: 'Preform Progress', colspan: 1, columns: ['preformConsumedTillDate'] }
        ],
        columns: [
          { key: 'product', label: 'Product Name', type: 'string' },
          { key: 'monthDrawPlan', label: 'Month Plan (FKM)', type: 'number' },
          { key: 'preformConsPlan', label: 'Preform Plan (FKM)', type: 'number' },
          { key: 'onDatePlan', label: 'Plan', type: 'number' },
          { key: 'onDateActual', label: 'Actual', type: 'number' },
          { key: 'onDateGap', label: 'Gap', type: 'number', highlightGap: true },
          { key: 'cumPlan', label: 'Plan', type: 'number' },
          { key: 'cumActual', label: 'Actual', type: 'number' },
          { key: 'cumGap', label: 'Gap', type: 'number', highlightGap: true },
          { key: 'reqTotalDraw', label: 'Required Draw', type: 'number' },
          { key: 'askingRatePerDay', label: 'Asking Rate / Day', type: 'number' },
          { key: 'preformConsumedTillDate', label: 'Consumed Till Date', type: 'number' }
        ],
        data: [
          { product: 'D-250', monthDrawPlan: 45000, preformConsPlan: 42000, onDatePlan: 1500, onDateActual: 1450, onDateGap: -50, cumPlan: 18000, cumActual: 17200, cumGap: -800, reqTotalDraw: 27800, askingRatePerDay: 1011, preformConsumedTillDate: 16500 },
          { product: 'A1-250', monthDrawPlan: 38000, preformConsPlan: 36000, onDatePlan: 1200, onDateActual: 1250, onDateGap: 50, cumPlan: 14000, cumActual: 14200, cumGap: 200, reqTotalDraw: 23800, askingRatePerDay: 865, preformConsumedTillDate: 13800 },
          { product: 'A2-250', monthDrawPlan: 50000, preformConsPlan: 48000, onDatePlan: 1800, onDateActual: 1750, onDateGap: -50, cumPlan: 21000, cumActual: 20500, cumGap: -500, reqTotalDraw: 29500, askingRatePerDay: 1072, preformConsumedTillDate: 19800 },
          { product: 'A2-200', monthDrawPlan: 32000, preformConsPlan: 28000, onDatePlan: 1000, onDateActual: 980, onDateGap: -20, cumPlan: 12000, cumActual: 11800, cumGap: -200, reqTotalDraw: 20200, askingRatePerDay: 735, preformConsumedTillDate: 11200 },
          { product: 'A1-200', monthDrawPlan: 28000, preformConsPlan: 26000, onDatePlan: 900, onDateActual: 950, onDateGap: 50, cumPlan: 11000, cumActual: 11300, cumGap: 300, reqTotalDraw: 16700, askingRatePerDay: 607, preformConsumedTillDate: 10800 },
          { product: 'Total', isTotalRow: true, monthDrawPlan: 193000, preformConsPlan: 180000, onDatePlan: 6400, onDateActual: 6380, onDateGap: -20, cumPlan: 76000, cumActual: 75000, cumGap: -1000, reqTotalDraw: 118000, askingRatePerDay: 4290, preformConsumedTillDate: 72100 }
        ]
      },
      {
        title: 'OF - Packing Plan Vs Actual',
        headers: [
          { label: 'Product Details', colspan: 2, columns: ['product', 'monthPackPlan'] },
          { label: 'Ondate Packing Progress', colspan: 3, columns: ['onDatePlan', 'onDateActual', 'onDateGap'] },
          { label: 'Cumulative Packing Progress', colspan: 3, columns: ['cumPlan', 'cumActual', 'cumGap'] },
          { label: 'Future Requirements', colspan: 2, columns: ['reqTotalPack', 'askingRatePerDay'] }
        ],
        columns: [
          { key: 'product', label: 'Product Name', type: 'string' },
          { key: 'monthPackPlan', label: 'Month Pack Plan (FKM)', type: 'number' },
          { key: 'onDatePlan', label: 'Plan', type: 'number' },
          { key: 'onDateActual', label: 'Actual', type: 'number' },
          { key: 'onDateGap', label: 'Gap', type: 'number', highlightGap: true },
          { key: 'cumPlan', label: 'Plan', type: 'number' },
          { key: 'cumActual', label: 'Actual', type: 'number' },
          { key: 'cumGap', label: 'Gap', type: 'number', highlightGap: true },
          { key: 'reqTotalPack', label: 'Required Total Pack', type: 'number' },
          { key: 'askingRatePerDay', label: 'Asking Rate / Day', type: 'number' }
        ],
        data: [
          { product: 'D-250', monthPackPlan: 42000, onDatePlan: 1400, onDateActual: 1390, onDateGap: -10, cumPlan: 16500, cumActual: 16200, cumGap: -300, reqTotalPack: 25800, askingRatePerDay: 938 },
          { product: 'A1-250', monthPackPlan: 35000, onDatePlan: 1100, onDateActual: 1150, onDateGap: 50, cumPlan: 13000, cumActual: 13200, cumGap: 200, reqTotalPack: 21800, askingRatePerDay: 792 },
          { product: 'A2-250', monthPackPlan: 48000, onDatePlan: 1700, onDateActual: 1620, onDateGap: -80, cumPlan: 20000, cumActual: 19100, cumGap: -900, reqTotalPack: 28900, askingRatePerDay: 1050 },
          { product: 'A2-200', monthPackPlan: 29000, onDatePlan: 950, onDateActual: 950, onDateGap: 0, cumPlan: 11500, cumActual: 11500, cumGap: 0, reqTotalPack: 17500, askingRatePerDay: 636 },
          { product: 'A1-200', monthPackPlan: 25000, onDatePlan: 850, onDateActual: 900, onDateGap: 50, cumPlan: 10000, cumActual: 10300, cumGap: 300, reqTotalPack: 14700, askingRatePerDay: 535 },
          { product: 'Total', isTotalRow: true, monthPackPlan: 179000, onDatePlan: 6000, onDateActual: 6010, onDateGap: 10, cumPlan: 71000, cumActual: 70300, cumGap: -700, reqTotalPack: 108700, askingRatePerDay: 3951 }
        ]
      },
      {
        title: 'Product Balance & Packing Prediction',
        headers: [
          { label: 'Product Details', colspan: 1, columns: ['product'] },
          { label: 'Balance Quantities', colspan: 2, columns: ['balanceDayDraw', 'addedInPack'] },
          { label: 'WIP Assessment', colspan: 2, columns: ['wip', 'addedInPackFromWip'] },
          { label: 'Forecast Projections', colspan: 2, columns: ['totalBalanceDayPack', 'packingPrediction'] }
        ],
        columns: [
          { key: 'product', label: 'Product Name', type: 'string' },
          { key: 'balanceDayDraw', label: 'Balance Day Draw', type: 'number' },
          { key: 'addedInPack', label: 'Added In Pack', type: 'number' },
          { key: 'wip', label: 'Current WIP', type: 'number' },
          { key: 'addedInPackFromWip', label: 'Added from WIP', type: 'number' },
          { key: 'totalBalanceDayPack', label: 'Total Bal. Day Pack', type: 'number' },
          { key: 'packingPrediction', label: 'Packing Prediction', type: 'number', isGoal: true }
        ],
        data: [
          { product: 'D-250', balanceDayDraw: 12500, addedInPack: 11000, wip: 40000, addedInPackFromWip: 36000, totalBalanceDayPack: 47000, packingPrediction: 48500 },
          { product: 'A1-250', balanceDayDraw: 9800, addedInPack: 8900, wip: 15000, addedInPackFromWip: 14000, totalBalanceDayPack: 22900, packingPrediction: 23100 },
          { product: 'A2-250', balanceDayDraw: 14200, addedInPack: 13000, wip: 0, addedInPackFromWip: 0, totalBalanceDayPack: 13000, packingPrediction: 13500 },
          { product: 'A2-200', balanceDayDraw: 8500, addedInPack: 8000, wip: 8000, addedInPackFromWip: 7500, totalBalanceDayPack: 15500, packingPrediction: 16000 },
          { product: 'A1-200', balanceDayDraw: 7100, addedInPack: 6800, wip: 12000, addedInPackFromWip: 11000, totalBalanceDayPack: 17800, packingPrediction: 18200 },
          { product: 'Total', isTotalRow: true, balanceDayDraw: 52100, addedInPack: 47700, wip: 75000, addedInPackFromWip: 68500, totalBalanceDayPack: 116200, packingPrediction: 119300 }
        ]
      }
    ],
    kpis: [
      { id: 'k-1', label: 'Total Drawing Target', actualKey: 'cumActual', targetKey: 'monthDrawPlan', unit: 'FKM' },
      { id: 'k-2', label: 'Total Packing Target', actualKey: 'cumActual', targetKey: 'monthPackPlan', unit: 'FKM' },
      { id: 'k-3', label: 'Preform Consumption Target', actualKey: 'preformConsumedTillDate', targetKey: 'preformConsPlan', unit: 'FKM' },
      { id: 'k-4', label: 'On-Date Pack Target', actualKey: 'onDateActual', targetKey: 'onDatePlan', unit: 'FKM' }
    ]
  },
  {
    id: 'prod-plan-individual',
    title: 'v_production_plan_vs_actual',
    displayName: 'Production Plan vs Actual Only',
    category: 'Production Report',
    sourceType: 'view',
    description: 'Postgres view joining daily drawing schedule with physical machine output telemetry.',
    meta: { date: '2026-07-04', balanceDays: 27.5 },
    sqlQuery: `SELECT \n  product, \n  monthdrawplan, \n  preformconsplan, \n  on_date_plan, \n  on_date_actual \nFROM v_production_plan_vs_actual;`,
    headers: [
      { label: 'Product Details', colspan: 3, columns: ['product', 'monthdrawplan', 'preformconsplan'] },
      { label: 'Ondate Progress', colspan: 2, columns: ['on_date_plan', 'on_date_actual'] }
    ],
    columns: [
      { key: 'product', label: 'Product Name', type: 'string' },
      { key: 'monthdrawplan', label: 'Month Plan (FKM)', type: 'number' },
      { key: 'preformconsplan', label: 'Preform Plan (FKM)', type: 'number' },
      { key: 'on_date_plan', label: 'Plan', type: 'number' },
      { key: 'on_date_actual', label: 'Actual', type: 'number' }
    ],
    kpis: [
      { id: 'kpi-1', label: 'Drawing Plan Fulfillment', actualKey: 'on_date_actual', targetKey: 'on_date_plan', unit: 'FKM' }
    ],
    data: [
      { product: 'D-250', monthdrawplan: 45000, preformconsplan: 42000, on_date_plan: 1500, on_date_actual: 1450 },
      { product: 'A1-250', monthdrawplan: 38000, preformconsplan: 36000, on_date_plan: 1200, on_date_actual: 1250 },
      { product: 'Total', isTotalRow: true, monthdrawplan: 83000, preformconsplan: 78000, on_date_plan: 2700, on_date_actual: 2700 }
    ]
  },
  {
    id: 'preform-logs-sim',
    title: 'v_preform_quality_acceptance',
    displayName: 'Quality Acceptance Logs',
    category: 'Preform Acceptance',
    sourceType: 'view',
    description: 'Tracks dimensional and density acceptance values of incoming preform material.',
    meta: { date: '2026-07-15', balanceDays: 30.0 },
    sqlQuery: `SELECT batch_no, preform_type, supplier, qty_received, qty_accepted, deviation_gap FROM v_preform_quality_acceptance;`,
    headers: [
      { label: 'Batch Info', colspan: 3, columns: ['batch_no', 'preform_type', 'supplier'] },
      { label: 'Inspection Audit', colspan: 3, columns: ['qty_received', 'qty_accepted', 'deviation_gap'] }
    ],
    columns: [
      { key: 'batch_no', label: 'Batch ID', type: 'string' },
      { key: 'preform_type', label: 'Preform Type', type: 'string' },
      { key: 'supplier', label: 'Supplier Corp', type: 'string' },
      { key: 'qty_received', label: 'Received (Kg)', type: 'number' },
      { key: 'qty_accepted', label: 'Accepted (Kg)', type: 'number' },
      { key: 'deviation_gap', label: 'Deviation Gap', type: 'number', highlightGap: true }
    ],
    kpis: [
      { id: 'p-1', label: 'Incoming Material Acceptance', actualKey: 'qty_accepted', targetKey: 'qty_received', unit: 'Kg' }
    ],
    data: [
      { batch_no: 'B-9021', preform_type: 'PF-250-Core', supplier: 'Nippon Glass', qty_received: 5000, qty_accepted: 4980, deviation_gap: -20 },
      { batch_no: 'B-9022', preform_type: 'PF-200-Clad', supplier: 'Schott AG', qty_received: 4200, qty_accepted: 4200, deviation_gap: 0 },
      { batch_no: 'Total', isTotalRow: true, qty_received: 9200, qty_accepted: 9180, deviation_gap: -20 }
    ]
  },
  {
    id: 'drawing-speed-sim',
    title: 'v_draw_speed_and_tension',
    displayName: 'Line Speeds & Tension',
    category: 'Draw',
    sourceType: 'view',
    description: 'Monitors real-time draw speeds and gas flows inside the tower drawing process.',
    meta: { date: '2026-07-15', balanceDays: 20.0 },
    sqlQuery: `SELECT tower_id, draw_speed_target, draw_speed_actual, tension_grams, helium_flow FROM v_draw_speed_and_tension;`,
    headers: [
      { label: 'Tower', colspan: 1, columns: ['tower_id'] },
      { label: 'Drawing Velocity Parameters', colspan: 3, columns: ['draw_speed_target', 'draw_speed_actual', 'tension_grams'] },
      { label: 'Gases', colspan: 1, columns: ['helium_flow'] }
    ],
    columns: [
      { key: 'tower_id', label: 'Tower ID', type: 'string' },
      { key: 'draw_speed_target', label: 'Target Speed (m/m)', type: 'number' },
      { key: 'draw_speed_actual', label: 'Actual Speed (m/m)', type: 'number' },
      { key: 'tension_grams', label: 'Tension (Grams)', type: 'number' },
      { key: 'helium_flow', label: 'Helium Flow (SLPM)', type: 'number' }
    ],
    kpis: [
      { id: 'd-1', label: 'Average Drawing Speed', actualKey: 'draw_speed_actual', targetKey: 'draw_speed_target', unit: 'm/m' }
    ],
    data: [
      { tower_id: 'Tower-A', draw_speed_target: 1800, draw_speed_actual: 1795, tension_grams: 145, helium_flow: 12.5 },
      { tower_id: 'Tower-B', draw_speed_target: 2000, draw_speed_actual: 2010, tension_grams: 150, helium_flow: 14.0 },
      { tower_id: 'Total/Average', isTotalRow: true, draw_speed_target: 3800, draw_speed_actual: 3805, tension_grams: 147, helium_flow: 26.5 }
    ]
  },
  {
    id: 'pt-shift-report',
    title: 'v_department_pt_shift_report',
    displayName: 'Production',
    category: 'PT',
    sourceType: 'view',
    description: 'Real-time department-level view tracking operator logs and product shift metrics.',
    meta: { date: '2026-07-14', balanceDays: 20.0 },
    sqlQuery: `SELECT operator, targetpcs, actualpcs, variance_gap FROM v_department_pt_shift_report;`,
    headers: [
      { label: 'Operator Details', colspan: 1, columns: ['operator'] },
      { label: 'Volume Shift Logs', colspan: 3, columns: ['targetpcs', 'actualpcs', 'variance_gap'] }
    ],
    columns: [
      { key: 'operator', label: 'Shift Line Name', type: 'string' },
      { key: 'targetpcs', label: 'Shift Target (Pcs)', type: 'number' },
      { key: 'actualpcs', label: 'Actual Produced (Pcs)', type: 'number' },
      { key: 'variance_gap', label: 'Variance Gap', type: 'number', highlightGap: true }
    ],
    kpis: [
      { id: 'kpi-1', label: 'PT Operational Output', actualKey: 'actualpcs', targetKey: 'targetpcs', unit: 'Pcs' }
    ],
    data: [
      { operator: 'PT Line-01 (Rajesh)', targetpcs: 1200, actualpcs: 1180, variance_gap: -20 },
      { operator: 'PT Line-02 (Amit)', targetpcs: 1500, actualpcs: 1550, variance_gap: 50 },
      { operator: 'Total', isTotalRow: true, targetpcs: 2700, actualpcs: 2730, variance_gap: 30 }
    ]
  },
  {
    id: 'pt-breaks-sim',
    title: 'v_pt_shift_breaks_and_downtime',
    displayName: 'Breaks',
    category: 'PT',
    sourceType: 'view',
    description: 'Details mechanical breaks, rest intervals, and planned maintenance downtimes per line.',
    meta: { date: '2026-07-14', balanceDays: 20.0 },
    sqlQuery: `SELECT line_no, break_type, duration_minutes, staff_covered, impact_factor FROM v_pt_shift_breaks_and_downtime;`,
    headers: [
      { label: 'Machine Line', colspan: 1, columns: ['line_no'] },
      { label: 'Downtime Categories & Times', colspan: 3, columns: ['break_type', 'duration_minutes', 'staff_covered'] },
      { label: 'Process Loss', colspan: 1, columns: ['impact_factor'] }
    ],
    columns: [
      { key: 'line_no', label: 'Line No', type: 'string' },
      { key: 'break_type', label: 'Break Classification', type: 'string' },
      { key: 'duration_minutes', label: 'Idle duration (Mins)', type: 'number' },
      { key: 'staff_covered', label: 'Staff Log Count', type: 'number' },
      { key: 'impact_factor', label: 'Yield Impact (%)', type: 'number' }
    ],
    kpis: [
      { id: 'b-1', label: 'Cumulative Break Duration', actualKey: 'duration_minutes', targetKey: null, unit: 'Mins' }
    ],
    data: [
      { line_no: 'PT Line-01', break_type: 'Shift Changeover Interval', duration_minutes: 30, staff_covered: 5, impact_factor: 1.2 },
      { line_no: 'PT Line-02', break_type: 'Nozzle Calibration Break', duration_minutes: 45, staff_covered: 2, impact_factor: 2.5 },
      { line_no: 'Total', isTotalRow: true, duration_minutes: 75, staff_covered: 7, impact_factor: 3.7 }
    ]
  },
  {
    id: 'qc-rejections-sim',
    title: 'v_qc_product_rejections',
    displayName: 'QC Defect Logbook',
    category: 'QC',
    sourceType: 'view',
    description: 'Detailed analysis of surface defects, geometric failures, and laser test fails.',
    meta: { date: '2026-07-15', balanceDays: 27.5 },
    sqlQuery: `SELECT reject_id, reason, tested_qty, rejected_qty, recovery_percentage FROM v_qc_product_rejections;`,
    headers: [
      { label: 'Failure Audit', colspan: 2, columns: ['reject_id', 'reason'] },
      { label: 'Sampling Counts', colspan: 3, columns: ['tested_qty', 'rejected_qty', 'recovery_percentage'] }
    ],
    columns: [
      { key: 'reject_id', label: 'Classification Code', type: 'string' },
      { key: 'reason', label: 'Primary Defect Cause', type: 'string' },
      { key: 'tested_qty', label: 'Tested Batch Size (Km)', type: 'number' },
      { key: 'rejected_qty', label: 'Rejected (Km)', type: 'number' },
      { key: 'recovery_percentage', label: 'Recovery Rate (%)', type: 'number' }
    ],
    kpis: [
      { id: 'q-1', label: 'Consolidated Defect Volume', actualKey: 'rejected_qty', targetKey: 'tested_qty', unit: 'Km' }
    ],
    data: [
      { reject_id: 'QC-ERR-10', reason: 'High Cladding Eccentricity', tested_qty: 15000, rejected_qty: 180, recovery_percentage: 10 },
      { reject_id: 'QC-ERR-12', reason: 'Bubble Inclusions in Core', tested_qty: 20000, rejected_qty: 350, recovery_percentage: 0 },
      { reject_id: 'Total', isTotalRow: true, tested_qty: 35000, rejected_qty: 530, recovery_percentage: 5 }
    ]
  },
  {
    id: 'despatch-planning-sim',
    title: 'v_despatch_shipping_register',
    displayName: 'Despatch Tracking View',
    category: 'Despatch',
    sourceType: 'view',
    description: 'Postgres view planning upcoming logistics, vehicle arrivals, and load dispatches.',
    meta: { date: '2026-07-15', balanceDays: 14.0 },
    sqlQuery: `SELECT invoice_no, destination, vehicle_id, target_tons, loaded_tons FROM v_despatch_shipping_register;`,
    headers: [
      { label: 'Consignment Identification', colspan: 3, columns: ['invoice_no', 'destination', 'vehicle_id'] },
      { label: 'Weight Audits', colspan: 2, columns: ['target_tons', 'loaded_tons'] }
    ],
    columns: [
      { key: 'invoice_no', label: 'Invoice Serial', type: 'string' },
      { key: 'destination', label: 'Consignee City', type: 'string' },
      { key: 'vehicle_id', label: 'Carrier Vehicle No.', type: 'string' },
      { key: 'target_tons', label: 'Target Weight (Tons)', type: 'number' },
      { key: 'loaded_tons', label: 'Net Dispatched (Tons)', type: 'number' }
    ],
    kpis: [
      { id: 'ds-1', label: 'Total Tonnage Shipped', actualKey: 'loaded_tons', targetKey: 'target_tons', unit: 'Tons' }
    ],
    data: [
      { invoice_no: 'INV-2026-501', destination: 'Mumbai Hub', vehicle_id: 'MH-04-EY-9912', target_tons: 40, loaded_tons: 39.5 },
      { invoice_no: 'INV-2026-502', destination: 'Chennai Port', vehicle_id: 'TN-07-AQ-4451', target_tons: 85, loaded_tons: 85.0 },
      { invoice_no: 'Total', isTotalRow: true, target_tons: 125, loaded_tons: 124.5 }
    ]
  }
];

// INITIAL NAV TREE
const INITIAL_NAVIGATION = [
  {
    id: 'production-report',
    label: 'Production Report',
    isOpen: true,
    submenus: [
      { id: 'consolidated-may-2026', label: 'Consolidated May 2026 Sheet (All Tables)', viewId: 'consolidated-may-2026' },
      { id: 'prod-plan-individual', label: 'Production Plan vs Actual Only', viewId: 'prod-plan-individual' }
    ]
  },
  {
    id: 'preform-acceptance',
    label: 'Preform Acceptance',
    isOpen: false,
    submenus: [
      { id: 'preform-logs-sim', label: 'Quality Acceptance Logs', viewId: 'preform-logs-sim' }
    ]
  },
  {
    id: 'draw',
    label: 'Draw',
    isOpen: false,
    submenus: [
      { id: 'drawing-speed-sim', label: 'Line Speeds & Tension', viewId: 'drawing-speed-sim' }
    ]
  },
  {
    id: 'pt',
    label: 'PT',
    isOpen: true,
    submenus: [
      { id: 'pt-production', label: 'Production', viewId: 'pt-shift-report' },
      { id: 'pt-breaks', label: 'Breaks', viewId: 'pt-breaks-sim' }
    ]
  },
  {
    id: 'qc',
    label: 'QC',
    isOpen: false,
    submenus: [
      { id: 'qc-rejections-sim', label: 'QC Defect Logbook', viewId: 'qc-rejections-sim' }
    ]
  },
  {
    id: 'despatch',
    label: 'Despatch',
    isOpen: false,
    submenus: [
      { id: 'despatch-planning-sim', label: 'Despatch Tracking View', viewId: 'despatch-planning-sim' }
    ]
  }
];

export default function App() {
  const [dbViews, setDbViews] = useState(INITIAL_DB_VIEWS);
  const [navigation, setNavigation] = useState(INITIAL_NAVIGATION);
  const [selectedViewId, setSelectedViewId] = useState('consolidated-may-2026');
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState('light');
  const [toastMessage, setToastMessage] = useState(null);
  const [showSQLPanel, setShowSQLPanel] = useState(true);

  // WIZARD CREATOR STATES
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [editingViewId, setEditingViewId] = useState(null); // Keeps track if we are editing a report
  const [creatorStep, setCreatorStep] = useState(1);
  const [viewTitle, setViewTitle] = useState('');
  const [viewCategory, setViewCategory] = useState('PT');
  const [subCategoryType, setSubCategoryType] = useState('new');
  const [targetSubmenuLabel, setTargetSubmenuLabel] = useState('Dynamic Report');
  const [viewDescription, setViewDescription] = useState('');
  const [sourceType, setSourceType] = useState('view'); // 'table' or 'view'

  // INTERACTIVE COLUMN PICKER & SQL BUILDER STATES
  const [selectedSourceTable, setSelectedSourceTable] = useState('v_production_plan_vs_actual');
  const [availableColumns, setAvailableColumns] = useState(POSTGRES_TABLE_DICTIONARY['v_production_plan_vs_actual']);
  const [checkedColumns, setCheckedColumns] = useState({}); // column_name -> boolean
  const [isSelectAllChecked, setIsSelectAllChecked] = useState(true);

  // SQL-FIRST EDITOR CODE
  const [rawSQLInput, setRawSQLInput] = useState(`SELECT * FROM v_production_plan_vs_actual;`);
  const [parsedColumns, setParsedColumns] = useState([]);
  const [detectedTableName, setDetectedTableName] = useState('');
  
  const [creatorDataRows, setCreatorDataRows] = useState([
    { product: 'D-250', monthdrawplan: 45000, preformconsplan: 42000, on_date_plan: 1500, on_date_actual: 1450 },
    { product: 'A1-250', monthdrawplan: 38000, preformconsplan: 36000, on_date_plan: 1200, on_date_actual: 1250 },
    { product: 'Total', isTotalRow: true, monthdrawplan: 83000, preformconsplan: 78000, on_date_plan: 2700, on_date_actual: 2700 }
  ]);

  // MULTIPLE KPI STATES (Allows user to enable/configure up to 4 KPIs)
  const [creatorKPIs, setCreatorKPIs] = useState([
    { enabled: true, label: 'Drawing Performance', actualKey: '', targetKey: '', unit: 'FKM' },
    { enabled: true, label: 'Packing Volume', actualKey: '', targetKey: '', unit: 'FKM' },
    { enabled: false, label: 'Line Yield Efficiency', actualKey: '', targetKey: '', unit: '%' },
    { enabled: false, label: 'Idle Hours Logged', actualKey: '', targetKey: '', unit: 'Hrs' }
  ]);

  // CUSTOM CONFIRMATION MODALS
  const [viewIdToDelete, setViewIdToDelete] = useState(null);

  // Trigger custom toast notification
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const activeView = useMemo(() => {
    return dbViews.find(v => v.id === selectedViewId) || dbViews[0];
  }, [dbViews, selectedViewId]);

  // Expand or collapse sidebar accordion folders
  const toggleMenu = (menuId) => {
    setNavigation(prev => prev.map(m => {
      if (m.id === menuId) {
        return { ...m, isOpen: !m.isOpen };
      }
      return m;
    }));
  };

  // Sync columns checkboxes whenever selectedSourceTable changes (only during non-editing creation)
  useEffect(() => {
    if (editingViewId) return; // Ignore if we are editing an existing view
    const columns = POSTGRES_TABLE_DICTIONARY[selectedSourceTable] || [];
    setAvailableColumns(columns);
    
    // Default: Check all columns
    const initialChecked = {};
    columns.forEach(col => {
      initialChecked[col.name] = true;
    });
    setCheckedColumns(initialChecked);
    setIsSelectAllChecked(true);
    
    // Auto-generate starting SQL statement
    setRawSQLInput(`SELECT * FROM ${selectedSourceTable};`);
  }, [selectedSourceTable, editingViewId]);

  // Handle individual column checkbox click
  const handleColumnToggle = (columnName) => {
    const updatedChecked = {
      ...checkedColumns,
      [columnName]: !checkedColumns[columnName]
    };
    setCheckedColumns(updatedChecked);

    // Evaluate if all columns are selected
    const activeCols = Object.keys(updatedChecked).filter(k => updatedChecked[k]);
    const totalCols = Object.keys(updatedChecked);
    
    if (activeCols.length === totalCols.length) {
      setIsSelectAllChecked(true);
      setRawSQLInput(`SELECT * FROM ${selectedSourceTable};`);
    } else {
      setIsSelectAllChecked(false);
      if (activeCols.length === 0) {
        setRawSQLInput(`SELECT NULL FROM ${selectedSourceTable};`);
      } else {
        setRawSQLInput(`SELECT \n  ${activeCols.join(', \n  ')}\nFROM ${selectedSourceTable};`);
      }
    }
  };

  // Handle "Select All (*)" click
  const handleSelectAllToggle = () => {
    const nextState = !isSelectAllChecked;
    setIsSelectAllChecked(nextState);

    const updatedChecked = {};
    availableColumns.forEach(col => {
      updatedChecked[col.name] = nextState;
    });
    setCheckedColumns(updatedChecked);

    if (nextState) {
      setRawSQLInput(`SELECT * FROM ${selectedSourceTable};`);
    } else {
      setRawSQLInput(`SELECT NULL FROM ${selectedSourceTable};`);
    }
  };

  // Compiler: Parses active select query projection, maps styles, columns & types
  const handleParseSQLQuery = () => {
    try {
      const cleanSql = rawSQLInput.replace(/\s+/g, ' ').trim();
      const selectRegex = /SELECT\s+(.+?)\s+FROM\s+([a-zA-Z0-9_\.]+)/i;
      const match = cleanSql.match(selectRegex);
      
      if (!match) {
        triggerToast("Failed to parse SQL. Please verify SELECT and FROM keywords.");
        return;
      }
      
      const colSection = match[1].trim();
      const tableName = match[2].trim();
      setDetectedTableName(tableName);

      let finalCols = [];

      if (colSection === '*') {
        // If * selected, import all columns from target database table dictionary
        const dbColumns = POSTGRES_TABLE_DICTIONARY[tableName] || [];
        if (dbColumns.length === 0) {
          triggerToast(`Warning: Metadata for '${tableName}' not found in DB catalog. Synthesizing generic fields.`);
          finalCols = [
            { key: 'id', label: 'ID', type: 'string' },
            { key: 'target', label: 'Target', type: 'number' },
            { key: 'actual', label: 'Actual', type: 'number' },
            { key: 'variance', label: 'Variance', type: 'number', highlightGap: true }
          ];
        } else {
          finalCols = dbColumns.map((col, index) => ({
            key: col.name,
            label: col.name.charAt(0).toUpperCase() + col.name.slice(1).replace(/_/g, ' '),
            type: col.type === 'NUMERIC' ? 'number' : 'string',
            highlightGap: col.name.includes('gap') || col.name.includes('variance') || col.name.includes('deviation')
          }));
        }
      } else {
        // Parse explicit column projection
        const rawCols = colSection.split(',');
        finalCols = rawCols.map((colStr, index) => {
          colStr = colStr.trim();
          
          // AS alias support
          const asRegex = /(.+?)\s+AS\s+([a-zA-Z0-9_"]+)/i;
          const aliasMatch = colStr.match(asRegex);
          
          let key = '';
          let label = '';
          
          if (aliasMatch) {
            key = aliasMatch[2].replace(/"/g, '').trim();
            label = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
          } else {
            const dotParts = colStr.split('.');
            key = dotParts[dotParts.length - 1].trim();
            label = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
          }
          
          const cleanKey = key.toLowerCase();
          
          // Check DB dictionary for actual underlying types
          const originalCol = availableColumns.find(c => c.name === cleanKey);
          const isNumeric = originalCol ? originalCol.type === 'NUMERIC' : (cleanKey.includes('qty') || cleanKey.includes('plan') || cleanKey.includes('actual') || cleanKey.includes('target') || cleanKey.includes('gap') || cleanKey.includes('speed') || cleanKey.includes('tons') || cleanKey.includes('minutes') || cleanKey.includes('hour'));

          return {
            key: cleanKey,
            label: label,
            type: isNumeric ? 'number' : 'string',
            highlightGap: cleanKey.includes('gap') || cleanKey.includes('variance') || cleanKey.includes('deviation')
          };
        });
      }

      setParsedColumns(finalCols);
      
      // Auto-bind default KPI slots with numeric columns parsed
      const numCols = finalCols.filter(c => c.type === 'number');
      const updatedKPIs = [...creatorKPIs];
      
      if (numCols.length > 0) {
        updatedKPIs[0].actualKey = numCols[0].key;
        updatedKPIs[0].targetKey = numCols[1]?.key || '';
        if (numCols.length > 2) {
          updatedKPIs[1].enabled = true;
          updatedKPIs[1].actualKey = numCols[2].key;
          updatedKPIs[1].targetKey = numCols[3]?.key || '';
        }
      }
      setCreatorKPIs(updatedKPIs);

      // Populate preview rows with real metadata samples
      const dbColumns = POSTGRES_TABLE_DICTIONARY[tableName] || [];
      const row1 = {};
      const row2 = {};
      const rowTotal = { isTotalRow: true };

      finalCols.forEach(col => {
        const dbMeta = dbColumns.find(c => c.name === col.key);
        const sampleVal = dbMeta ? dbMeta.sample : (col.type === 'number' ? 1000 : 'Sample Data');
        
        if (col.type === 'number') {
          row1[col.key] = sampleVal;
          row2[col.key] = Math.round(sampleVal * 1.1);
          rowTotal[col.key] = Math.round(sampleVal * 2.1);
        } else {
          row1[col.key] = sampleVal + ' Alpha';
          row2[col.key] = sampleVal + ' Beta';
          rowTotal[col.key] = 'Total Sum';
        }
      });

      setCreatorDataRows([row1, row2, rowTotal]);
      
      triggerToast("SQL Schema Extracted Successfully!");
      setCreatorStep(2);
    } catch (err) {
      triggerToast(`SQL Compiler Error: ${err.message}`);
    }
  };

  // Update a specific KPI card configuration slot
  const handleUpdateCreatorKPI = (index, field, value) => {
    setCreatorKPIs(prev => prev.map((kpi, kIdx) => {
      if (kIdx === index) {
        return { ...kpi, [field]: value };
      }
      return kpi;
    }));
  };

  // Compile view, save (either edit/save or fresh add), and dynamically map to navigation
  const handleSaveDynamicSQLView = () => {
    const realViewTitle = detectedTableName || `v_user_${viewTitle.toLowerCase().replace(/\s+/g, '_')}`;

    // Filter enabled KPIs
    const activeKPIConfig = creatorKPIs
      .filter(kpi => kpi.enabled && kpi.label && kpi.actualKey)
      .map((kpi, index) => ({
        id: `k-${editingViewId || 'new'}-${index}`,
        label: kpi.label,
        actualKey: kpi.actualKey,
        targetKey: kpi.targetKey || null,
        unit: kpi.unit || 'Units'
      }));

    if (activeKPIConfig.length === 0) {
      triggerToast("Warning: Please map and enable at least one KPI actual column.");
      return;
    }

    if (editingViewId) {
      // MODE: MODIFY VIEW (UPDATE SCHEMA IN-PLACE)
      setDbViews(prev => prev.map(view => {
        if (view.id === editingViewId) {
          return {
            ...view,
            title: realViewTitle,
            displayName: viewTitle,
            category: viewCategory,
            description: viewDescription || 'Modified schema layout configuration.',
            sqlQuery: rawSQLInput,
            headers: [{ label: 'Query Result Metrics', colspan: parsedColumns.length, columns: parsedColumns.map(c => c.key) }],
            columns: parsedColumns,
            kpis: activeKPIConfig,
            data: creatorDataRows
          };
        }
        return view;
      }));

      // Update Submenu Titles in Navigation Tree to match modified title
      setNavigation(prevNav => prevNav.map(menu => {
        const submenus = menu.submenus.map(sub => {
          if (sub.viewId === editingViewId) {
            return { ...sub, label: targetSubmenuLabel || viewTitle };
          }
          return sub;
        });
        return { ...menu, submenus };
      }));

      triggerToast(`Schema for '${realViewTitle}' successfully modified!`);
      setSelectedViewId(editingViewId);
    } else {
      // MODE: ADD FRESH NEW VIEW
      const generatedId = `sql-view-${Date.now()}`;
      const newView = {
        id: generatedId,
        title: realViewTitle,
        displayName: viewTitle || `Query (${selectedSourceTable})`,
        category: viewCategory,
        sourceType: sourceType,
        description: viewDescription || `Dynamic selection query from PostgreSQL ${selectedSourceTable} built interactively.`,
        meta: { date: new Date().toISOString().split('T')[0], balanceDays: 20.0 },
        sqlQuery: rawSQLInput,
        headers: [
          { label: 'Query Result Metrics', colspan: parsedColumns.length, columns: parsedColumns.map(c => c.key) }
        ],
        columns: parsedColumns,
        kpis: activeKPIConfig,
        data: creatorDataRows
      };

      setDbViews(prev => [...prev, newView]);

      // Insert into left navigation tree dynamically
      setNavigation(prevNav => {
        return prevNav.map(menu => {
          const isMatchedCategory = menu.id === viewCategory.toLowerCase().replace(/\s+/g, '-');
          if (isMatchedCategory) {
            const submenus = [...menu.submenus];
            const existSubIdx = submenus.findIndex(sm => sm.label.toLowerCase() === targetSubmenuLabel.toLowerCase());
            
            if (subCategoryType === 'existing' && existSubIdx !== -1) {
              submenus[existSubIdx] = { ...submenus[existSubIdx], viewId: generatedId };
            } else {
              submenus.push({
                id: `sm-${Date.now()}`,
                label: targetSubmenuLabel || viewTitle,
                viewId: generatedId
              });
            }
            return { ...menu, isOpen: true, submenus };
          }
          return menu;
        });
      });

      setSelectedViewId(generatedId);
      triggerToast(`Dynamic report with ${activeKPIConfig.length} KPI Card(s) successfully mounted!`);
    }

    // Reset wizard states
    setIsCreatorOpen(false);
    setEditingViewId(null);
    setCreatorStep(1);
    setViewTitle('');
  };

  // Launch Modify Mode for a view
  const handleModifyView = (view) => {
    setEditingViewId(view.id);
    setViewTitle(view.displayName);
    setViewCategory(view.category);
    setViewDescription(view.description || '');
    setRawSQLInput(view.sqlQuery);
    setParsedColumns(view.columns);
    setCreatorDataRows(view.data);
    
    // Auto-detect and populate checkboxes
    const originTable = Object.keys(POSTGRES_TABLE_DICTIONARY).find(t => view.sqlQuery.includes(t)) || 'v_production_plan_vs_actual';
    setSelectedSourceTable(originTable);

    const cols = POSTGRES_TABLE_DICTIONARY[originTable] || [];
    setAvailableColumns(cols);

    const activeChecked = {};
    cols.forEach(col => {
      activeChecked[col.name] = view.columns.some(c => c.key === col.name);
    });
    setCheckedColumns(activeChecked);
    setIsSelectAllChecked(!view.sqlQuery.includes('SELECT \n'));

    // Populate Multiple KPIs
    const mappedKPIs = [
      { enabled: false, label: 'KPI Card 1', actualKey: '', targetKey: '', unit: 'FKM' },
      { enabled: false, label: 'KPI Card 2', actualKey: '', targetKey: '', unit: 'FKM' },
      { enabled: false, label: 'KPI Card 3', actualKey: '', targetKey: '', unit: '%' },
      { enabled: false, label: 'KPI Card 4', actualKey: '', targetKey: '', unit: 'Hrs' }
    ];
    view.kpis.forEach((savedKpi, idx) => {
      if (idx < 4) {
        mappedKPIs[idx] = {
          enabled: true,
          label: savedKpi.label,
          actualKey: savedKpi.actualKey,
          targetKey: savedKpi.targetKey || '',
          unit: savedKpi.unit
        };
      }
    });
    setCreatorKPIs(mappedKPIs);

    // Find the target sub-menu label from the nav tree
    let matchedLabel = view.displayName;
    navigation.forEach(m => {
      const matchSub = m.submenus.find(s => s.viewId === view.id);
      if (matchSub) matchedLabel = matchSub.label;
    });
    setTargetSubmenuLabel(matchedLabel);
    setSubCategoryType('existing');

    setCreatorStep(1);
    setIsCreatorOpen(true);
    triggerToast(`Modifying Schema for View: ${view.title}`);
  };

  // Perform view erasure (Erase SQL view from system memory)
  const handleExecuteDeleteView = (targetId) => {
    // Re-route user back to Consolidated May sheet if deleting currently viewed report
    if (selectedViewId === targetId) {
      setSelectedViewId('consolidated-may-2026');
    }

    // Delete from dbViews array
    setDbViews(prev => prev.filter(v => v.id !== targetId));

    // Remove from navigation tree mapping
    setNavigation(prevNav => prevNav.map(menu => {
      return {
        ...menu,
        submenus: menu.submenus.filter(sub => sub.viewId !== targetId)
      };
    }));

    setViewIdToDelete(null);
    triggerToast(`Database View & menu link completely removed.`);
  };

  // Indian localization KPI engine
  const dynamicKPIs = useMemo(() => {
    if (!activeView) return [];

    if (activeView.isConsolidated) {
      return [
        { label: 'Total Drawing Target', actual: 75000, target: 193000, unit: 'FKM', efficiency: '38.9' },
        { label: 'Total Packing Target', actual: 70300, target: 179000, unit: 'FKM', efficiency: '39.3' },
        { label: 'Preform Consumption Target', actual: 72100, target: 180000, unit: 'FKM', efficiency: '40.1' },
        { label: 'On-Date Pack Target', actual: 6010, target: 6000, unit: 'FKM', efficiency: '100.2' }
      ];
    }

    const totalRow = activeView.data?.find(row => row.isTotalRow) || activeView.data?.[activeView.data?.length - 1];

    return activeView.kpis.map(kpi => {
      const actualVal = totalRow ? totalRow[kpi.actualKey] : 0;
      const targetVal = kpi.targetKey && totalRow ? totalRow[kpi.targetKey] : null;
      
      let efficiency = null;
      if (typeof actualVal === 'number' && typeof targetVal === 'number' && targetVal > 0) {
        efficiency = ((actualVal / targetVal) * 100).toFixed(1);
      }

      return {
        label: kpi.label,
        actual: actualVal,
        target: targetVal,
        unit: kpi.unit || 'Units',
        efficiency
      };
    });
  }, [activeView]);

  return (
    <div className={`min-h-screen font-sans transition-colors duration-150 ${theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* TOAST PANEL */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700/50 text-sm font-bold animate-bounce">
          <Database className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* CONFIRMATION DELETE MODAL */}
      {viewIdToDelete && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`p-6 rounded-2xl border max-w-md w-full shadow-2xl animate-in scale-in duration-150 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center gap-3 mb-4 text-rose-500">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Confirm PostgreSQL Drop View</h3>
            </div>
            
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Are you sure you want to drop the database view and unmount this sub-menu? This will run an administrative <code className="text-rose-400 font-mono text-xs">DROP VIEW</code> and remove it permanently from the sidebar navigation.
            </p>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setViewIdToDelete(null)}
                className={`px-4 py-2 rounded-lg text-xs font-bold border transition-colors ${theme === 'dark' ? 'border-slate-850 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'}`}
              >
                Cancel
              </button>
              <button 
                onClick={() => handleExecuteDeleteView(viewIdToDelete)}
                className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Drop & Remove Link</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <header className={`border-b px-6 py-4 flex flex-wrap justify-between items-center gap-4 ${theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white shadow-sm'}`}>
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 text-white p-2.5 rounded-lg shadow-md shadow-emerald-500/20">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">PostgreSQL Enterprise MIS Hub</h1>
            <p className="text-xs text-slate-500 font-medium">Link SQL queries directly to navigational sub-menus</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${theme === 'dark' ? 'border-slate-800 hover:bg-slate-800 text-amber-400' : 'border-slate-200 hover:bg-slate-100 text-slate-600'}`}
          >
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
          
          <button 
            onClick={() => {
              setEditingViewId(null);
              setIsCreatorOpen(!isCreatorOpen);
              setCreatorStep(1);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold inline-flex items-center gap-2 shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Map New Postgres View</span>
          </button>
        </div>
      </header>

      {/* GRID STRUCTURE */}
      <div className="grid grid-cols-1 lg:grid-cols-4 min-h-[calc(100vh-80px)]">
        
        {/* SIDEBAR NAVIGATION dropdowns */}
        <aside className={`lg:col-span-1 border-r p-6 flex flex-col justify-between ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50/50'}`}>
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-4">
                🏢 Industrial Departments
              </span>
              
              <div className="space-y-3">
                {navigation.map((menu) => (
                  <div key={menu.id} className="border-b border-slate-100 dark:border-slate-850 pb-2.5">
                    
                    <button
                      onClick={() => toggleMenu(menu.id)}
                      className="w-full flex items-center justify-between py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-500 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <LayoutGrid className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{menu.label}</span>
                      </span>
                      {menu.isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    </button>

                    {menu.isOpen && (
                      <div className="mt-2 pl-4 space-y-1.5 border-l-2 border-emerald-500/10 ml-2">
                        {menu.submenus.map((sub) => {
                          const isSelected = selectedViewId === sub.viewId;
                          const mappedView = dbViews.find(v => v.id === sub.viewId);
                          const isLocked = mappedView?.isSystemLocked;

                          return (
                            <div 
                              key={sub.id} 
                              className={`group flex items-center justify-between w-full py-1.5 px-3 rounded-md transition-all ${
                                isSelected ? 'bg-emerald-600/10 text-emerald-500 dark:text-emerald-400 border-l-2 border-emerald-500 pl-2' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-900/50'
                              }`}
                            >
                              <button
                                onClick={() => setSelectedViewId(sub.viewId)}
                                className="text-left text-xs font-semibold block truncate w-full"
                              >
                                {sub.label}
                              </button>

                              {/* ADMIN MODIFY & DROP VIEW ACTIONS */}
                              {!isLocked && mappedView && (
                                <div className="hidden group-hover:flex items-center gap-1.5 shrink-0 ml-1">
                                  <button 
                                    onClick={() => handleModifyView(mappedView)}
                                    title="Modify Schema Configuration"
                                    className="text-slate-400 hover:text-blue-500 transition-colors"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => setViewIdToDelete(sub.viewId)}
                                    title="Drop View from Navigation"
                                    className="text-slate-400 hover:text-rose-500 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className={`p-4 rounded-xl border leading-relaxed text-xs ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center gap-1.5 mb-2 font-bold text-emerald-500">
                <Info className="w-4 h-4" />
                <span>ADMIN CONTROLS ACTIVE</span>
              </div>
              Sidebar sub-menus feature hover options allowing admins to instantly modify query column bindings or drop views altogether.
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            <p className="font-semibold text-slate-400">Database Connection: active</p>
            <p className="mt-1">Active SQL Host: localhost:5432</p>
          </div>
        </aside>

        {/* WORKSPACE PANELS */}
        <main className="lg:col-span-3 p-6 space-y-6">

          {/* DYNAMIC VIEW/TABLE WIZARD CREATOR */}
          {isCreatorOpen && (
            <div className={`p-6 rounded-2xl border mb-6 transition-all shadow-xl animate-in fade-in slide-in-from-top-4 duration-300 ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex justify-between items-center mb-4 pb-3 border-b dark:border-slate-800 border-slate-100">
                <div className="flex items-center gap-2">
                  <Database className="text-emerald-500 w-5 h-5" />
                  <h3 className="font-bold text-lg">
                    {editingViewId ? `Modify View: ${viewTitle}` : 'Postgres Table & SQL Query Mapper'}
                  </h3>
                </div>
                <button onClick={() => { setIsCreatorOpen(false); setEditingViewId(null); }} className="text-slate-400 hover:text-slate-600 text-sm font-semibold">
                  Cancel ×
                </button>
              </div>

              {/* STEP 1: INTERACTIVE VIEW SELECTION & CHECKBOX PILE */}
              {creatorStep === 1 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase mb-1.5 text-slate-400">Report/Display Title</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Line Operator Performance" 
                        value={viewTitle}
                        onChange={(e) => setViewTitle(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-emerald-500 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'}`}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1.5 text-slate-400">SQL Target Type</label>
                      <select
                        value={sourceType}
                        onChange={(e) => setSourceType(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-emerald-500 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'}`}
                      >
                        <option value="view">VIEW</option>
                        <option value="table">TABLE</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase mb-1.5 text-slate-400">Parent Department Menu</label>
                      <select
                        value={viewCategory}
                        onChange={(e) => setViewCategory(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-emerald-500 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'}`}
                      >
                        <option value="Production Report">Production Report</option>
                        <option value="Preform Acceptance">Preform Acceptance</option>
                        <option value="Draw">Draw</option>
                        <option value="PT">PT</option>
                        <option value="QC">QC</option>
                        <option value="Despatch">Despatch</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t dark:border-slate-850 pt-4">
                    {/* TABLE/VIEW DROPDOWN */}
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1.5 text-slate-400">Select Postgres Table/View</label>
                      <select
                        value={selectedSourceTable}
                        onChange={(e) => setSelectedSourceTable(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-emerald-500 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'}`}
                      >
                        {Object.keys(POSTGRES_TABLE_DICTIONARY).map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase mb-1.5 text-slate-400">Sub-menu Layout Mode</label>
                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={subCategoryType}
                          onChange={(e) => setSubCategoryType(e.target.value)}
                          className={`px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-emerald-500 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                        >
                          <option value="new">Create New Sub-menu</option>
                          <option value="existing">Add/Overwrite Existing Sub-menu</option>
                        </select>
                        <input 
                          type="text" 
                          placeholder="Sub-menu Link Label (e.g. Breaks)" 
                          value={targetSubmenuLabel}
                          onChange={(e) => setTargetSubmenuLabel(e.target.value)}
                          className={`px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-emerald-500 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* INTERACTIVE COLUMN PICKER SECTOR */}
                  <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-100/50 border-slate-200'}`}>
                    <div className="flex items-center justify-between pb-3 border-b dark:border-slate-800 mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <ListFilter className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Select Columns to display in this report</span>
                      </span>
                      
                      <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-emerald-500">
                        <input 
                          type="checkbox"
                          checked={isSelectAllChecked}
                          onChange={handleSelectAllToggle}
                          className="rounded border-slate-350 accent-emerald-600 focus:ring-emerald-500" 
                        />
                        <span>Select All columns (*)</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {availableColumns.map(col => (
                        <label 
                          key={col.name}
                          className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer select-none transition-all ${
                            checkedColumns[col.name]
                              ? theme === 'dark' ? 'bg-emerald-950/20 border-emerald-500/50 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                              : theme === 'dark' ? 'bg-slate-950 border-slate-850 hover:bg-slate-900' : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <input 
                            type="checkbox"
                            checked={!!checkedColumns[col.name]}
                            onChange={() => handleColumnToggle(col.name)}
                            className="rounded mt-0.5 accent-emerald-600 focus:ring-emerald-500"
                          />
                          <div className="text-xs leading-tight">
                            <span className="font-semibold block truncate">{col.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono block">{col.type}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* LIVE SQL PREVIEW */}
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1.5 text-slate-400 flex justify-between items-center">
                      <span>PostgreSQL Select Statement Preview (Autogenerated)</span>
                      <span className="text-[10px] text-emerald-500 font-mono">Real-time compilation projection</span>
                    </label>
                    <textarea
                      rows={4}
                      readOnly
                      value={rawSQLInput}
                      className="w-full p-3 font-mono text-xs rounded-lg border outline-none bg-slate-950 border-slate-800 text-emerald-400 focus:ring-0 cursor-not-allowed"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleParseSQLQuery}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg text-xs font-extrabold flex items-center gap-2 shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Compile Selected Schema & View Preview →</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: MULTI-KPI ASSIGNMENT & METRIC SLOTS */}
              {creatorStep === 2 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="p-4 rounded-xl border border-dashed dark:border-slate-800 border-slate-200 bg-slate-50/55 dark:bg-slate-900/10">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-emerald-500" />
                      Step 2: Map & Enable up to 4 Dashboard KPI Cards
                    </h4>
                    
                    <div className="space-y-4">
                      {creatorKPIs.map((kpi, index) => (
                        <div 
                          key={index} 
                          className={`p-4 rounded-lg border flex flex-col md:flex-row md:items-center gap-4 transition-all ${
                            kpi.enabled 
                              ? 'border-emerald-500/40 bg-emerald-50/10 dark:bg-emerald-950/5' 
                              : 'opacity-55 border-slate-200 dark:border-slate-800 bg-slate-100/30'
                          }`}
                        >
                          {/* Toggle Switch */}
                          <div className="flex items-center gap-2 shrink-0 md:w-36">
                            <button
                              type="button"
                              onClick={() => handleUpdateCreatorKPI(index, 'enabled', !kpi.enabled)}
                              className={`p-1 rounded-full transition-colors ${kpi.enabled ? 'text-emerald-500' : 'text-slate-400'}`}
                            >
                              {kpi.enabled ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                            </button>
                            <span className="text-xs font-bold uppercase tracking-tight text-slate-500">
                              {kpi.enabled ? `Card ${index+1} Active` : `Card ${index+1} Idle`}
                            </span>
                          </div>

                          {/* Metric Settings */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 w-full">
                            <div>
                              <label className="block text-[10px] font-semibold mb-1 text-slate-400">KPI Card Title</label>
                              <input 
                                type="text" 
                                disabled={!kpi.enabled}
                                value={kpi.label}
                                onChange={(e) => handleUpdateCreatorKPI(index, 'label', e.target.value)}
                                className={`w-full p-2 rounded border text-xs outline-none focus:ring-1 focus:ring-emerald-500 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'} disabled:cursor-not-allowed`}
                              />
                            </div>
                            
                            <div>
                              <label className="block text-[10px] font-semibold mb-1 text-slate-400">Actual Value Column</label>
                              <select
                                disabled={!kpi.enabled}
                                value={kpi.actualKey}
                                onChange={(e) => handleUpdateCreatorKPI(index, 'actualKey', e.target.value)}
                                className={`w-full p-2 rounded border text-xs outline-none focus:ring-1 focus:ring-emerald-500 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'} disabled:cursor-not-allowed`}
                              >
                                <option value="">-- None --</option>
                                {parsedColumns.filter(c => c.type === 'number').map(c => (
                                  <option key={c.key} value={c.key}>{c.label}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-semibold mb-1 text-slate-400">Target Value Column (Optional)</label>
                              <select
                                disabled={!kpi.enabled}
                                value={kpi.targetKey}
                                onChange={(e) => handleUpdateCreatorKPI(index, 'targetKey', e.target.value)}
                                className={`w-full p-2 rounded border text-xs outline-none focus:ring-1 focus:ring-emerald-500 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'} disabled:cursor-not-allowed`}
                              >
                                <option value="">-- None --</option>
                                {parsedColumns.filter(c => c.type === 'number').map(c => (
                                  <option key={c.key} value={c.key}>{c.label}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-semibold mb-1 text-slate-400">Metric Unit Symbol</label>
                              <input 
                                type="text" 
                                placeholder="e.g. Kg, Pcs, Hrs"
                                disabled={!kpi.enabled}
                                value={kpi.unit}
                                onChange={(e) => handleUpdateCreatorKPI(index, 'unit', e.target.value)}
                                className={`w-full p-2 rounded border text-xs outline-none focus:ring-1 focus:ring-emerald-500 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'} disabled:cursor-not-allowed`}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* DATA ROWS PREVIEW */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Simulate SQL View Row Records</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b dark:border-slate-800">
                            {parsedColumns.map(c => (
                              <th key={c.key} className="p-2 font-bold uppercase text-slate-400">{c.label}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {creatorDataRows.map((row, rIndex) => (
                            <tr key={rIndex} className="border-b border-slate-100 dark:border-slate-900">
                              {parsedColumns.map(col => (
                                <td key={col.key} className="p-1">
                                  <input 
                                    type="text"
                                    value={row[col.key] || ''}
                                    placeholder={col.type === 'number' ? '0' : 'Data'}
                                    onChange={(e) => {
                                      const updatedRows = [...creatorDataRows];
                                      updatedRows[rIndex][col.key] = e.target.value;
                                      setCreatorDataRows(updatedRows);
                                    }}
                                    className={`p-1.5 rounded border outline-none text-xs w-full font-mono ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'}`}
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex justify-between pt-3 border-t dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setCreatorStep(1)}
                      className="px-4 py-2 border dark:border-slate-850 rounded-lg text-xs"
                    >
                      ← Back to Query Editor
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveDynamicSQLView}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg text-xs font-extrabold shadow-sm active:scale-95"
                    >
                      ✔ {editingViewId ? 'Save Changes (In-Place)' : 'Mount Dynamic View & Sub-menu'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ACTIVE VIEW INFO PANEL */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in fade-in duration-200">
            <div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                {activeView?.category || 'Database Report'}
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight mt-1 flex items-center gap-2">
                <span>{activeView?.displayName}</span>
                <code className="text-xs px-2 py-0.5 rounded font-mono bg-slate-200 dark:bg-slate-800 text-slate-500 uppercase">
                  {activeView?.title}
                </code>
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                {activeView?.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 items-center">
              <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold ${theme === 'dark' ? 'bg-slate-800/80 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>As of Date: {activeView?.meta?.date || 'N/A'}</span>
              </div>
              <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold ${theme === 'dark' ? 'bg-slate-800/80 text-amber-400' : 'bg-amber-50 text-amber-700'}`}>
                <Clock className="w-3.5 h-3.5" />
                <span>Remaining Work Days: {activeView?.meta?.balanceDays || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* TOP KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in duration-200">
            {dynamicKPIs.map((kpi, kIdx) => (
              <div 
                key={kpi.id || kIdx}
                className={`p-4 rounded-xl border transition-all ${theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'}`}
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider truncate mr-1" title={kpi.label}>{kpi.label}</span>
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                </div>
                <p className="text-lg font-black mt-2 leading-tight">
                  <span className="text-emerald-500">{kpi.actual !== null && kpi.actual !== undefined ? kpi.actual.toLocaleString('en-IN') : '—'}</span>
                  {kpi.target !== null && kpi.target !== undefined && (
                    <>
                      <span className="text-slate-400 font-normal"> / </span>
                      <span>{kpi.target.toLocaleString('en-IN')}</span>
                    </>
                  )}
                  <span className="text-xs font-semibold text-slate-500 ml-1">{kpi.unit}</span>
                </p>
                <div className="text-slate-400 text-xs mt-1.5">
                  {kpi.efficiency !== null ? (
                    <span>Goal Fulfillment: <span className="text-emerald-500 font-bold">{kpi.efficiency}%</span></span>
                  ) : (
                    <span className="text-slate-500">Continuous metered shift log</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* SQL ANALYST EDITOR CONTROL SCREEN */}
          <div className={`border rounded-xl overflow-hidden transition-all ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
            <button 
              onClick={() => setShowSQLPanel(!showSQLPanel)}
              className={`w-full px-4 py-2.5 flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider ${
                theme === 'dark' ? 'bg-slate-900 text-emerald-400' : 'bg-slate-100 text-emerald-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-500" />
                <span>Active Postgres SQL View Definition Schema</span>
              </span>
              <span>{showSQLPanel ? 'Hide Query [-]' : 'Show Query [+]'}</span>
            </button>
            
            {showSQLPanel && (
              <div className="bg-slate-950 p-4 font-mono text-xs overflow-x-auto max-w-full text-emerald-400 border-t border-slate-850">
                <pre className="leading-relaxed whitespace-pre">{activeView?.sqlQuery}</pre>
                <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500">
                  <span>Target Database Engine: PostgreSQL v15.4</span>
                  <span>Alias Projection mapped automatically to Table headers</span>
                </div>
              </div>
            )}
          </div>

          {/* ACTIONS BAR */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative max-w-md w-full">
              <Search className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={`Search rows...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-emerald-500 ${
                  theme === 'dark' 
                    ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' 
                    : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
                }`}
              />
            </div>

            <button
              onClick={() => triggerToast("View CSV data exported successfully")}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold inline-flex items-center gap-2 transition-all hover:bg-slate-100 dark:hover:bg-slate-900 ${
                theme === 'dark' ? 'border-slate-800 text-slate-300' : 'border-slate-200 text-slate-700 bg-white'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Export SQL View to CSV</span>
            </button>
          </div>

          {/* MAIN TABULAR RENDER COMPONENT */}
          {activeView.isConsolidated ? (
            /* CONSOLIDATED STACKED MASTER VIEW */
            <div className="space-y-10">
              {activeView.tables.map((tbl, tblIdx) => {
                const filteredData = tbl.data.filter(row => {
                  return Object.values(row).some(val => 
                    String(val).toLowerCase().includes(searchQuery.toLowerCase())
                  );
                });

                return (
                  <div 
                    key={tblIdx}
                    className={`border rounded-2xl overflow-hidden shadow-sm ${
                      theme === 'dark' ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className={`px-5 py-3 border-b flex justify-between items-center ${
                      theme === 'dark' ? 'bg-slate-900/80 border-slate-850' : 'bg-slate-50 border-slate-100'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-700 dark:text-slate-200">{tbl.title}</h3>
                      </div>
                    </div>

                    <div className="overflow-x-auto max-w-full">
                      <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                          <tr className={`border-b ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50/50 border-slate-200'}`}>
                            {tbl.headers.map((grp, i) => (
                              <th
                                key={i}
                                colSpan={grp.colspan}
                                className={`py-2.5 px-4 text-center text-xs font-black uppercase tracking-wider border-r last:border-r-0 ${
                                  theme === 'dark' ? 'text-slate-300 border-slate-800' : 'text-slate-500 border-slate-200'
                                }`}
                              >
                                {grp.label}
                              </th>
                            ))}
                          </tr>
                          <tr className={`border-b ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-100/30 border-slate-200'}`}>
                            {tbl.columns.map((col) => (
                              <th
                                key={col.key}
                                className={`py-3 px-4 text-xs font-bold uppercase tracking-tight ${
                                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                                }`}
                              >
                                {col.label}
                              </th>
                            ))}
                          </tr>
                        </thead>

                        <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-800' : 'divide-slate-100'}`}>
                          {filteredData.length > 0 ? (
                            filteredData.map((row, rIdx) => {
                              const isTotal = row.isTotalRow;
                              return (
                                <tr 
                                  key={rIdx}
                                  className={`transition-colors ${
                                    isTotal 
                                      ? theme === 'dark' ? 'bg-emerald-950/35 font-bold' : 'bg-emerald-50/70 font-semibold'
                                      : rIdx % 2 === 0
                                        ? 'bg-transparent'
                                        : theme === 'dark' ? 'bg-slate-900/10' : 'bg-slate-50/30'
                                  }`}
                                >
                                  {tbl.columns.map((col) => {
                                    const value = row[col.key];
                                    const isNumeric = col.type === 'number';
                                    let styleClass = "py-3 px-4 text-sm ";

                                    if (isNumeric) {
                                      styleClass += "text-right font-mono ";
                                    } else {
                                      styleClass += "font-medium ";
                                    }

                                    if (col.highlightGap && typeof value === 'number') {
                                      if (value < 0) {
                                        styleClass += "text-rose-600 dark:text-rose-400 font-bold ";
                                      } else if (value > 0) {
                                        styleClass += "text-emerald-600 dark:text-emerald-400 font-bold ";
                                      }
                                    }

                                    return (
                                      <td 
                                        key={col.key} 
                                        className={`${styleClass} border-r last:border-r-0 ${
                                          theme === 'dark' ? 'border-slate-800 text-slate-300' : 'border-slate-200 text-slate-700'
                                        }`}
                                      >
                                        {isNumeric && value !== undefined && value !== null
                                          ? value.toLocaleString('en-IN') 
                                          : value !== undefined && value !== null 
                                            ? String(value) 
                                            : '—'
                                        }
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={tbl.columns.length} className="py-8 text-center text-slate-400 text-xs">
                                No records matching filter "{searchQuery}"
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* INDIVIDUAL VIEW MODE RENDERER */
            <div className={`border rounded-2xl overflow-hidden shadow-sm ${theme === 'dark' ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'}`}>
              <div className="overflow-x-auto max-w-full">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className={`border-b ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      {activeView?.headers.map((grp, i) => (
                        <th
                          key={i}
                          colSpan={grp.colspan}
                          className={`py-3 px-4 text-center text-xs font-black uppercase tracking-wider border-r last:border-r-0 ${
                            theme === 'dark' ? 'text-slate-300 border-slate-800' : 'text-slate-500 border-slate-200'
                          }`}
                        >
                          {grp.label}
                        </th>
                      ))}
                    </tr>
                    
                    <tr className={`border-b ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-100/50 border-slate-200'}`}>
                      {activeView?.columns.map((col) => (
                        <th
                          key={col.key}
                          className={`py-3 px-4 text-xs font-bold uppercase tracking-tight ${
                            theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                          }`}
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-800' : 'divide-slate-100'}`}>
                    {activeView.data
                      .filter(row => {
                        return Object.values(row).some(val => 
                          String(val).toLowerCase().includes(searchQuery.toLowerCase())
                        );
                      })
                      .map((row, rIdx) => {
                        const isTotal = row.isTotalRow;
                        return (
                          <tr 
                            key={rIdx}
                            className={`transition-colors ${
                              isTotal 
                                ? theme === 'dark' ? 'bg-emerald-950/30 font-bold' : 'bg-emerald-50/70 font-semibold'
                                : rIdx % 2 === 0
                                  ? 'bg-transparent'
                                  : theme === 'dark' ? 'bg-slate-900/10' : 'bg-slate-50/20'
                            }`}
                          >
                            {activeView.columns.map((col) => {
                              const value = row[col.key];
                              const isNumeric = col.type === 'number';
                              let styleClass = "py-3.5 px-4 text-sm ";

                              if (isNumeric) {
                                styleClass += "text-right font-mono ";
                              } else {
                                styleClass += "font-medium ";
                              }

                              if (col.highlightGap && typeof value === 'number') {
                                if (value < 0) {
                                  styleClass += "text-rose-600 dark:text-rose-400 font-bold ";
                                } else if (value > 0) {
                                  styleClass += "text-emerald-600 dark:text-emerald-400 font-bold ";
                                }
                              }

                              return (
                                <td 
                                  key={col.key} 
                                  className={`${styleClass} border-r last:border-r-0 ${
                                    theme === 'dark' ? 'border-slate-800 text-slate-300' : 'border-slate-200 text-slate-700'
                                  }`}
                                >
                                  {isNumeric && value !== undefined && value !== null
                                    ? value.toLocaleString('en-IN') 
                                    : value !== undefined && value !== null 
                                      ? String(value) 
                                      : '—'
                                  }
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* DEVELOPMENT ARCHITECTURE GUIDE */}
          <section className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
            <h3 className="font-extrabold text-base mb-2 flex items-center gap-2 text-slate-900 dark:text-white">
              <Database className="w-5 h-5 text-emerald-500" />
              <span>Recommended Database Pipeline Architecture (PostgreSQL)</span>
            </h3>
            <p className="text-sm leading-relaxed text-slate-400 mb-4">
              When transitioning this front-end to a real server, configure your backend API (Node.js/Python/Go) to return data matching your schema.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 text-slate-300 space-y-2">
                <span className="text-emerald-400 font-bold">// 1. Backend Route Example (Express/Node)</span>
                <p className="text-[11px] leading-relaxed">
                  {`app.get('/api/views/:viewName', async (req, res) => {
  const { viewName } = req.params;
  const client = await pool.connect();
  try {
    const result = await client.query(\`SELECT * FROM \${viewName}\`);
    res.json(result.rows);
  } finally {
    client.release();
  }
});`}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 text-slate-300 space-y-2">
                <span className="text-emerald-400 font-bold">// 2. Dynamic Component Integration</span>
                <p className="text-[11px] leading-relaxed">
                  {`// Simply replace initialReports state with an API pull:
useEffect(() => {
  fetch('/api/views/' + activeViewName)
    .then(res => res.json())
    .then(data => setViewData(data));
}, [activeViewName]);`}
                </p>
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}