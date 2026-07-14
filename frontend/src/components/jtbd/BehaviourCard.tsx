"use client";

import React from "react";
import {
  RefreshCw,
  Target,
  ShoppingCart,
  Tag,
  TrendingUp,
  Clock,
  Percent,
} from "lucide-react";
import type { Behavior } from "@/types";

interface BehaviourCardProps {
  behavior: Behavior;
  index: number;
}

const ICONS = [
  <RefreshCw key="r" size={22} />,
  <Target key="t" size={22} />,
  <ShoppingCart key="s" size={22} />,
  <Tag key="tg" size={22} />,
];

const METRICS = [
  { label: "HIGH FREQUENCY", icon: <TrendingUp size={14} /> },
  { label: "URGENT INTENT", icon: <Target size={14} /> },
  { label: "DWELL TIME: 45m", icon: <Clock size={14} /> },
  { label: "ELASTICITY: HIGH", icon: <Percent size={14} /> },
];

export default function BehaviourCard({ behavior, index }: BehaviourCardProps) {
  const metric = METRICS[index % METRICS.length];

  return (
    <div
      className="card animate-fadeIn"
      style={{
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        animationDelay: `${index * 0.08}s`,
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          background: "var(--bg-main)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-secondary)",
        }}
      >
        {ICONS[index % ICONS.length]}
      </div>

      {/* Title */}
      <div>
        <h4
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 1.3,
            marginBottom: 6,
          }}
        >
          {behavior.behavior_type}
        </h4>
        <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.55 }}>
          {behavior.description}
        </p>
      </div>

      {/* Evidence quote */}
      {behavior.supporting_reviews.length > 0 && (
        <div
          style={{
            fontSize: 11.5,
            color: "var(--text-muted)",
            fontStyle: "italic",
            borderLeft: "2px solid var(--gold)",
            paddingLeft: 8,
            lineHeight: 1.5,
          }}
        >
          &ldquo;{behavior.supporting_reviews[0].quote.slice(0, 80)}
          {behavior.supporting_reviews[0].quote.length > 80 ? "…" : ""}&rdquo;
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "auto",
          borderTop: "1px solid var(--border)",
          paddingTop: 10,
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "var(--text-muted)",
            letterSpacing: "0.06em",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {metric.icon}
          {metric.label}
        </span>
        <div style={{ color: "var(--positive)" }}>
          <TrendingUp size={16} />
        </div>
      </div>
    </div>
  );
}
