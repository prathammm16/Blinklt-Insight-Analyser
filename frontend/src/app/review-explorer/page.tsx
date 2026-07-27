"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import UploadModal from "@/components/shared/UploadModal";
import { useAnalysis, type ReviewItem } from "@/context/AnalysisContext";
import {
  Search,
  Filter,
  Star,
  Smartphone,
  CheckCircle,
  AlertTriangle,
  MinusCircle,
  Database,
  ArrowUpDown,
} from "lucide-react";

export default function ReviewExplorerPage() {
  const { allReviews, updateAnalysisResult } = useAnalysis();
  const [showUpload, setShowUpload] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSentiment, setSelectedSentiment] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [selectedRating, setSelectedRating] = useState<string>("all");

  const filteredReviews = allReviews.filter((rev) => {
    const matchesSearch =
      searchQuery === "" ||
      rev.quote.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rev.theme.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rev.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSentiment =
      selectedSentiment === "all" || rev.sentiment === selectedSentiment;

    const matchesSource =
      selectedSource === "all" || rev.source === selectedSource;

    const matchesRating =
      selectedRating === "all" || rev.rating.toString() === selectedRating;

    return matchesSearch && matchesSentiment && matchesSource && matchesRating;
  });

  const totalFiltered = filteredReviews.length;
  const posCount = filteredReviews.filter((r) => r.sentiment === "positive").length;
  const negCount = filteredReviews.filter((r) => r.sentiment === "negative").length;
  const neuCount = filteredReviews.filter((r) => r.sentiment === "neutral").length;

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
          searchPlaceholder="Search review text, theme, or ID..."
          onUpload={() => setShowUpload(true)}
          onGenerateReport={() => {}}
        />

        <main style={{ flex: 1, padding: 24 }}>
          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <Search size={22} style={{ color: "var(--text-primary)" }} />
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>
                Review Explorer
              </h1>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              Filter, search, and inspect raw and processed customer feedback across all channels.
            </p>
          </div>

          {/* Quick Metrics */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                Total Filtered Reviews
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>
                {totalFiltered}
              </div>
            </div>
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                Positive Feedback
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#10B981" }}>
                {posCount} <span style={{ fontSize: 13, fontWeight: 400, color: "var(--text-muted)" }}>({totalFiltered ? Math.round((posCount / totalFiltered) * 100) : 0}%)</span>
              </div>
            </div>
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                Neutral Feedback
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#F59E0B" }}>
                {neuCount} <span style={{ fontSize: 13, fontWeight: 400, color: "var(--text-muted)" }}>({totalFiltered ? Math.round((neuCount / totalFiltered) * 100) : 0}%)</span>
              </div>
            </div>
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                Negative Feedback
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#EF4444" }}>
                {negCount} <span style={{ fontSize: 13, fontWeight: 400, color: "var(--text-muted)" }}>({totalFiltered ? Math.round((negCount / totalFiltered) * 100) : 0}%)</span>
              </div>
            </div>
          </div>

          {/* Controls / Filters */}
          <div
            className="card"
            style={{
              padding: 16,
              marginBottom: 24,
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Search Input */}
            <div style={{ flex: "1 1 300px", position: "relative" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                type="text"
                placeholder="Filter by keyword (e.g. delivery, refund, quality)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px 8px 36px",
                  borderRadius: 8,
                  border: "1px solid var(--border-strong)",
                  background: "var(--bg-main)",
                  fontSize: 13,
                  color: "var(--text-primary)",
                  outline: "none",
                }}
              />
            </div>

            {/* Sentiment Filters */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>
                Sentiment:
              </span>
              {["all", "positive", "neutral", "negative"].map((sent) => (
                <button
                  key={sent}
                  onClick={() => setSelectedSentiment(sent)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    border: "1px solid var(--border)",
                    fontSize: 12,
                    fontWeight: selectedSentiment === sent ? 600 : 400,
                    background:
                      selectedSentiment === sent
                        ? sent === "positive"
                          ? "#D1FAE5"
                          : sent === "negative"
                          ? "#FEE2E2"
                          : sent === "neutral"
                          ? "#FEF3C7"
                          : "var(--gold)"
                        : "var(--bg-card)",
                    color:
                      selectedSentiment === sent
                        ? sent === "positive"
                          ? "#065F46"
                          : sent === "negative"
                          ? "#991B1B"
                          : sent === "neutral"
                          ? "#92400E"
                          : "#1C1C1C"
                        : "var(--text-secondary)",
                    cursor: "pointer",
                    textTransform: "capitalize",
                  }}
                >
                  {sent}
                </button>
              ))}
            </div>

            {/* Source Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>
                Source:
              </span>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "1px solid var(--border-strong)",
                  background: "var(--bg-main)",
                  fontSize: 12,
                  color: "var(--text-primary)",
                  outline: "none",
                }}
              >
                <option value="all">All Sources</option>
                <option value="app_store">Apple App Store</option>
                <option value="play_store">Google Play Store</option>
                <option value="csv_upload">CSV Import</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>
                Rating:
              </span>
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "1px solid var(--border-strong)",
                  background: "var(--bg-main)",
                  fontSize: 12,
                  color: "var(--text-primary)",
                  outline: "none",
                }}
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>

          {/* Review Table Card */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr
                    style={{
                      background: "var(--bg-sidebar)",
                      borderBottom: "1px solid var(--border)",
                      fontSize: 12,
                      color: "var(--text-muted)",
                      fontWeight: 600,
                    }}
                  >
                    <th style={{ padding: "12px 16px" }}>ID</th>
                    <th style={{ padding: "12px 16px" }}>Rating</th>
                    <th style={{ padding: "12px 16px" }}>Customer Quote</th>
                    <th style={{ padding: "12px 16px" }}>Extracted Theme</th>
                    <th style={{ padding: "12px 16px" }}>Sentiment</th>
                    <th style={{ padding: "12px 16px" }}>Platform</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReviews.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          padding: "32px",
                          textAlign: "center",
                          color: "var(--text-muted)",
                          fontSize: 13,
                        }}
                      >
                        No reviews found matching your selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredReviews.map((rev, idx) => (
                      <tr
                        key={rev.id + idx}
                        style={{
                          borderBottom:
                            idx < filteredReviews.length - 1
                              ? "1px solid var(--border)"
                              : "none",
                        }}
                      >
                        <td
                          style={{
                            padding: "12px 16px",
                            fontSize: 12,
                            fontFamily: "monospace",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {rev.id}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", gap: 2, color: "#F59E0B" }}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                fill={i < rev.rating ? "#F59E0B" : "transparent"}
                                color={i < rev.rating ? "#F59E0B" : "var(--border-strong)"}
                              />
                            ))}
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            fontSize: 13,
                            color: "var(--text-primary)",
                            maxWidth: 380,
                            lineHeight: 1.5,
                          }}
                        >
                          &ldquo;{rev.quote}&rdquo;
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span
                            style={{
                              fontSize: 11,
                              padding: "4px 8px",
                              borderRadius: 4,
                              background: "var(--bg-main)",
                              border: "1px solid var(--border)",
                              color: "var(--text-secondary)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {rev.theme}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          {rev.sentiment === "positive" && (
                            <span className="badge badge-green" style={{ fontSize: 10 }}>
                              <CheckCircle size={10} /> Positive
                            </span>
                          )}
                          {rev.sentiment === "negative" && (
                            <span className="badge badge-red" style={{ fontSize: 10 }}>
                              <AlertTriangle size={10} /> Negative
                            </span>
                          )}
                          {rev.sentiment === "neutral" && (
                            <span className="badge badge-amber" style={{ fontSize: 10 }}>
                              <MinusCircle size={10} /> Neutral
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-secondary)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <Smartphone size={12} />
                            {rev.source === "app_store" || rev.platform === "ios"
                              ? "App Store (iOS)"
                              : rev.source === "csv_upload" || rev.platform === "csv"
                              ? "CSV File"
                              : "Play Store (Android)"}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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
