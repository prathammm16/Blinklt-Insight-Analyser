"use client";

import React from "react";
import type { AnalysisResult } from "@/types";

interface SentimentChartProps {
  result: AnalysisResult | null;
}

export default function SentimentChart({ result }: SentimentChartProps) {
  const sentiments = result?.sentiments;
  const total = sentiments
    ? sentiments.positive + sentiments.neutral + sentiments.negative
    : 100;

  const pos = sentiments ? Math.round((sentiments.positive / total) * 100) : 62;
  const neu = sentiments ? Math.round((sentiments.neutral / total) * 100) : 28;
  const neg = sentiments ? 100 - pos - neu : 10;

  const nps = pos - neg;

  const weeklyStats = [
    { label: "Last Week", value: "71.0" },
    { label: "Avg. 30D", value: "73.2" },
    { label: "Peak", value: "84.8" },
  ];

  return (
    <div className="card" style={{ padding: 20, height: "100%" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
          Sentiment Analysis
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text-muted)" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--positive)", display: "inline-block" }} />
            Positive
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text-muted)" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#9CA3AF", display: "inline-block" }} />
            Neutral
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text-muted)" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--negative)", display: "inline-block" }} />
            Negative
          </span>
        </div>
      </div>

      {/* NPS Score */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>
          Global NPS Score
        </span>
        <span style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>
          {nps.toFixed(1)}
        </span>
      </div>

      {/* Stacked bar */}
      <div
        style={{
          display: "flex",
          borderRadius: 8,
          overflow: "hidden",
          height: 36,
          marginBottom: 8,
        }}
      >
        <div
          style={{
            width: `${pos}%`,
            background: "var(--positive)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
            color: "white",
          }}
        >
          {pos}%
        </div>
        <div
          style={{
            width: `${neu}%`,
            background: "#9CA3AF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
            color: "white",
          }}
        >
          {neu}%
        </div>
        <div
          style={{
            width: `${neg}%`,
            background: "var(--negative)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
            color: "white",
          }}
        >
          {neg}%
        </div>
      </div>

      {/* Sentiment counts */}
      {result && (
        <div style={{ display: "flex", gap: 12, marginBottom: 16, fontSize: 12 }}>
          <span style={{ color: "var(--positive)" }}>
            ↑ {sentiments?.positive.toLocaleString() ?? 0} positive
          </span>
          <span style={{ color: "var(--text-muted)" }}>
            {sentiments?.neutral.toLocaleString() ?? 0} neutral
          </span>
          <span style={{ color: "var(--negative)" }}>
            ↓ {sentiments?.negative.toLocaleString() ?? 0} negative
          </span>
        </div>
      )}

      {/* Weekly stats */}
      <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
        {weeklyStats.map((stat) => (
          <div
            key={stat.label}
            style={{
              flex: 1,
              padding: "10px 12px",
              background: "var(--bg-main)",
              borderRadius: 8,
              border: "1px solid var(--border)",
            }}
          >
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 4 }}>
              {stat.label}
            </div>
            <div
              style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)" }}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
