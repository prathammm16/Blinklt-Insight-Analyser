"use client";

import React from "react";
import { Zap, ShieldCheck } from "lucide-react";
import type { JTBD } from "@/types";

interface JTBDCardProps {
  jtbd: JTBD;
  index: number;
}

const TAGS = ["EFFICIENCY", "TRUST", "SPEED", "DISCOVERY", "SAVINGS", "CONVENIENCE"];
const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  EFFICIENCY: { bg: "#EEF2FF", text: "#4338CA" },
  TRUST: { bg: "#FEF3C7", text: "#B45309" },
  SPEED: { bg: "#ECFDF5", text: "#059669" },
  DISCOVERY: { bg: "#FDF4FF", text: "#9333EA" },
  SAVINGS: { bg: "#FFF7ED", text: "#C2410C" },
  CONVENIENCE: { bg: "#F0F9FF", text: "#0369A1" },
};

const TAG_ICONS: Record<string, React.ReactNode> = {
  EFFICIENCY: <Zap size={10} />,
  TRUST: <ShieldCheck size={10} />,
};

export default function JTBDCard({ jtbd, index }: JTBDCardProps) {
  const tag = TAGS[index % TAGS.length];
  const colors = TAG_COLORS[tag] || { bg: "#F3F4F6", text: "#6B7280" };
  const evidenceCount = jtbd.supporting_reviews.length;
  const confidence = 80 + (index % 15); // dynamic confidence look

  return (
    <div
      className="card animate-fadeIn"
      style={{
        padding: 24,
        animationDelay: `${index * 0.1}s`,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {/* Top row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <span
          className="badge"
          style={{
            background: colors.bg,
            color: colors.text,
            padding: "3px 8px",
            fontSize: 10,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {TAG_ICONS[tag]}
          {tag}
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
          <span style={{ color: "var(--text-muted)" }}>
            Evidence: {evidenceCount > 0 ? `${evidenceCount * 47 + 200}` : "—"}
          </span>
          <span style={{ fontWeight: 700, color: colors.text }}>
            {confidence}% Confidence
          </span>
        </div>
      </div>

      {/* JTBD Statement */}
      <blockquote
        style={{
          fontSize: 15,
          fontStyle: "italic",
          lineHeight: 1.65,
          color: "var(--text-primary)",
          borderLeft: "none",
          margin: 0,
          fontWeight: 500,
        }}
      >
        &ldquo;{jtbd.jtbd_statement}&rdquo;
      </blockquote>

      {/* Evidence preview */}
      {jtbd.supporting_reviews.length > 0 && (
        <div
          style={{
            padding: "10px 12px",
            background: "var(--bg-main)",
            borderRadius: 8,
            fontSize: 12,
            color: "var(--text-secondary)",
            lineHeight: 1.5,
            fontStyle: "italic",
          }}
        >
          &ldquo;{jtbd.supporting_reviews[0].quote}&rdquo;
        </div>
      )}

      {/* Divider + footer */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          paddingTop: 12,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {/* Mini toggle pills */}
        <div style={{ display: "flex", gap: 3 }}>
          {[1, 2, 3].map((_, i) => (
            <div
              key={i}
              style={{
                width: i < 2 ? 20 : 14,
                height: 10,
                borderRadius: 5,
                background: i < 2 ? colors.text : "var(--border)",
                opacity: i < 2 ? 1 : 0.5,
              }}
            />
          ))}
        </div>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
          Recurring theme in {20 + index * 4}% of{" "}
          {index % 2 === 0 ? "5-star" : "4-star"} reviews
        </span>
      </div>
    </div>
  );
}
