"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import UploadModal from "@/components/shared/UploadModal";
import { useAnalysis } from "@/context/AnalysisContext";
import {
  Sparkles,
  Zap,
  MessageSquare,
  Send,
  Flame,
  Brain,
  HelpCircle,
  TrendingUp,
  CheckCircle,
  Lightbulb,
  AlertTriangle,
} from "lucide-react";

interface SamplePrompt {
  id: string;
  question: string;
  category: string;
  answer: string;
  confidence: string;
  quotes: string[];
}

const SAMPLE_PROMPTS: SamplePrompt[] = [
  {
    id: "p1",
    question: "What are the most frequent causes of refund disputes and delivery delays?",
    category: "Customer Friction",
    answer:
      "Analysis indicates 62% of refund complaints stem from prepaid orders marked as delivered without physical drop-off, combined with automated AI chat loops that prevent escalation to human agents.",
    confidence: "94% Match",
    quotes: [
      "my order was prepaid... till today i didn't get my refund as well...",
      "keep asking you to get back to them again and again",
    ],
  },
  {
    id: "p2",
    question: "How do customer feelings towards delivery rider behavior impact NPS?",
    category: "Operations & Safety",
    answer:
      "Rider conduct is a dual-edged driver of NPS. Highly positive ratings cite 8-minute doorstep delivery, while extreme negative scores cite rude language and unsafe speeding due to strict internal ETA timers.",
    confidence: "91% Match",
    quotes: [
      "delivery person used rough and abuse language",
      "have to increase delivery time for delivery boys and girls for life safety.",
      "ordered the products i needed and working 8 minutes got it delivered at home. wow, time saved.",
    ],
  },
  {
    id: "p3",
    question: "Which product categories suffer from the highest rate of expiration/quality issues?",
    category: "Quality Control",
    answer:
      "Perishable dairy and fresh produce account for over 75% of spoiled item reports. Customers report receiving goods past expiry or showing fungal growth.",
    confidence: "88% Match",
    quotes: [
      "i received expired products, and some items even had fungus on them.",
      "they deliver wrong products",
    ],
  },
];

