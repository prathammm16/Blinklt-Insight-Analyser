// ============================================
// Shared TypeScript types for Blinkit Insight AI
// ============================================

export interface SupportingReview {
  review_id: string;
  quote: string;
  platform?: string;
  source?: string;
}

export interface Theme {
  theme_id: string;
  title: string;
  description: string;
  supporting_reviews: SupportingReview[];
  size?: number;
}

export interface Behavior {
  behavior_type: string;
  description: string;
  supporting_reviews: SupportingReview[];
}

export interface JTBD {
  jtbd_statement: string;
  supporting_reviews: SupportingReview[];
}

export interface PainPoint {
  issue: string;
  root_cause: string;
  supporting_reviews: SupportingReview[];
}

export interface Sentiments {
  positive: number;
  neutral: number;
  negative: number;
}

export interface SourceCounts {
  play_store: number;
  app_store: number;
  csv_upload: number;
}

export interface Stats {
  original_count?: number;
  cleaned_count?: number;
  duplicates_removed?: number;
  non_english_removed?: number;
}

export interface AnalysisResult {
  run_id: string;
  timestamp: string;
  source: string;
  app_id: string;
  stats: Stats;
  source_counts: SourceCounts;
  sentiments: Sentiments;
  themes: Theme[];
  behaviors: Behavior[];
  jtbd: JTBD[];
  pain_points: PainPoint[];
}

export interface RunHistoryEntry {
  run_id: string;
  timestamp: string;
  source: string;
  app_id: string;
  total_reviews: number;
  cleaned_reviews: number;
  status: "COMPLETED" | "FAILED";
}

export interface ReportResponse {
  run_id: string;
  markdown: string;
  saved_path: string;
}

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
}

export interface ScrapeRequest {
  app_id_or_url: string;
  count: number;
}

// UI-only types
export type NavItem =
  | "dashboard"
  | "review-explorer"
  | "ai-discovery"
  | "theme-analysis"
  | "shopping-behaviour"
  | "jtbd"
  | "root-cause"
  | "opportunity-finder"
  | "reports"
  | "data-sources"
  | "settings";

export type AnalysisSource = "play-store" | "app-store" | "csv";
