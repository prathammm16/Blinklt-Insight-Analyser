"use client";

import React from "react";
import { ArrowRight, MessageSquare, Sparkles } from "lucide-react";
import type { AnalysisResult } from "@/types";

interface ExecutiveSummaryProps {
  result: AnalysisResult | null;
  onViewReport?: () => void;
}

export default function ExecutiveSummary({ result, onViewReport }: ExecutiveSummaryProps) {
  const topTheme = result?.themes?.[0];
  const topJTBD = result?.jtbd?.[0];
  const sentiments = result?.sentiments;

  const totalSentiment = sentiments
    ? sentiments.positive + sentiments.neutral + sentiments.negative
    : 0;

  const positivePercent = totalSentiment
    ? Math.round((sentiments!.positive / totalSentiment) * 100)
    : 62;
  const negativePercent = totalSentiment
    ? Math.round((sentiments!.negative / totalSentiment) * 100)
    : 10;

  const headline = topTheme
    ? `${topTheme.title.charAt(0).toUpperCase() + topTheme.title.slice(1)} is the top theme across ${topTheme.size ?? topTheme.supporting_reviews.length} reviews.`
    : "Customers primarily use Blinkit for mission-based grocery shopping, prioritizing delivery speed and inventory reliability over price sensitivity.";

  const subtext = topJTBD
    ? topJTBD.jtbd_statement
    : "Our AI models identified a significant shift in weekend shopping behavior. Users are increasingly grouping large basket orders between 8 AM and 11 AM, resulting in a 14% drop in NPS due to specific out-of-stock items in the 'Dairy & Bread' category.";

  const timestamp = result?.timestamp
    ? new Date(result.timestamp).toLocaleString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        day: "numeric",
        month: "short",
      })
    : "2 hours ago";

  return (
    <div
      className="animate-fadeIn"
      style={{
        background: "var(--bg-dark)",
        borderRadius: 16,
        padding: 36,
        marginBottom: 24,
        position: "relative",
        overflow: "hidden",
        animationDelay: "0.2s",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          top: -60,
          right: -60,
          width: 240,
          height: 240,
          background: "radial-gradient(circle, rgba(249,203,40,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 20,
        }}
      >
        <span
          className="badge badge-gold"
          style={{ fontSize: 10, padding: "3px 10px" }}
        >
          <Sparkles size={10} />
          EXECUTIVE SUMMARY
        </span>
        <span style={{ fontSize: 12, color: "#6B7280" }} suppressHydrationWarning>
          Updated {timestamp}
        </span>
      </div>

      {/* Headline */}
      <h2
        style={{
          fontSize: 26,
          fontWeight: 800,
          color: "white",
          lineHeight: 1.3,
          maxWidth: 780,
          marginBottom: 14,
        }}
      >
        {headline}
      </h2>

      {/* Subtext */}
      <p
        style={{
          fontSize: 14,
          color: "#9CA3AF",
          lineHeight: 1.7,
          maxWidth: 700,
          marginBottom: 28,
        }}
      >
        {subtext}
      </p>

      {/* NPS mini-bar */}
      {result && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "#9CA3AF" }}>NPS Signal</span>
            <span style={{ fontSize: 12, color: "var(--gold)", fontWeight: 600 }}>
              {positivePercent - negativePercent > 0
                ? `+${positivePercent - negativePercent}`
                : positivePercent - negativePercent}
            </span>
          </div>
          <div style={{ display: "flex", height: 6, borderRadius: 4, overflow: "hidden", maxWidth: 400 }}>
            <div style={{ width: `${positivePercent}%`, background: "var(--positive)" }} />
            <div style={{ width: `${100 - positivePercent - negativePercent}%`, background: "#374151" }} />
            <div style={{ width: `${negativePercent}%`, background: "var(--negative)" }} />
          </div>
        </div>
      )}

      {/* CTA Buttons */}
      <div style={{ display: "flex", gap: 12 }}>
        <button
          className="btn"
          onClick={onViewReport}
          style={{
            background: "transparent",
            color: "white",
            border: "1.5px solid rgba(255,255,255,0.25)",
            borderRadius: 10,
            padding: "10px 20px",
            fontSize: 14,
          }}
        >
          View Full Report
          <ArrowRight size={15} />
        </button>
        <button
          className="btn"
          style={{
            background: "rgba(255,255,255,0.1)",
            color: "white",
            border: "1.5px solid rgba(255,255,255,0.15)",
            borderRadius: 10,
            padding: "10px 20px",
            fontSize: 14,
          }}
        >
          <MessageSquare size={15} />
          Ask AI Assistant
        </button>
      </div>
    </div>
  );
}
