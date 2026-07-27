"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import UploadModal from "@/components/shared/UploadModal";
import { useAnalysis } from "@/context/AnalysisContext";
import {
  GitBranch,
  AlertOctagon,
  CheckCircle,
  HelpCircle,
  Wrench,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";

export default function RootCausePage() {
  const { result, updateAnalysisResult } = useAnalysis();
  const [showUpload, setShowUpload] = useState(false);
  const painPoints = result?.pain_points ?? [];

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
          searchPlaceholder="Search pain points or root causes..."
          onUpload={() => setShowUpload(true)}
          onGenerateReport={() => {}}
        />

        <main style={{ flex: 1, padding: 24 }}>
          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <GitBranch size={22} style={{ color: "#EF4444" }} />
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>
                Root Cause Analysis (5-Whys)
              </h1>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              Deconstruct surface-level complaints into underlying operational, tech, and policy bottlenecks.
            </p>
          </div>

          {/* Pain Point Decomposition Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {painPoints.map((pt, idx) => {
              const isRider = pt.issue.toLowerCase().includes("delivery") || pt.issue.toLowerCase().includes("rude");
              const isQuality = pt.issue.toLowerCase().includes("quality");
              const isSupport = pt.issue.toLowerCase().includes("support") || pt.issue.toLowerCase().includes("refund");

              const severityBadge = isSupport || isQuality ? "badge-red" : "badge-amber";
              const severityText = isSupport || isQuality ? "P0 - Critical" : "P1 - High Priority";

              return (
                <div key={idx} className="card" style={{ padding: 24 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 14,
                      flexWrap: "wrap",
                      gap: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span className={`badge ${severityBadge}`} style={{ fontSize: 11 }}>
                        <AlertOctagon size={12} /> {severityText}
                      </span>
                      <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)" }}>
                        {pt.issue}
                      </h2>
                    </div>
                    <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace" }}>
                      Issue #{idx + 1}
                    </span>
                  </div>

                  {/* 5-Whys Path Diagram / Chain */}
                  <div
                    style={{
                      padding: 16,
                      borderRadius: 10,
                      background: "var(--bg-main)",
                      border: "1px solid var(--border)",
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        marginBottom: 12,
                        textTransform: "uppercase",
                      }}
                    >
                      5-Whys Causal Chain:
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            background: "#FEE2E2",
                            color: "#991B1B",
                            fontSize: 11,
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          1
                        </span>
                        <div style={{ fontSize: 13, color: "var(--text-primary)" }}>
                          <strong>Symptom:</strong> Customer reports: &ldquo;{pt.issue}&rdquo;
                        </div>
                      </div>

                      <div style={{ paddingLeft: 11, borderLeft: "2px solid var(--border)", marginLeft: 11 }}>
                        <ArrowRight size={14} style={{ color: "var(--text-muted)", margin: "4px 0" }} />
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            background: "var(--gold)",
                            color: "#1C1C1C",
                            fontSize: 11,
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          2
                        </span>
                        <div style={{ fontSize: 13, color: "var(--text-primary)" }}>
                          <strong>Root Cause:</strong> {pt.root_cause}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Supporting Evidence */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase" }}>
                      Customer Supporting Evidence:
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {pt.supporting_reviews.map((rev) => (
                        <div
                          key={rev.review_id}
                          style={{
                            padding: "8px 12px",
                            borderRadius: 6,
                            background: "var(--bg-main)",
                            border: "1px solid var(--border)",
                            fontSize: 12,
                            fontStyle: "italic",
                            color: "var(--text-secondary)",
                          }}
                        >
                          &ldquo;{rev.quote}&rdquo;
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Engineering Fix */}
                  <div
                    style={{
                      padding: 12,
                      borderRadius: 8,
                      background: "rgba(16, 185, 129, 0.08)",
                      border: "1px solid rgba(16, 185, 129, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <Wrench size={18} style={{ color: "#10B981", flexShrink: 0 }} />
                    <div style={{ fontSize: 12, color: "var(--text-primary)" }}>
                      <strong>Suggested Remediation:</strong> Update dark store SOPs & introduce automated customer service bypass when delivery status disputes occur.
                    </div>
                  </div>
                </div>
              );
            })}
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
