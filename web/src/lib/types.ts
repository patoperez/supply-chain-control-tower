/**
 * Types mirroring the static JSON in `web/public/data/` exactly.
 * The Python pipeline (export_web_data.py) is the source of truth for these shapes.
 * No `any`. If the pipeline's output schema changes, update these types first.
 */

export type Region = "Central" | "West" | "North" | "Southeast";
export type Rotation = "High" | "Med" | "Low";
export type RiskLevel = "Low" | "Medium" | "High";
export type Channel = "Mass" | "Convenience" | "Wholesale" | "Traditional";
export type DemandTier = "A" | "B" | "C";
export type Weekday =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

// ── dimensions.json ──
export interface Product {
  sku: string;
  brand: string;
  category: string;
  presentation: string;
  unit_cost: number;
  unit_price: number;
  rotation: Rotation;
}

export interface DistributionCenter {
  cd_id: string;
  name: string;
  city: string;
  region: Region;
  lat: number;
  lon: number;
  capacity: number;
}

export interface Store {
  store_id: string;
  channel: Channel;
  demand_tier: DemandTier;
  assigned_cd_id: string;
  region: Region;
}

export interface CalendarDay {
  date: string;
  weekday: Weekday;
  is_weekend: boolean;
  is_payday: boolean;
  is_demand_event: boolean;
}

export interface Dimensions {
  products: Product[];
  distribution_centers: DistributionCenter[];
  stores: Store[];
  calendar: CalendarDay[];
}

// ── kpis.json ──
export interface Kpis {
  fill_rate: number;
  on_time_delivery: number;
  stockout_events: number;
  stockout_rate: number;
  unmet_units_total: number;
  lost_sales_mxn: number;
  lost_sales_is_estimate: boolean;
  mape: number;
  shipment_lines: number;
  late_lines: number;
  incomplete_lines: number;
  inventory_rows: number;
}

// ── findings.json ──
export interface ParetoEntry {
  cd_id: string;
  name: string;
  city: string;
  lost_sales_mxn: number;
  share: number;
  cumulative_share: number;
}

export interface WeekdayLate {
  weekday: Weekday;
  shipments: number;
  late: number;
  late_rate: number;
}

export interface CategoryMape {
  category: string;
  mape: number;
}

export interface Findings {
  pareto_by_cedis: ParetoEntry[];
  late_by_weekday: WeekdayLate[];
  mape_by_category: CategoryMape[];
}

// ── risk_scores.json ──
export interface RiskScore {
  sku: string;
  cd_id: string;
  rotation: Rotation;
  current_stock: number;
  avg_daily_demand: number;
  days_of_cover: number | null; // null only for zero-demand combos
  safety_stock: number;
  below_safety: boolean;
  demand_cv: number;
  cover_pts: number;
  safety_pts: number;
  volatility_pts: number;
  rotation_pts: number;
  risk_score: number;
  risk_level: RiskLevel;
}

// ── cleaning_audit.json ──
export interface AuditSummary {
  raw_rows: number;
  rows_with_issues: number;
  cleaned_rows: number;
  rows_removed: number;
  rows_recovered_in_place: number;
  retention_pct: number;
  flagged_incomplete: number;
  flagged_late: number;
}

export type AuditAction = "recovered" | "removed" | "flagged";

export interface AuditStep {
  issue: string;
  label: string;
  teaches: string;
  detected: number;
  action: AuditAction;
  rows_dropped: number;
  resolution: string;
  unrecovered?: number; // present on the SKU-typo step only
}

export interface AuditCheck {
  injected: number;
  detected: number;
  match: boolean;
}

export interface CleaningAudit {
  summary: AuditSummary;
  steps: AuditStep[];
  validation: Record<string, AuditCheck>;
}

// ── raw_sample.json ──
export interface RawSampleRow {
  shipment_id: string;
  order_date: string;
  cd_id: string;
  store_id: string;
  sku: string;
  qty_ordered: number | null;
  qty_received: number | null; // null where the received quantity is missing
  promised_delivery: string;
  actual_delivery: string;
  status: string;
  issues: string[];
}

// ── daily_aggregates.json (columnar payload) ──
export interface DailyAggregates {
  columns: string[];
  rows: Array<Array<string | number>>;
}

/** One parsed daily-aggregate cell, keyed by (date × region × brand). */
export interface DailyAggRow {
  date: string;
  region: Region;
  brand: string;
  act: number; // actual demand units
  fcst: number; // forecast demand units
  ape_sum: number; // Σ |actual-forecast|/actual over rows with actual>0
  ape_n: number; // count of rows with actual>0 (MAPE denominator)
  ordered: number; // shipment qty ordered
  received: number; // shipment qty received
  lines: number; // shipment line count
  late: number; // late shipment lines
  stockouts: number; // stockout events
  lost: number; // lost sales (MXN, price-weighted estimate)
}
