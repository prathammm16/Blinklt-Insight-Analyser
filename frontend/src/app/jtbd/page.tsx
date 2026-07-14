"use client";

import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import UploadModal from "@/components/shared/UploadModal";
import JTBDCard from "@/components/jtbd/JTBDCard";
import BehaviourCard from "@/components/jtbd/BehaviourCard";
import { getHistory } from "@/lib/api";
import { SEED_ANALYSIS } from "@/lib/seedData";
import type { AnalysisResult, RunHistoryEntry } from "@/types";
import { Zap, ArrowRight, Sparkles } from "lucide-react";

export default function JTBDPage() {
  const [showUpload, setShowUpload] = useState(false);
  const [result, setResult] = useState<AnalysisResult>(SEED_ANALYSIS);
  const [history, setHistory] = useState<RunHistoryEntry[]>([]);

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

  const jtbds = result.jtbd ?? [];
  const behaviors = result.behaviors ?? [];

  const totalReviews =
    (result.source_counts?.play_store || 0) +
    (result.source_counts?.app_store || 0) +
    (result.source_counts?.csv_upload || 0);

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
          searchPlaceholder="Search insights, JTBDs, or behaviors..."
          onUpload={() => setShowUpload(true)}
          onGenerateReport={() => {}}
        />

        <main style={{ flex: 1, padding: 24 }}>
          {/* Page header */}
          <div
            className="animate-fadeIn"
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: 28,
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  marginBottom: 6,
                }}
              >
                Jobs To Be Done (JTBD)
              </h1>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                Analyzing {totalReviews.toLocaleString()} user sentiments to decode underlying
                motivations and friction points in the grocery delivery journey.
              </p>
            </div>

            {/* AI Confidence badge */}
            <div
              style={{
                background: "var(--gold)",
                borderRadius: 14,
                padding: "16px 24px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexShrink: 0,
              }}
            >
              <Zap size={24} fill="#1C1C1C" color="#1C1C1C" />
              <div>
                <div style={{ fontSize: 11, fontWeight: 500, color: "#5a4a00" }}>
                  AI Insight Confidence
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#1C1C1C" }}>
                  94.8% Accurate
                </div>
              </div>
            </div>
          </div>

          {/* JTBD Cards grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginBottom: 36,
            }}
          >
            {jtbds.map((jtbd, i) => (
              <JTBDCard key={i} jtbd={jtbd} index={i} />
            ))}
          </div>

          {/* Shopping Behaviour Patterns */}
          <section style={{ marginBottom: 36 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    marginBottom: 4,
                  }}
                >
                  Shopping Behaviour Patterns
                </h2>
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  High-frequency cohorts and their interaction triggers.
                </p>
              </div>
              <button
                className="btn btn-secondary"
                style={{ fontSize: 13 }}
              >
                View Behavioral Report
                <ArrowRight size={13} />
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 12,
              }}
            >
              {behaviors.slice(0, 4).map((b, i) => (
                <BehaviourCard key={i} behavior={b} index={i} />
              ))}
            </div>
          </section>

          {/* Root Cause Analysis teaser */}
          <section>
            <div
              style={{
                textAlign: "center",
                padding: "40px 24px",
                borderTop: "1px solid var(--border)",
              }}
            >
              <h2
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: 6,
                }}
              >
                Root Cause Analysis
              </h2>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
                Tracing the friction back to its origin. Select a node to see detailed impact metrics.
              </p>

              {/* Pain points as cards */}
              {result.pain_points && result.pain_points.length > 0 ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: 12,
                    textAlign: "left",
                  }}
                >
                  {result.pain_points.map((pp, i) => (
                    <div
                      key={i}
                      className="card animate-fadeIn"
                      style={{ padding: 18, animationDelay: `${i * 0.08}s` }}
                    >
                      <div style={{ marginBottom: 8 }}>
                        <span className="badge badge-red" style={{ fontSize: 10 }}>
                          PAIN POINT
                        </span>
                      </div>
                      <h4
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "var(--text-primary)",
                          marginBottom: 6,
                        }}
                      >
                        {pp.issue}
                      </h4>
                      <p
                        style={{
                          fontSize: 12.5,
                          color: "var(--text-secondary)",
                          lineHeight: 1.5,
                        }}
                      >
                        <strong>Root cause:</strong> {pp.root_cause}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 20px",
                    background: "var(--gold-muted)",
                    border: "1px solid rgba(249, 203, 40, 0.3)",
                    borderRadius: 8,
                    fontSize: 13,
                    color: "var(--text-secondary)",
                  }}
                >
                  <Sparkles size={14} color="var(--gold-dark)" />
                  Upload reviews to unlock Root Cause Analysis
                </div>
              )}
            </div>
          </section>
        </main>
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
