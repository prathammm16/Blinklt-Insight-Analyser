"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import UploadModal from "@/components/shared/UploadModal";
import { useAnalysis } from "@/context/AnalysisContext";
import {
  ShoppingCart,
  Zap,
  Clock,
  Heart,
  DollarSign,
  Smartphone,
  ShieldCheck,
  AlertCircle,
  Lightbulb,
} from "lucide-react";

export default function ShoppingBehaviourPage() {
  const { result, updateAnalysisResult } = useAnalysis();
  const [showUpload, setShowUpload] = useState(false);
  const behaviors = result?.behaviors ?? [];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-main)" }}>
      <Sidebar />

      <div
        style={{
          marginLeft: "var(--sidebar-width)",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <TopBar
          searchPlaceholder="Search customer shopping behaviors..."
          onUpload={() => setShowUpload(true)}
          onGenerateReport={() => {}}
        />

        <main style={{ flex: 1, padding: 24 }}>
          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <ShoppingCart size={22} style={{ color: "var(--gold)" }} />
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>
                Shopping Behaviour & User Patterns
              </h1>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              Analyze customer habit loops, emergency replenishment needs, and price sensitivity drivers.
            </p>
          </div>

          {/* Behavior Cards Grid */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {behaviors.map((beh, idx) => {
              const isUrgency = beh.behavior_type.toLowerCase().includes("urgency") || beh.behavior_type.toLowerCase().includes("time");
              const isConvenience = beh.behavior_type.toLowerCase().includes("convenience");
              const isQuality = beh.behavior_type.toLowerCase().includes("quality") || beh.behavior_type.toLowerCase().includes("trust");
              const isPrice = beh.behavior_type.toLowerCase().includes("price") || beh.behavior_type.toLowerCase().includes("value");

              return (
                <div key={idx} className="card" style={{ padding: 24 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          background: isUrgency
                            ? "#FEE2E2"
                            : isConvenience
                            ? "#E0E7FF"
                            : isQuality
                            ? "#D1FAE5"
                            : "#FEF3C7",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {isUrgency && <Clock size={20} color="#DC2626" />}
                        {isConvenience && <Zap size={20} color="#4F46E5" />}
                        {isQuality && <ShieldCheck size={20} color="#059669" />}
                        {isPrice && <DollarSign size={20} color="#D97706" />}
                      </div>
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
                          Behavior Pattern #{idx + 1}
                        </span>
                        <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)" }}>
                          {beh.behavior_type}
                        </h2>
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 16 }}>
                    {beh.description}
                  </p>

                  {/* Evidence Quotes */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase" }}>
                      Direct Customer Quotes ({beh.supporting_reviews.length}):
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {beh.supporting_reviews.map((rev) => (
                        <div
                          key={rev.review_id}
                          style={{
                            padding: "10px 14px",
                            borderRadius: 8,
                            background: "var(--bg-main)",
                            border: "1px solid var(--border)",
                            fontSize: 12.5,
                            fontStyle: "italic",
                            color: "var(--text-primary)",
                          }}
                        >
                          &ldquo;{rev.quote}&rdquo;
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* UX Recommendation Box */}
                  <div
                    style={{
                      padding: 12,
                      borderRadius: 8,
                      background: "rgba(234, 179, 8, 0.1)",
                      border: "1px solid rgba(234, 179, 8, 0.3)",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <Lightbulb size={18} style={{ color: "#D97706", flexShrink: 0 }} />
                    <div style={{ fontSize: 12, color: "var(--text-primary)" }}>
                      <strong>Product Takeaway:</strong> Optimize app checkout flow and live rider tracking specifically tailored for {beh.behavior_type.toLowerCase()}.
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={(res) => {
            updateAnalysisResult(res);
            setShowUpload(false);
          }}
        />
      )}
    </div>
  );
}