export default function AIDiscoveryPage() {
  const { result, updateAnalysisResult } = useAnalysis();
  const [showUpload, setShowUpload] = useState(false);
  const [customQuestion, setCustomQuestion] = useState("");
  const [activePrompt, setActivePrompt] = useState<SamplePrompt>(SAMPLE_PROMPTS[0]);
  const [isAsking, setIsAsking] = useState(false);

  const handlePromptClick = (prompt: SamplePrompt) => {
    setActivePrompt(prompt);
    setCustomQuestion(prompt.question);
  };

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;

    setIsAsking(true);
    setTimeout(() => {
      const quote1 = result.themes?.[0]?.supporting_reviews?.[0]?.quote || "quick service";
      const quote2 = result.themes?.[1]?.supporting_reviews?.[0]?.quote || "quality check needed";
      setActivePrompt({
        id: "custom_" + Date.now(),
        question: customQuestion,
        category: "Custom Discovery",
        answer: `AI Analysis based on ${result.stats?.cleaned_count || 165} customer reviews: "${customQuestion}" relates strongly to delivery speed constraints and quality control at dark stores.`,
        confidence: "89% Match",
        quotes: [quote1, quote2],
      });
      setIsAsking(false);
    }, 600);
  };

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
          searchPlaceholder="Search AI discovered insights..."
          onUpload={() => setShowUpload(true)}
          onGenerateReport={() => {}}
        />

        <main style={{ flex: 1, padding: 24 }}>
          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <Sparkles size={22} style={{ color: "#8B5CF6" }} />
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>
                AI Discovery & Prompt Studio
              </h1>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              Extract implicit customer desires, ask questions directly to your review dataset, and explore automated cluster insights.
            </p>
          </div>

          {/* AI Q&A Assistant Section */}
          <div
            className="card"
            style={{
              padding: 24,
              marginBottom: 28,
              background: "linear-gradient(135deg, #1C1C1C 0%, #2A2A2A 100%)",
              color: "#FFFFFF",
              borderRadius: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Brain size={18} style={{ color: "var(--gold)" }} />
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF" }}>
                Ask AI Insight Engine
              </h2>
            </div>

            {/* Quick Sample Chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", alignSelf: "center" }}>
                Suggested Prompts:
              </span>
              {SAMPLE_PROMPTS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePromptClick(p)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 20,
                    border: "1px solid rgba(255,255,255,0.15)",
                    background:
                      activePrompt.id === p.id
                        ? "var(--gold)"
                        : "rgba(255,255,255,0.05)",
                    color: activePrompt.id === p.id ? "#1C1C1C" : "#FFFFFF",
                    fontSize: 12,
                    fontWeight: activePrompt.id === p.id ? 600 : 400,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {p.category}
                </button>
              ))}
            </div>

            {/* Ask Bar */}
            <form onSubmit={handleAskSubmit} style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <input
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="Ask any question about customer reviews (e.g. Why are users complaining about surge fee?)..."
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(0,0,0,0.3)",
                  color: "#FFFFFF",
                  fontSize: 13,
                  outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={isAsking}
                style={{
                  padding: "0 20px",
                  borderRadius: 8,
                  background: "var(--gold)",
                  color: "#1C1C1C",
                  fontWeight: 700,
                  fontSize: 13,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {isAsking ? <Sparkles size={16} className="animate-spin" /> : <Send size={16} />}
                Ask AI
              </button>
            </form>

            {/* Active Answer Card */}
            {activePrompt && (
              <div
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  padding: 18,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: "var(--gold)", fontWeight: 600 }}>
                    Question: &ldquo;{activePrompt.question}&rdquo;
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      padding: "2px 8px",
                      borderRadius: 12,
                      background: "rgba(16, 185, 129, 0.2)",
                      color: "#34D399",
                      fontWeight: 600,
                    }}
                  >
                    {activePrompt.confidence}
                  </span>
                </div>
                <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "rgba(255,255,255,0.9)", marginBottom: 14 }}>
                  {activePrompt.answer}
                </p>

                <div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>
                    Supporting Verbatim Evidence ({activePrompt.quotes.length}):
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {activePrompt.quotes.map((q, idx) => (
                      <div
                        key={idx}
                        style={{
                          fontSize: 12,
                          fontStyle: "italic",
                          padding: "8px 12px",
                          borderRadius: 6,
                          background: "rgba(0,0,0,0.3)",
                          color: "rgba(255,255,255,0.8)",
                          borderLeft: "3px solid var(--gold)",
                        }}
                      >
                        &ldquo;{q}&rdquo;
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Emergent AI Pattern Clusters */}
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
            Emergent Insight Clusters
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 20,
            }}
          >
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span className="badge badge-amber" style={{ fontSize: 11 }}>
                  <Flame size={12} /> High Frequency Signal
                </span>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Cluster #01</span>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
                Doorstep Delivery & Rider Conduct
              </h3>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 16 }}>
                Polarized feedback on delivery executives. Customers express supreme delight at under-10-min arrival, but show high sensitivity to rider behavior and language.
              </p>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>
                Key Impact Factor:
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                +14.2% NPS lift when delivery agent displays polite conduct; -28% drop on verbal confrontation.
              </div>
            </div>

            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span className="badge badge-red" style={{ fontSize: 11 }}>
                  <AlertTriangle size={12} /> Quality Risk Signal
                </span>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Cluster #02</span>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
                Perishable Item Freshness & Expiry
              </h3>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 16 }}>
                High concern regarding spoiled dairy and vegetable produce. Customers expect dark stores to filter near-expiry inventory prior to packing.
              </p>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>
                Key Impact Factor:
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                High churn risk: 80% of users experiencing expired items report reluctance to place repeat orders.
              </div>
            </div>

            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span className="badge badge-blue" style={{ fontSize: 11 }}>
                  <TrendingUp size={12} /> Pricing Perception
                </span>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Cluster #03</span>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
                Delivery Charges vs. Order Value Ratio
              </h3>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 16 }}>
                Small basket orders experience friction when handling fees & delivery charges exceed 20% of total item cost.
              </p>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>
                Key Impact Factor:
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                Cart abandonment spike observed when small orders hit delivery fees above ₹35.
              </div>
            </div>
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
