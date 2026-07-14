"use client";

import React from "react";
import { Loader2, Sparkles } from "lucide-react";

interface AnalysisLoaderProps {
  message?: string;
}

export default function AnalysisLoader({
  message = "Running AI analysis on your reviews...",
}: AnalysisLoaderProps) {
  const steps = [
    "Collecting reviews from source",
    "Preprocessing & deduplication",
    "Classifying sentiments with Gemini",
    "Synthesizing themes & JTBD",
    "Validating evidence quotes",
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 60,
        gap: 24,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          background: "var(--gold-muted)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "pulse-gold 2s infinite",
        }}
      >
        <Sparkles size={28} color="var(--gold-dark)" />
      </div>

      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 6,
          }}
        >
          {message}
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
          Gemini AI is synthesizing insights — this typically takes 30–60 seconds
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          width: "100%",
          maxWidth: 360,
        }}
      >
        {steps.map((step, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 16px",
              background: "white",
              borderRadius: 8,
              border: "1px solid var(--border)",
              fontSize: 13,
              color: "var(--text-secondary)",
              animation: `fadeIn 0.4s ease-out ${i * 0.15}s both`,
            }}
          >
            <Loader2
              size={14}
              className="animate-spin"
              style={{ color: "var(--gold-dark)", flexShrink: 0 }}
            />
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}
