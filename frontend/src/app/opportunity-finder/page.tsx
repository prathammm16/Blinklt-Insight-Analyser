"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import UploadModal from "@/components/shared/UploadModal";
import OpportunityCard, {
  buildOpportunities,
} from "@/components/opportunity/OpportunityCard";
import BottomActionBar from "@/components/opportunity/BottomActionBar";
import { getReport } from "@/lib/api";
import { useAnalysis } from "@/context/AnalysisContext";
import type { AnalysisResult } from "@/types";
import {
  TrendingUp,
  DollarSign,
  Target,
  FlaskConical,
  Filter,
} from "lucide-react";

export default function OpportunityFinderPage() {
  const { result, history, updateAnalysisResult } = useAnalysis();
  const [showUpload, setShowUpload] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"High Priority" | "Growth Potential">(
    "High Priority"
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const themes = result?.themes ?? [];
  const rawOpportunities = buildOpportunities(themes, result?.pain_points ?? []);

  const opportunities = React.useMemo(() => {
    if (activeFilter === "High Priority") {
      return [...rawOpportunities].sort((a, b) => {
        const pOrder: Record<string, number> = { P0: 0, P1: 1, P2: 2 };
        const orderA = pOrder[a.priority] ?? 99;
        const orderB = pOrder[b.priority] ?? 99;
        if (orderA !== orderB) return orderA - orderB;
        return b.confidence - a.confidence;
      });
    } else {
      return [...rawOpportunities].sort((a, b) => {
        const valA = parseFloat(a.growth.replace(/[^0-9.]/g, "")) || 0;
        const valB = parseFloat(b.growth.replace(/[^0-9.]/g, "")) || 0;
        return valB - valA;
      });
    }
  }, [rawOpportunities, activeFilter]);

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

  const totalCleaned = result?.stats?.cleaned_count || (result?.themes ? result.themes.length * 12 : 100);
  const avgConfidence = opportunities.length > 0
    ? Math.round(opportunities.reduce((acc, o) => acc + o.confidence, 0) / opportunities.length)
    : 88;
  const estimatedGmvLift = (totalCleaned * 0.012).toFixed(1);

  const topStats = [
    {
      label: "Total Opportunities",
      value: String(opportunities.length),
      sub: `Identified from ${totalCleaned} reviews`,
      subColor: "var(--positive)",
      icon: <TrendingUp size={18} />,
    },
    {
      label: "Expected GMV Lift",
      value: `$${estimatedGmvLift}M`,
      sub: "↑ Efficiency boost",
      subColor: "var(--positive)",
      icon: <DollarSign size={18} />,
      hasProgress: false,
    },
    {
      label: "Confidence Score",
      value: `${avgConfidence}%`,
      sub: null,
      icon: <Target size={18} />,
      hasProgress: true,
    },
    {
      label: "Active Experiments",
      value: String(Math.min(opportunities.length, 6)),
      sub: `${Math.max(0, opportunities.length - 2)} in backlog`,
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
                Data-driven expansion vectors identified from {totalCleaned} customer interactions in this run.
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
          cleanedCount={totalCleaned}
          onGeneratePM={handleGeneratePMReport}
        />
      </div>

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={(r) => {
            updateAnalysisResult(r);
            setShowUpload(false);
          }}
        />
      )}
    </div>
  );
}
