"use client";

import React from "react";
import { TrendingUp, Database, Sparkles, Lightbulb, Package, Globe } from "lucide-react";
import type { AnalysisResult } from "@/types";

interface StatCardsProps {
  result: AnalysisResult | null;
}

export default function StatCards({ result }: StatCardsProps) {
  const totalReviews = result
    ? (result.source_counts?.play_store || 0) +
      (result.source_counts?.app_store || 0) +
      (result.source_counts?.csv_upload || 0)
    : 0;

  const activeSources = result
    ? Object.values(result.source_counts || {}).filter((v) => v > 0).length
    : 0;

  const stats = [
    {
      label: "Reviews Analyzed",
      value: result ? totalReviews.toLocaleString() : "—",
      sub: result ? "+4.2% ↑" : "No data yet",
      icon: <TrendingUp size={16} />,
      color: "#F9CB28",
      hasBars: true,
    },
    {
      label: "Data Sources",
      value: result ? String(activeSources) : "—",
      sub: null,
      icon: <Database size={16} />,
      color: "#6366F1",
      hasAvatars: result
        ? [
            result.source_counts?.play_store > 0 ? "G" : null,
            result.source_counts?.app_store > 0 ? "A" : null,
            result.source_counts?.csv_upload > 0 ? "R" : null,
          ].filter(Boolean)
        : [],
    },
    {
      label: "AI Themes Identified",
      value: result ? String(result.themes?.length || 0) : "—",
      sub: result ? "✦ New" : null,
      icon: <Sparkles size={16} />,
      color: "#10B981",
      isNew: !!result,
    },
    {
      label: "Actionable Insights",
      value: result
        ? String((result.jtbd?.length || 0) + (result.pain_points?.length || 0))
        : "—",
      sub: null,
      icon: <Lightbulb size={16} />,
      color: "#F59E0B",
      hasProgress: true,
    },
    {
      label: "Product Opps",
      value: result ? String(result.behaviors?.length || 0) : "—",
      sub: result ? "+2 since last report" : null,
      icon: <Package size={16} />,
      color: "#8B5CF6",
    },
    {
      label: "Cross-category",
      value: result ? String(Math.min(result.themes?.length || 0, 11)) : "—",
      sub: result ? "Potential: $1.2M GMV" : null,
      icon: <Globe size={16} />,
      color: "#EC4899",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(6, 1fr)",
        gap: 12,
        marginBottom: 20,
      }}
    >
      {stats.map((stat, i) => (
        <div
          key={i}
          className="card animate-fadeIn"
          style={{
            padding: "16px",
            animationDelay: `${i * 0.06}s`,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "var(--text-muted)",
              marginBottom: 8,
              lineHeight: 1.3,
            }}
          >
            {stat.label}
          </div>

          <div
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: "var(--text-primary)",
              lineHeight: 1,
              marginBottom: 8,
            }}
          >
            {stat.value}
            {stat.hasBars && result && (
              <span style={{ fontSize: 11, fontWeight: 500, color: "var(--positive)", marginLeft: 4 }}>
                {stat.sub}
              </span>
            )}
          </div>

          {/* Mini bar chart for Reviews */}
          {stat.hasBars && result && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 24 }}>
              {[40, 55, 45, 65, 50, 70].map((h, j) => (
                <div
                  key={j}
                  style={{
                    flex: 1,
                    height: `${h}%`,
                    background: j === 5 ? stat.color : `${stat.color}60`,
                    borderRadius: 3,
                  }}
                />
              ))}
            </div>
          )}

          {/* Source avatars */}
          {stat.hasAvatars && Array.isArray(stat.hasAvatars) && stat.hasAvatars.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {(stat.hasAvatars as string[]).map((letter, j) => (
                <div
                  key={j}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: ["#34A853", "#007AFF", "#FF4500"][j],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "white",
                    border: "2px solid white",
                    marginLeft: j > 0 ? -4 : 0,
                  }}
                >
                  {letter}
                </div>
              ))}
            </div>
          )}

          {/* New badge */}
          {stat.isNew && result && (
            <span className="badge badge-gold" style={{ fontSize: 10 }}>
              ✦ {result.themes?.length || 0} New
            </span>
          )}

          {/* Progress bar for insights */}
          {stat.hasProgress && result && (
            <div
              style={{
                height: 4,
                background: "var(--border)",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: "70%",
                  background: stat.color,
                  borderRadius: 2,
                }}
              />
            </div>
          )}

          {/* Sub text (for non-bars) */}
          {!stat.hasBars && !stat.hasAvatars && !stat.isNew && !stat.hasProgress && stat.sub && (
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{stat.sub}</div>
          )}

          {/* Sub text for remaining cards */}
          {(stat.label === "Product Opps" || stat.label === "Cross-category") && stat.sub && (
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
              {stat.sub}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
