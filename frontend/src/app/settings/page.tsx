"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import UploadModal from "@/components/shared/UploadModal";
import { checkHealth } from "@/lib/api";
import { useAnalysis } from "@/context/AnalysisContext";
import {
  Settings,
  Cpu,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Save,
  Server,
  Zap,
} from "lucide-react";

export default function SettingsPage() {
  const { updateAnalysisResult } = useAnalysis();
  const [showUpload, setShowUpload] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-1.5-flash");
  const [defaultScrapeCount, setDefaultScrapeCount] = useState(200);
  const [enableLanguageFilter, setEnableLanguageFilter] = useState(true);
  const [enableDeduplication, setEnableDeduplication] = useState(true);
  const [apiHealth, setApiHealth] = useState<"connected" | "disconnected" | "checking">("checking");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        const h = await checkHealth();
        if (h && (h.status === "healthy" || h.status === "ok")) {
          setApiHealth("connected");
        } else {
          setApiHealth("disconnected");
        }
      } catch {
        setApiHealth("disconnected");
      }
    }
    testConnection();
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage("Settings updated successfully!");
    setTimeout(() => setToastMessage(null), 3000);
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
          searchPlaceholder="Search system settings..."
          onUpload={() => setShowUpload(true)}
          onGenerateReport={() => {}}
        />

        <main style={{ flex: 1, padding: 24, maxWidth: 800 }}>
          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <Settings size={22} style={{ color: "var(--gold)" }} />
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>
                System & AI Settings
              </h1>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              Manage Gemini API keys, model parameters, analysis thresholds, and backend connections.
            </p>
          </div>

          {/* Backend Service Health Card */}
          <div className="card" style={{ padding: 18, marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Server size={20} style={{ color: "var(--text-primary)" }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                  FastAPI Backend Server
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace" }}>
                  http://localhost:8000
                </div>
              </div>
            </div>

            <div>
              {apiHealth === "connected" ? (
                <span className="badge badge-green" style={{ fontSize: 11 }}>
                  <CheckCircle2 size={12} /> Connected & Operational
                </span>
              ) : apiHealth === "disconnected" ? (
                <span className="badge badge-red" style={{ fontSize: 11 }}>
                  <AlertCircle size={12} /> Offline / Fallback Mode
                </span>
              ) : (
                <span className="badge badge-amber" style={{ fontSize: 11 }}>
                  Checking...
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleSaveSettings} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* AI Model Selection Card */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <Cpu size={18} style={{ color: "var(--gold)" }} />
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                  Model Selection & Parameters
                </h2>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>
                  Target Gemini Model:
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid var(--border-strong)",
                    background: "var(--bg-main)",
                    fontSize: 13,
                    color: "var(--text-primary)",
                    outline: "none",
                  }}
                >
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Recommended for Fast Analysis)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Reasoning & Complex Clustering)</option>
                  <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash Experimental</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>
                  Default Scrape Count limit: ({defaultScrapeCount} reviews)
                </label>
                <input
                  type="range"
                  min={50}
                  max={500}
                  step={50}
                  value={defaultScrapeCount}
                  onChange={(e) => setDefaultScrapeCount(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--gold)" }}
                />
              </div>
            </div>

            {/* Pipeline Filtering Preferences */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <Sliders size={18} style={{ color: "var(--gold)" }} />
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                  Automated Preprocessing Toggles
                </h2>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13, color: "var(--text-primary)" }}>
                  <input
                    type="checkbox"
                    checked={enableLanguageFilter}
                    onChange={(e) => setEnableLanguageFilter(e.target.checked)}
                    style={{ accentColor: "var(--gold)", width: 16, height: 16 }}
                  />
                  Enable Automatic Non-English Review Filtering (langdetect)
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13, color: "var(--text-primary)" }}>
                  <input
                    type="checkbox"
                    checked={enableDeduplication}
                    onChange={(e) => setEnableDeduplication(e.target.checked)}
                    style={{ accentColor: "var(--gold)", width: 16, height: 16 }}
                  />
                  Enable Exact Duplicate Review Filtering
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                style={{
                  padding: "12px 24px",
                  borderRadius: 8,
                  background: "var(--gold)",
                  color: "#1C1C1C",
                  fontWeight: 700,
                  fontSize: 14,
                  border: "none",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Save size={16} /> Save System Settings
              </button>
            </div>
          </form>
        </main>
      </div>

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
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            zIndex: 9999,
            fontSize: 14,
            fontWeight: 500,
            border: "1px solid #333333",
          }}
        >
          <CheckCircle2 size={16} style={{ color: "#10B981" }} />
          <span>{toastMessage}</span>
        </div>
      )}

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
