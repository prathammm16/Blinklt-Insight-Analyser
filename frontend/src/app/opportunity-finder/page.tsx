"use client";

import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import UploadModal from "@/components/shared/UploadModal";
import OpportunityCard, {
  buildOpportunities,
} from "@/components/opportunity/OpportunityCard";
import BottomActionBar from "@/components/opportunity/BottomActionBar";
import { getHistory, getReport } from "@/lib/api";
import { SEED_ANALYSIS } from "@/lib/seedData";
import type { AnalysisResult, RunHistoryEntry } from "@/types";
import {
  TrendingUp,
  DollarSign,
  Target,
  FlaskConical,
  Filter,
} from "lucide-react";

export default function OpportunityFinderPage() {
  const [showUpload, setShowUpload] = useState(false);
  const [result, setResult] = useState<AnalysisResult>(SEED_ANALYSIS);
  const [activeFilter, setActiveFilter] = useState<"High Priority" | "Growth Potential">(
    "High Priority"
  );
  const [history, setHistory] = useState<RunHistoryEntry[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const loadHistory = useCallback(async () => {
    try {
      const h = await getHistory();
      setHistory(h);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const themes = result.themes?.length ? result.themes : SEED_ANALYSIS.themes;
  const opportunities = buildOpportunities(themes, result.pain_points ?? []);

  const featured = opportunities[0];
  const compact = opportunities[1];
  const remaining = opportunities.slice(2);

  const handleGeneratePMReport = async () => {
    const runId = result.run_id !== "seed_default" ? result.run_id : history[0]?.run_id;
    if (!runId) return;
    setIsGenerating(true);
    try {
      await getReport(runId);
    } finally {
      setIsGenerating(false);
    }
  };

  const topStats = [
    {
      label: "Total Opportunities",
      value: String(opportunities.length * 10 + 2),
      sub: "+8 vs last month",
      subColor: "var(--positive)",
      icon: <TrendingUp size={18} />,
    },
    {
      label: "Expected GMV Lift",
      value: "$1.2M",
      sub: "↑ 14% efficiency boost",
      subColor: "var(--positive)",
      icon: <DollarSign size={18} />,
      hasProgress: false,
    },
    {
      label: "Confidence Score",
      value: "88%",
      sub: null,
      icon: <Target size={18} />,
      hasProgress: true,
    },
    {
      label: "Active Experiments",
      value: "6",
      sub: "4 in backlog",
      subColor: "var(--text-muted)",
      icon: <FlaskConical size={18} />,
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--bg-main)",
      }}
    >
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
          searchPlaceholder="Search opportunities..."
          onUpload={() => setShowUpload(true)}
          onGenerateReport={handleGeneratePMReport}
          isGenerating={isGenerating}
        />

        <main style={{ flex: 1, padding: 24, paddingBottom: 0 }}>
          {/* Page header */}
          <div
            className="animate-fadeIn"
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  marginBottom: 4,
                }}
              >
                Opportunity Finder
              </h1>
              <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                Data-driven expansion vectors identified from 12.4k customer interactions
                this week.
              </p>
            </div>

            {/* Filter buttons */}
            <div
              style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}
            >
              {(["High Priority", "Growth Potential"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className="btn"
                  style={{
                    fontSize: 13,
                    padding: "7px 16px",
                    background: activeFilter === f ? "var(--bg-dark)" : "white",
                    color: activeFilter === f ? "white" : "var(--text-secondary)",
                    border: `1px solid ${activeFilter === f ? "var(--bg-dark)" : "var(--border)"}`,
                    borderRadius: 8,
                  }}
                >
                  {f}
                </button>
              ))}
              <button
                className="btn btn-secondary"
                style={{ padding: "7px 10px" }}
                title="Filter"
              >
                <Filter size={15} />
              </button>
            </div>
          </div>

          {/* Top stat cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 12,
              marginBottom: 20,
            }}
          >
            {topStats.map((s, i) => (
              <div
                key={i}
                className="card animate-fadeIn"
                style={{ padding: 20, animationDelay: `${i * 0.06}s` }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    marginBottom: 8,
                    fontWeight: 500,
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    lineHeight: 1,
                    marginBottom: 8,
                  }}
                >
                  {s.value}
                </div>
                {s.hasProgress ? (
                  <div
                    style={{
                      height: 5,
                      background: "var(--border)",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: "88%",
                        background: "var(--bg-dark)",
                        borderRadius: 3,
                      }}
                    />
                  </div>
                ) : (
                  s.sub && (
                    <div
                      style={{
                        fontSize: 12,
                        color: s.subColor ?? "var(--text-muted)",
                        fontWeight: 500,
                      }}
                    >
                      {s.sub}
                    </div>
                  )
                )}
              </div>
            ))}
          </div>

          {/* Main opportunities layout */}
          <div
            style={{
              display: "flex",
              gap: 16,
              marginBottom: 16,
            }}
          >
            {/* Featured opportunity */}
            {featured && (
              <OpportunityCard item={featured} isFeatured />
            )}

            {/* Compact side card */}
            {compact && (
              <div style={{ width: 280, flexShrink: 0 }}>
                <OpportunityCard item={compact} />
              </div>
            )}
          </div>

          {/* Remaining opportunities row */}
          {remaining.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${Math.min(remaining.length, 2)}, 1fr)`,
                gap: 16,
                marginBottom: 16,
              }}
            >
              {remaining.map((opp, i) => (
                <OpportunityCard key={i} item={opp} />
              ))}
            </div>
          )}
        </main>

        {/* Sticky bottom bar */}
        <BottomActionBar
          opportunityCount={opportunities.length}
          onGeneratePM={handleGeneratePMReport}
        />
      </div>

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={(r) => {
            setResult(r);
            loadHistory();
          }}
        />
      )}
    </div>
  );
}
