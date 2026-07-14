"use client";

import React from "react";
import { Search, Bell, RefreshCw, Upload, Sparkles } from "lucide-react";

interface TopBarProps {
  searchPlaceholder?: string;
  onUpload: () => void;
  onGenerateReport: () => void;
  isGenerating?: boolean;
}

export default function TopBar({
  searchPlaceholder = "Search insights, JTBDs, or behaviors...",
  onUpload,
  onGenerateReport,
  isGenerating = false,
}: TopBarProps) {
  return (
    <header
      style={{
        height: "var(--topbar-height)",
        background: "var(--bg-sidebar)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Search */}
      <div style={{ flex: 1, position: "relative", maxWidth: 420 }}>
        <Search
          size={15}
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-muted)",
          }}
        />
        <input
          className="input"
          style={{ paddingLeft: 36 }}
          placeholder={searchPlaceholder}
        />
      </div>

      <div style={{ flex: 1 }} />

      {/* Action buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          className="btn btn-primary"
          onClick={onGenerateReport}
          disabled={isGenerating}
          style={{ opacity: isGenerating ? 0.7 : 1 }}
        >
          <Sparkles size={15} />
          {isGenerating ? "Generating..." : "Generate AI Report"}
        </button>

        <button className="btn btn-secondary" onClick={onUpload}>
          <Upload size={15} />
          Upload Reviews
        </button>

        <div
          style={{
            width: 1,
            height: 24,
            background: "var(--border)",
            margin: "0 4px",
          }}
        />

        {/* Refresh */}
        <button
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--text-secondary)",
            transition: "all 0.15s ease",
          }}
          title="Refresh"
          onClick={() => window.location.reload()}
        >
          <RefreshCw size={15} />
        </button>

        {/* Bell */}
        <button
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--text-secondary)",
            position: "relative",
            transition: "all 0.15s ease",
          }}
          title="Notifications"
        >
          <Bell size={15} />
          <span
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "var(--negative)",
              border: "1.5px solid white",
            }}
          />
        </button>

        {/* Avatar */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #F9CB28 0%, #E6B800 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 700,
            color: "#1C1C1C",
            cursor: "pointer",
            border: "2px solid var(--border)",
          }}
        >
          PM
        </div>
      </div>
    </header>
  );
}
