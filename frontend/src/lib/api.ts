import axios from "axios";
import type {
  AnalysisResult,
  RunHistoryEntry,
  ReportResponse,
  HealthResponse,
  ScrapeRequest,
} from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120_000, // 2 minutes for long analysis
});

// ─── Health ──────────────────────────────────────────────────────────────────

export async function checkHealth(): Promise<HealthResponse> {
  const { data } = await api.get<HealthResponse>("/api/health");
  return data;
}

// ─── History ─────────────────────────────────────────────────────────────────

export async function getHistory(): Promise<RunHistoryEntry[]> {
  const { data } = await api.get<RunHistoryEntry[]>("/api/history");
  return data;
}

// ─── Report ──────────────────────────────────────────────────────────────────

export async function getReport(runId: string): Promise<ReportResponse> {
  const { data } = await api.get<ReportResponse>(`/api/report/${runId}`);
  return data;
}

// ─── Analyze: Play Store ─────────────────────────────────────────────────────

export async function analyzePlayStore(
  request: ScrapeRequest
): Promise<AnalysisResult> {
  const { data } = await api.post<AnalysisResult>(
    "/api/analyze/scrape/play-store",
    request
  );
  return data;
}

// ─── Analyze: App Store ──────────────────────────────────────────────────────

export async function analyzeAppStore(
  request: ScrapeRequest
): Promise<AnalysisResult> {
  const { data } = await api.post<AnalysisResult>(
    "/api/analyze/scrape/app-store",
    request
  );
  return data;
}

// ─── Analyze: CSV Upload ─────────────────────────────────────────────────────

export async function analyzeCSVUpload(
  file: File,
  count: number = 100
): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("count", String(count));

  const { data } = await api.post<AnalysisResult>(
    "/api/analyze/upload",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data;
}

export default api;
