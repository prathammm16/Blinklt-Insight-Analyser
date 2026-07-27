"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import UploadModal from "@/components/shared/UploadModal";
import AnalysisLoader from "@/components/shared/AnalysisLoader";
import StatCards from "@/components/dashboard/StatCards";
import ExecutiveSummary from "@/components/dashboard/ExecutiveSummary";
import SourceDistributionChart from "@/components/dashboard/SourceDistributionChart";
import SentimentChart from "@/components/dashboard/SentimentChart";
import { getReport } from "@/lib/api";
import { useAnalysis } from "@/context/AnalysisContext";
import type { AnalysisResult } from "@/types";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Download,
  FileText,
} from "lucide-react";

export default function DashboardPage() {
  const { result, history, updateAnalysisResult, isLoading } = useAnalysis();
  const [showUpload, setShowUpload] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportMd, setReportMd] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const parseInlineMarkdown = (text: string): string => {
    if (!text) return "";
    let escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    escaped = escaped.replace(/\*(.*?)\*/g, "<em>$1</em>");
    escaped = escaped.replace(/`(.*?)`/g, '<code style="font-family:monospace; background:#edf2f7; padding:2px 4px; border-radius:4px; font-size:90%; color:#c53030;">$1</code>');
    return escaped;
  };

  const parseMarkdownToHtml = (markdown: string): string => {
    if (!markdown) return "";
    const lines = markdown.split("\n");
    let html = "";
    let inList = false;
    let listType: "ul" | "ol" | null = null;
    let inTable = false;
    let tableHeaders: string[] = [];
    let tableRows: string[][] = [];

    const closeList = () => {
      if (inList) {
        html += listType === "ul" ? "</ul>" : "</ol>";
        inList = false;
        listType = null;
      }
    };

    const closeTable = () => {
      if (inTable) {
        html += '<table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:13px;">';
        if (tableHeaders.length > 0) {
          html += '<thead><tr style="background:#f8fafc;">';
          tableHeaders.forEach(h => {
            html += `<th style="border:1px solid #e2e8f0; padding:8px 12px; font-weight:600; text-align:left; color:#2d3748;">${h}</th>`;
          });
          html += '</tr></thead>';
        }
        html += '<tbody>';
        tableRows.forEach((row, idx) => {
          const bg = idx % 2 === 0 ? '#ffffff' : '#fafafa';
          html += `<tr style="background:${bg};">`;
          row.forEach(cell => {
            html += `<td style="border:1px solid #e2e8f0; padding:8px 12px; text-align:left; color:#4a5568;">${cell}</td>`;
          });
          html += '</tr>';
        });
        html += '</tbody></table>';
        inTable = false;
        tableHeaders = [];
        tableRows = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Handle Table
      if (line.startsWith("|")) {
        closeList();
        inTable = true;
        const cells = line.split("|").map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
        const isSeparator = cells.every(c => /^:-*:?$/.test(c) || /^-+$/.test(c));
        if (isSeparator) {
          continue;
        }
        if (tableHeaders.length === 0) {
          tableHeaders = cells.map(c => parseInlineMarkdown(c));
        } else {
          tableRows.push(cells.map(c => parseInlineMarkdown(c)));
        }
        continue;
      } else {
        closeTable();
      }

      // Handle Horizontal Rule
      if (line === "---") {
        closeList();
        html += '<hr style="border:0; border-top:1px solid #e2e8f0; margin:24px 0;" />';
        continue;
      }

      // Handle Blockquote
      if (line.startsWith(">")) {
        closeList();
        const content = line.substring(1).trim();
        html += `<blockquote style="margin:18px 0; padding:10px 20px; color:#4a5568; border-left:4px solid #F9CB28; background-color:#F8FAFC; font-style:italic;">${parseInlineMarkdown(content)}</blockquote>`;
        continue;
      }

      // Handle Headings
      if (line.startsWith("#")) {
        closeList();
        const level = line.match(/^#+/)?.[0].length || 1;
        const content = line.replace(/^#+\s*/, "");
        const fontSize = level === 1 ? "24px" : level === 2 ? "18px" : "15px";
        const marginTop = level === 1 ? "0px" : level === 2 ? "28px" : "20px";
        const borderBottom = level === 1 ? "2px solid #e2e8f0" : level === 2 ? "1px solid #e2e8f0" : "none";
        const paddingBottom = level <= 2 ? "6px" : "0px";
        
        html += `<h${level} style="font-size:${fontSize}; font-weight:700; color:#1a202c; margin-top:${marginTop}; margin-bottom:12px; border-bottom:${borderBottom}; padding-bottom:${paddingBottom}; page-break-after:avoid;">${parseInlineMarkdown(content)}</h${level}>`;
        continue;
      }

      // Handle Bullet Lists
      if (line.startsWith("- ") || line.startsWith("* ")) {
        if (!inList || listType !== "ul") {
          closeList();
          html += '<ul style="margin:8px 0; padding-left:24px; list-style-type:disc;">';
          inList = true;
          listType = "ul";
        }
        const content = line.substring(2).trim();
        html += `<li style="margin-bottom:6px; font-size:13.5px; color:#4a5568; line-height:1.6;">${parseInlineMarkdown(content)}</li>`;
        continue;
      }

      // Handle Ordered Lists
      if (/^\d+\.\s+/.test(line)) {
        if (!inList || listType !== "ol") {
          closeList();
          html += '<ol style="margin:8px 0; padding-left:24px; list-style-type:decimal;">';
          inList = true;
          listType = "ol";
        }
        const content = line.replace(/^\d+\.\s+/, "").trim();
        html += `<li style="margin-bottom:6px; font-size:13.5px; color:#4a5568; line-height:1.6;">${parseInlineMarkdown(content)}</li>`;
        continue;
      }

      // Empty lines
      if (line === "") {
        closeList();
        continue;
      }

      // Paragraph
      closeList();
      html += `<p style="margin-top:0; margin-bottom:14px; font-size:13.5px; color:#4a5568; line-height:1.6;">${parseInlineMarkdown(line)}</p>`;
    }

    closeList();
    closeTable();
    return html;
  };

  const handleExportMarkdown = () => {
    if (!reportMd) return;
    try {
      const blob = new Blob([reportMd], { type: "text/markdown;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Blinkit_Insight_Report_${new Date().toISOString().slice(0, 10)}.md`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      triggerToast("Markdown report download started!");
    } catch (err) {
      console.error("Markdown export failed", err);
    }
  };

  const handleExportPDF = () => {
    if (!reportMd) return;
    try {
      const renderedHtml = parseMarkdownToHtml(reportMd);
      const iframe = document.createElement("iframe");
      iframe.style.position = "absolute";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "none";
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (!doc) {
        throw new Error("Could not access iframe document");
      }

      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Blinkit Insight AI – Product Research Report</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                line-height: 1.6;
                color: #2D3748;
                padding: 40px;
                margin: 0;
                background-color: #ffffff;
              }
              h1 {
                font-size: 24px;
                font-weight: 700;
                color: #1A202C;
                margin-top: 0;
                margin-bottom: 8px;
                border-bottom: 2px solid #E2E8F0;
                padding-bottom: 8px;
              }
              .meta {
                font-size: 13px;
                color: #718096;
                margin-bottom: 24px;
                padding-bottom: 12px;
                border-bottom: 1px solid #E2E8F0;
              }
              h2 {
                font-size: 18px;
                font-weight: 700;
                color: #2D3748;
                margin-top: 28px;
                margin-bottom: 14px;
                border-bottom: 1px solid #E2E8F0;
                padding-bottom: 6px;
                page-break-after: avoid;
              }
              h3 {
                font-size: 15px;
                font-weight: 700;
                color: #4A5568;
                margin-top: 20px;
                margin-bottom: 10px;
                page-break-after: avoid;
              }
              p {
                font-size: 13.5px;
                margin-top: 0;
                margin-bottom: 14px;
                color: #4A5568;
                text-align: justify;
              }
              ul, ol {
                margin-top: 0;
                margin-bottom: 14px;
                padding-left: 20px;
              }
              li {
                font-size: 13.5px;
                color: #4A5568;
                margin-bottom: 6px;
                line-height: 1.6;
              }
              blockquote {
                margin: 18px 0;
                padding: 10px 20px;
                color: #4A5568;
                border-left: 4px solid #F9CB28;
                background-color: #F8FAFC;
                font-style: italic;
                page-break-inside: avoid;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 18px 0;
                font-size: 12.5px;
                page-break-inside: avoid;
              }
              th, td {
                border: 1px solid #E2E8F0;
                padding: 8px 12px;
                text-align: left;
              }
              th {
                background-color: #F8FAFC;
                font-weight: 600;
                color: #2D3748;
              }
              tr:nth-child(even) {
                background-color: #FAFAFA;
              }
              code {
                font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
                background-color: #EDF2F7;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 90%;
                color: #C53030;
              }
              hr {
                border: 0;
                border-top: 1px solid #E2E8F0;
                margin: 24px 0;
              }
              @media print {
                @page {
                  margin: 20mm;
                }
                body {
                  padding: 0;
                }
              }
            </style>
          </head>
          <body>
            <h1>Blinkit Insight AI – Product Research Report</h1>
            <div class="meta">
              <strong>Exported on:</strong> ${new Date().toLocaleString()}
            </div>
            <div>
              ${renderedHtml}
            </div>
          </body>
        </html>
      `);
      doc.close();

      setTimeout(() => {
        if (iframe.contentWindow) {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          triggerToast("PDF report export started!");
        }
        document.body.removeChild(iframe);
      }, 300);
    } catch (err) {
      console.error("PDF export failed", err);
    }
  };

  const handleAnalysisSuccess = (r: AnalysisResult) => {
    updateAnalysisResult(r);
    setShowUpload(false);
  };

  const handleGenerateReport = async () => {
    const runId = result?.run_id !== "seed_default" ? result.run_id : history[0]?.run_id;
    if (!runId) return;
    setIsGenerating(true);
    try {
      const report = await getReport(runId);
      setReportMd(report.markdown);
      setShowReport(true);
    } catch {
      // silent
    } finally {
      setIsGenerating(false);
    }
  };

  const themes = result?.themes ?? [];
  const totalReviews =
    (result.source_counts?.play_store || 0) +
    (result.source_counts?.app_store || 0) +
    (result.source_counts?.csv_upload || 0);

  const isSeed = result.run_id === "seed_default";

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
          onUpload={() => setShowUpload(true)}
          onGenerateReport={handleGenerateReport}
          isGenerating={isGenerating}
        />

        <main style={{ flex: 1, padding: 24, maxWidth: 1400, width: "100%" }}>
          {isLoading ? (
            <AnalysisLoader />
          ) : (
            <>
              {/* Seed data notice */}
              {isSeed && (
                <div
                  className="animate-fadeIn"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 16px",
                    background: "var(--gold-muted)",
                    border: "1px solid rgba(249, 203, 40, 0.35)",
                    borderRadius: 10,
                    marginBottom: 16,
                    fontSize: 13,
                    color: "#7a5c00",
                  }}
                >
                  <Sparkles size={14} color="var(--gold-dark)" />
                  <span>
                    <strong>Showing cached analysis</strong> from the last Blinkit review run (Play Store + App Store, 165 reviews).
                    Upload new reviews to refresh insights.
                  </span>
                  <button
                    onClick={() => setShowUpload(true)}
                    style={{
                      marginLeft: "auto",
                      padding: "4px 12px",
                      background: "var(--gold)",
                      border: "none",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      color: "#1C1C1C",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      flexShrink: 0,
                    }}
                  >
                    <RefreshCw size={11} />
                    Refresh Analysis
                  </button>
                </div>
              )}

              {/* Stat Cards */}
              <StatCards result={result} />

              {/* Executive Summary */}
              <ExecutiveSummary result={result} onViewReport={handleGenerateReport} />

              {/* Charts row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1.6fr",
                  gap: 16,
                  marginBottom: 24,
                }}
              >
                <SourceDistributionChart result={result} />
                <SentimentChart result={result} />
              </div>

              {/* Theme cards */}
              {themes.length > 0 && (
                <section style={{ marginBottom: 24 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 14,
                    }}
                  >
                    <div>
                      <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
                        Identified Themes
                      </h2>
                      <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
                        AI-clustered topics from {totalReviews.toLocaleString()} reviews
                      </p>
                    </div>
                    <button className="btn btn-secondary" style={{ fontSize: 13 }}>
                      View All Themes
                      <ArrowRight size={13} />
                    </button>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                      gap: 12,
                    }}
                  >
                    {themes.slice(0, 6).map((theme, i) => (
                      <div
                        key={theme.theme_id}
                        className="card animate-fadeIn"
                        style={{ padding: 18, animationDelay: `${i * 0.07}s` }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: ["#F9CB28", "#10B981", "#6366F1", "#EF4444", "#8B5CF6", "#F59E0B"][i % 6],
                              flexShrink: 0,
                            }}
                          />
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: "var(--text-muted)",
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                            }}
                          >
                            {theme.supporting_reviews.length} reviews
                          </span>
                        </div>
                        <h4
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "var(--text-primary)",
                            marginBottom: 6,
                            lineHeight: 1.3,
                          }}
                        >
                          {theme.title}
                        </h4>
                        <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                          {theme.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Pain Points section */}
              {result.pain_points?.length > 0 && (
                <section style={{ marginBottom: 24 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 14,
                    }}
                  >
                    <div>
                      <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
                        Customer Pain Points
                      </h2>
                      <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
                        Friction areas identified by AI from review sentiment
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                      gap: 12,
                    }}
                  >
                    {result.pain_points.map((pp, i) => (
                      <div
                        key={i}
                        className="card animate-fadeIn"
                        style={{ padding: 18, animationDelay: `${i * 0.06}s` }}
                      >
                        <div style={{ marginBottom: 8 }}>
                          <span className="badge badge-red" style={{ fontSize: 10 }}>
                            PAIN POINT
                          </span>
                        </div>
                        <h4
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "var(--text-primary)",
                            marginBottom: 6,
                            lineHeight: 1.3,
                          }}
                        >
                          {pp.issue}
                        </h4>
                        <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                          <span style={{ fontWeight: 600 }}>Root cause: </span>
                          {pp.root_cause}
                        </p>
                        {pp.supporting_reviews[0] && (
                          <div
                            style={{
                              marginTop: 10,
                              padding: "8px 10px",
                              background: "var(--bg-main)",
                              borderRadius: 6,
                              fontSize: 11.5,
                              fontStyle: "italic",
                              color: "var(--text-muted)",
                              borderLeft: "2px solid var(--negative)",
                            }}
                          >
                            &ldquo;{pp.supporting_reviews[0].quote}&rdquo;
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* History */}
              {history.length > 0 && (
                <section style={{ marginBottom: 24 }}>
                  <h2
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      marginBottom: 14,
                    }}
                  >
                    Analysis History
                  </h2>
                  <div className="card" style={{ overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr
                          style={{
                            borderBottom: "1px solid var(--border)",
                            background: "var(--bg-main)",
                          }}
                        >
                          {["Run ID", "Source", "Reviews", "Cleaned", "Timestamp", "Status"].map((h) => (
                            <th
                              key={h}
                              style={{
                                padding: "10px 16px",
                                textAlign: "left",
                                fontSize: 11,
                                fontWeight: 600,
                                color: "var(--text-muted)",
                                letterSpacing: "0.05em",
                                textTransform: "uppercase",
                              }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {history.slice(0, 5).map((run, i) => (
                          <tr
                            key={run.run_id}
                            style={{
                              borderBottom: i < history.length - 1 ? "1px solid var(--border)" : "none",
                              transition: "background 0.15s ease",
                              cursor: "pointer",
                            }}
                            onMouseEnter={(e) =>
                              ((e.currentTarget as HTMLTableRowElement).style.background = "var(--bg-main)")
                            }
                            onMouseLeave={(e) =>
                              ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")
                            }
                          >
                            <td style={{ padding: "12px 16px", fontSize: 12, fontFamily: "monospace", color: "var(--text-secondary)" }}>
                              {run.run_id}
                            </td>
                            <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-primary)" }}>
                              {run.source}
                            </td>
                            <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600 }}>
                              {run.total_reviews.toLocaleString()}
                            </td>
                            <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-secondary)" }}>
                              {run.cleaned_reviews.toLocaleString()}
                            </td>
                            <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-muted)" }} suppressHydrationWarning>
                              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <Clock size={12} />
                                {new Date(run.timestamp).toLocaleString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </td>
                            <td style={{ padding: "12px 16px" }}>
                              {run.status === "COMPLETED" ? (
                                <span className="badge badge-green" style={{ fontSize: 10 }}>
                                  <CheckCircle size={10} />
                                  {run.status}
                                </span>
                              ) : (
                                <span className="badge badge-red" style={{ fontSize: 10 }}>
                                  <AlertCircle size={10} />
                                  {run.status}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </div>

      {/* Upload modal */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={handleAnalysisSuccess}
        />
      )}

      {/* Report Modal */}
      {showReport && reportMd && (
        <div className="modal-overlay" onClick={() => setShowReport(false)}>
          <div
            className="modal-content"
            style={{
              maxWidth: 760,
              maxHeight: "85vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>PM Research Report</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  onClick={handleExportPDF}
                  disabled={isGenerating}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    borderRadius: 6,
                    border: "1px solid var(--border-strong)",
                    background: "var(--bg-main)",
                    color: "var(--text-primary)",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: isGenerating ? "not-allowed" : "pointer",
                    opacity: isGenerating ? 0.6 : 1,
                    transition: "background 0.2s ease, opacity 0.2s ease",
                  }}
                >
                  <Download size={13} />
                  Export PDF
                </button>
                <button
                  onClick={handleExportMarkdown}
                  disabled={isGenerating}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    borderRadius: 6,
                    border: "1px solid var(--border-strong)",
                    background: "var(--bg-main)",
                    color: "var(--text-primary)",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: isGenerating ? "not-allowed" : "pointer",
                    opacity: isGenerating ? 0.6 : 1,
                    transition: "background 0.2s ease, opacity 0.2s ease",
                  }}
                >
                  <FileText size={13} />
                  Export Markdown (.md)
                </button>
                <button
                  onClick={() => setShowReport(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 20,
                    color: "var(--text-muted)",
                    marginLeft: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  ×
                </button>
              </div>
            </div>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                fontFamily: "monospace",
                fontSize: 12,
                color: "var(--text-secondary)",
                overflowY: "auto",
                flex: 1,
                background: "var(--bg-main)",
                borderRadius: 8,
                padding: 16,
                lineHeight: 1.7,
              }}
            >
              {reportMd}
            </pre>
          </div>
        </div>
      )}

      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "#1C1C1C",
            color: "#FFFFFF",
            padding: "12px 24px",
            borderRadius: 8,
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            zIndex: 9999,
            fontSize: 14,
            fontWeight: 500,
            animation: "fadeIn 0.2s ease",
            border: "1px solid #333333"
          }}
        >
          <CheckCircle size={16} style={{ color: "#10B981" }} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
