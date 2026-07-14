"use client";

import React from "react";
import { Calendar, Download, Sparkles, Cpu } from "lucide-react";

interface BottomActionBarProps {
  opportunityCount: number;
  onSchedule?: () => void;
  onExport?: () => void;
  onGeneratePM?: () => void;
}

export default function BottomActionBar({
  opportunityCount,
  onSchedule,
  onExport,
  onGeneratePM,
}: BottomActionBarProps) {
  return (
    <div
      style={{
        position: "sticky",
        bottom: 0,
        marginTop: 24,
        padding: "14px 24px",
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        zIndex: 30,
        borderRadius: "0 0 0 0",
      }}
    >
      {/* Status pill */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 14px",
          background: "#F0FDF4",
          border: "1px solid rgba(16, 185, 129, 0.2)",
          borderRadius: 999,
          fontSize: 12,
          color: "#059669",
          fontWeight: 500,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#10B981",
            animation: "pulse-gold 2s infinite",
          }}
        />
        <Cpu size={12} />
        AI engine active: Listening to 14.2k nodes
      </div>

      {/* Opportunity count */}
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text-secondary)",
          flexShrink: 0,
        }}
      >
        {opportunityCount} Opportunities selected
      </div>

      <div style={{ flex: 1 }} />

      {/* Actions */}
      <button className="btn btn-secondary" onClick={onSchedule}>
        <Calendar size={14} />
        Schedule Weekly Report
      </button>

      <button className="btn btn-secondary" onClick={onExport}>
        <Download size={14} />
        Export PDF
      </button>

      <button className="btn btn-primary" onClick={onGeneratePM}>
        <Sparkles size={14} />
        Generate PM Report
      </button>
    </div>
  );
}
