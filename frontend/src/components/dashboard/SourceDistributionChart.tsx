"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { AnalysisResult } from "@/types";

interface SourceDistributionChartProps {
  result: AnalysisResult | null;
}

const COLORS = ["#34A853", "#007AFF", "#FF6B35"];
const LABELS = ["Google Play", "Apple Store", "CSV / Other"];

export default function SourceDistributionChart({ result }: SourceDistributionChartProps) {
  const sourceCounts = result?.source_counts;

  const rawData = sourceCounts
    ? [
        { name: "Google Play", value: sourceCounts.play_store, pct: 0 },
        { name: "Apple Store", value: sourceCounts.app_store, pct: 0 },
        { name: "CSV / Other", value: sourceCounts.csv_upload, pct: 0 },
      ]
    : [
        { name: "Google Play", value: 45, pct: 45 },
        { name: "Apple Store", value: 25, pct: 25 },
        { name: "CSV / Other", value: 30, pct: 30 },
      ];

  const total = rawData.reduce((s, d) => s + d.value, 0);
  const data = rawData.map((d) => ({ ...d, pct: total ? Math.round((d.value / total) * 100) : 0 }));

  return (
    <div className="card" style={{ padding: 20, height: "100%" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
          Source Distribution
        </h3>
        <button
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
            fontSize: 18,
            lineHeight: 1,
          }}
        >
          ···
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <ResponsiveContainer width="50%" height={180}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  opacity={data[index].value === 0 ? 0.2 : 1}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [
                `${value.toLocaleString()} reviews`,
                name,
              ]}
              contentStyle={{
                background: "white",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label overlay approach via absolute container */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--text-muted)",
              marginBottom: 12,
            }}
          >
            {total > 0 ? `${total.toLocaleString()} Total` : "No data"}
          </div>
          {data.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: COLORS[i],
                    opacity: item.value === 0 ? 0.3 : 1,
                  }}
                />
                <span
                  style={{
                    fontSize: 13,
                    color:
                      item.value === 0 ? "var(--text-muted)" : "var(--text-secondary)",
                  }}
                >
                  {LABELS[i]}
                </span>
              </div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color:
                    item.value === 0 ? "var(--text-muted)" : "var(--text-primary)",
                }}
              >
                {item.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
