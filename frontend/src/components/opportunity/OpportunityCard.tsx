"use client";

import React from "react";
import { Sparkles, TrendingUp, ExternalLink } from "lucide-react";
import type { Theme, PainPoint } from "@/types";

type OpportunityItem = {
  type: "theme";
  data: Theme;
  impact: "HIGH IMPACT" | "MED IMPACT" | "LOW IMPACT";
  growth: string;
  confidence: number;
  priority: string;
  description: string;
};

interface OpportunityCardProps {
  item: OpportunityItem;
  isFeatured?: boolean;
}

const IMPACT_COLORS: Record<string, { bg: string; text: string }> = {
  "HIGH IMPACT": { bg: "#ECFDF5", text: "#059669" },
  "MED IMPACT": { bg: "#FEF3C7", text: "#B45309" },
  "LOW IMPACT": { bg: "#F3F4F6", text: "#6B7280" },
};

export function buildOpportunities(themes: Theme[], painPoints: PainPoint[]): OpportunityItem[] {
  if (!themes || themes.length === 0) return [];

  return themes.map((t, i) => {
    const size = t.size || t.supporting_reviews?.length || 5;
    const growth = `+${Math.min(32, Math.max(8, parseFloat((size * 2.2).toFixed(1))))}%`;
    const confidence = Math.min(96, Math.max(68, 92 - i * 4));
    const priority = i === 0 ? "P0" : i < 3 ? "P1" : "P2";
    const impact: "HIGH IMPACT" | "MED IMPACT" | "LOW IMPACT" =
      size >= 10 ? "HIGH IMPACT" : size >= 5 ? "MED IMPACT" : "LOW IMPACT";

    return {
      type: "theme" as const,
      data: t,
      impact,
      growth,
      confidence,
      priority,
      description: t.description,
    };
  });
}

export default function OpportunityCard({
  item,
  isFeatured = false,
}: OpportunityCardProps) {
  const impactColors = IMPACT_COLORS[item.impact];

  if (isFeatured) {
    return (
      <div
        className="card animate-fadeIn"
        style={{ padding: 24, flex: "1 1 0" }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "var(--gold-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              border: "1px solid rgba(249, 203, 40, 0.3)",
            }}
          >
            <Sparkles size={22} color="var(--gold-dark)" />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 6,
              }}
            >
              <h3
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  lineHeight: 1.2,
                }}
              >
                {item.data.title.charAt(0).toUpperCase() + item.data.title.slice(1)}
              </h3>
              <span
                className="badge"
                style={{
                  background: impactColors.bg,
                  color: impactColors.text,
                  fontSize: 10,
                  padding: "2px 8px",
                }}
              >
                {item.impact}
              </span>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
              {item.description}
            </p>
          </div>
        </div>

        <div
          style={{
            height: 1,
            background: "var(--border)",
            marginBottom: 16,
          }}
        />

        {/* Metrics grid */}
        <div style={{ display: "flex", gap: 24, marginBottom: 20 }}>
          {[
            { label: "EXPECTED GROWTH", value: item.growth, valueStyle: { color: "var(--positive)", fontWeight: 700, fontSize: 20 } },
            { label: "CONFIDENCE", value: `${item.confidence}%`, hasBar: true },
            { label: "USER IMPACT", value: "Exceptional" },
            { label: "PRIORITY", value: item.priority },
          ].map((m) => (
            <div key={m.label} style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.07em",
                  color: "var(--text-muted)",
                  marginBottom: 4,
                }}
              >
                {m.label}
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  ...(m.valueStyle || {}),
                }}
              >
                {m.value}
              </div>
              {m.hasBar && (
                <div
                  style={{
                    marginTop: 4,
                    height: 4,
                    borderRadius: 2,
                    background: "var(--border)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${item.confidence}%`,
                      height: "100%",
                      background: "var(--positive)",
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* AI Insight */}
        {item.data.supporting_reviews?.[0] && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              background: "var(--gold-muted)",
              border: "1px solid rgba(249, 203, 40, 0.25)",
              borderRadius: 8,
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <Sparkles size={14} color="var(--gold-dark)" style={{ marginTop: 2, flexShrink: 0 }} />
              <span style={{ fontSize: 12.5, color: "var(--text-secondary)", fontStyle: "italic" }}>
                AI Insight: &ldquo;{item.data.supporting_reviews[0].quote.slice(0, 100)}&rdquo;
              </span>
            </div>
            <button
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--gold-dark)",
                background: "none",
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              View Proof Points
              <ExternalLink size={11} />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Compact card
  return (
    <div
      className="card animate-fadeIn"
      style={{ padding: 20 }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: "var(--bg-main)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TrendingUp size={18} color="var(--text-secondary)" />
        </div>
        <span
          className="badge"
          style={{
            background: impactColors.bg,
            color: impactColors.text,
            fontSize: 10,
          }}
        >
          {item.impact}
        </span>
      </div>

      <h4
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: 4,
          lineHeight: 1.3,
        }}
      >
        {item.data.title.charAt(0).toUpperCase() + item.data.title.slice(1)}
      </h4>
      <p
        style={{
          fontSize: 12.5,
          color: "var(--text-secondary)",
          lineHeight: 1.55,
          marginBottom: 16,
        }}
      >
        {item.description}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { label: "Growth %", value: item.growth },
          { label: "Confidence", value: `${item.confidence}%` },
          { label: "Priority", value: item.priority },
        ].map((row) => (
          <div
            key={row.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderBottom: "1px dashed var(--border)",
              paddingBottom: 8,
              fontSize: 13,
            }}
          >
            <span style={{ color: "var(--text-secondary)" }}>{row.label}</span>
            <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{row.value}</span>
          </div>
        ))}
      </div>

      <button
        className="btn btn-secondary"
        style={{
          width: "100%",
          justifyContent: "center",
          marginTop: 16,
          fontSize: 13,
        }}
      >
        Simulate Impact
      </button>
    </div>
  );
}
