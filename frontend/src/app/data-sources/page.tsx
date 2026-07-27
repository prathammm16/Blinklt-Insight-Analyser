"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import UploadModal from "@/components/shared/UploadModal";
import { useAnalysis } from "@/context/AnalysisContext";
import {
  Database,
  Smartphone,
  UploadCloud,
  RefreshCw,
  CheckCircle,
  Clock,
  Filter,
  Layers,
  Settings,
  ShieldCheck,
} from "lucide-react";

export default function DataSourcesPage() {
  const { result, updateAnalysisResult } = useAnalysis();
  const [showUpload, setShowUpload] = useState(false);
  const stats = result?.stats || { original_count: 200, cleaned_count: 165, duplicates_removed: 22, non_english_removed: 13 };
  const sourceCounts = result?.source_counts || { play_store: 50, app_store: 150, csv_upload: 0 };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-main)" }}>
      <Sidebar />

      <div
        style={{
          marginLeft: "var(--sidebar-width)",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <TopBar
          searchPlaceholder="Search data pipelines and sources..."
          onUpload={() => setShowUpload(true)}
          onGenerateReport={() => {}}
        />

        <main style={{ flex: 1, padding: 24 }}>
          {/* Header */}
          <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <Database size={22} style={{ color: "var(--gold)" }} />
                <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>
                  Data Sources & Scraper Pipelines
                </h1>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                Monitor automated review collection engines, target app IDs, and custom CSV dataset imports.
              </p>
            </div>

            <button
              onClick={() => setShowUpload(true)}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                background: "var(--gold)",
                color: "#1C1C1C",
                fontWeight: 700,
                fontSize: 13,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <RefreshCw size={14} /> Run Fresh Collection
            </button>
          </div>

          {/* Active Data Pipelines Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 20,
              marginBottom: 28,
            }}
          >
            {/* Google Play Store Scraper */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "#D1FAE5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Smartphone size={18} color="#059669" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                      Google Play Store Scraper
                    </h2>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>
                      com.blinkit.consumer
                    </span>
                  </div>
                </div>
                <span className="badge badge-green" style={{ fontSize: 10 }}>
                  <CheckCircle size={10} /> Active
                </span>
              </div>

              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
                Automated Python scrapper using <code>google-play-scraper</code> fetching latest consumer reviews & ratings.
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "8px 12px", background: "var(--bg-main)", borderRadius: 6, border: "1px solid var(--border)" }}>
                <span style={{ color: "var(--text-muted)" }}>Last Fetch Count:</span>
                <strong style={{ color: "var(--text-primary)" }}>{sourceCounts?.play_store || 50} Reviews</strong>
              </div>
            </div>

            {/* Apple App Store Scraper */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "#E0E7FF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Smartphone size={18} color="#4F46E5" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                      Apple App Store Scraper
                    </h2>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>
                      id1552528766 (Blinkit iOS)
                    </span>
                  </div>
                </div>
                <span className="badge badge-green" style={{ fontSize: 10 }}>
                  <CheckCircle size={10} /> Active
                </span>
              </div>

              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
                RSS feed & App Store review parser fetching iOS user ratings and feedback.
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "8px 12px", background: "var(--bg-main)", borderRadius: 6, border: "1px solid var(--border)" }}>
                <span style={{ color: "var(--text-muted)" }}>Last Fetch Count:</span>
                <strong style={{ color: "var(--text-primary)" }}>{sourceCounts?.app_store || 150} Reviews</strong>
              </div>
            </div>

            {/* Custom CSV Upload Engine */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "#FEF3C7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <UploadCloud size={18} color="#D97706" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                      CSV File Ingestion Engine
                    </h2>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      Supports .csv format
                    </span>
                  </div>
                </div>
                <span className="badge badge-amber" style={{ fontSize: 10 }}>
                  Ready
                </span>
              </div>

              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
                Directly upload offline CSV exports containing columns: <code>review</code>, <code>rating</code>, <code>platform</code>.
              </div>

              <button
                onClick={() => setShowUpload(true)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid var(--border-strong)",
                  background: "var(--bg-main)",
                  color: "var(--text-primary)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Upload CSV File
              </button>
            </div>
          </div>

          {/* Preprocessing & Cleaning Funnel Breakdown */}
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
            Dataset Preprocessing Pipeline Funnel
          </h2>

          <div className="card" style={{ padding: 24 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 20,
              }}
            >
              <div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                  1. Raw Reviews Ingested
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>
                  {stats?.original_count || 200}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                  From Play Store & App Store
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                  2. Exact Duplicates Removed
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#EF4444" }}>
                  -{stats?.duplicates_removed || 22}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                  Spam & duplicate entries
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                  3. Non-English Filtered
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#F59E0B" }}>
                  -{stats?.non_english_removed || 13}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                  Language identification step
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                  4. Cleaned Ready Dataset
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#10B981" }}>
                  {stats?.cleaned_count || 165}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                  Passed to Gemini LLM Analyzer
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={(res) => {
            updateAnalysisResult(res);
            setShowUpload(false);
          }}
        />
      )}
    </div>
  );
}
