"use client";

import React, { useState, useCallback } from "react";
import { X, Upload, Link, PlayCircle, Apple, FileText, Loader2 } from "lucide-react";
import { analyzeCSVUpload, analyzePlayStore, analyzeAppStore } from "@/lib/api";
import type { AnalysisResult, AnalysisSource } from "@/types";

interface UploadModalProps {
  onClose: () => void;
  onSuccess: (result: AnalysisResult) => void;
}

export default function UploadModal({ onClose, onSuccess }: UploadModalProps) {
  const [source, setSource] = useState<AnalysisSource>("csv");
  const [url, setUrl] = useState("");
  const [count, setCount] = useState(100);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.name.endsWith(".csv")) {
      setFile(dropped);
      setError(null);
    } else {
      setError("Only CSV files are supported.");
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected?.name.endsWith(".csv")) {
      setFile(selected);
      setError(null);
    } else if (selected) {
      setError("Only CSV files are supported.");
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setIsLoading(true);
    try {
      let result: AnalysisResult;
      if (source === "csv") {
        if (!file) throw new Error("Please select a CSV file.");
        result = await analyzeCSVUpload(file, count);
      } else if (source === "play-store") {
        if (!url.trim()) throw new Error("Please enter a Play Store app ID or URL.");
        result = await analyzePlayStore({ app_id_or_url: url.trim(), count });
      } else {
        if (!url.trim()) throw new Error("Please enter an App Store app ID or URL.");
        result = await analyzeAppStore({ app_id_or_url: url.trim(), count });
      }
      onSuccess(result);
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } }; message?: string })
          ?.response?.data?.detail ||
        (err as { message?: string })?.message ||
        "Analysis failed. Please try again.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs: { id: AnalysisSource; label: string; icon: React.ReactNode }[] = [
    { id: "csv", label: "CSV Upload", icon: <FileText size={14} /> },
    { id: "play-store", label: "Google Play", icon: <PlayCircle size={14} /> },
    { id: "app-store", label: "App Store", icon: <Apple size={14} /> },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              Upload Reviews
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
              Choose your data source to start AI analysis
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-muted)",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Source Tabs */}
        <div
          style={{
            display: "flex",
            gap: 6,
            padding: 4,
            background: "var(--bg-main)",
            borderRadius: 10,
            marginBottom: 20,
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setSource(tab.id); setError(null); }}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "8px 12px",
                borderRadius: 8,
                border: "none",
                fontSize: 13,
                fontWeight: source === tab.id ? 600 : 400,
                color: source === tab.id ? "var(--text-primary)" : "var(--text-muted)",
                background: source === tab.id ? "white" : "transparent",
                cursor: "pointer",
                boxShadow: source === tab.id ? "var(--shadow-sm)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Input area */}
        {source === "csv" ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("csv-input")?.click()}
            style={{
              border: `2px dashed ${isDragging ? "var(--gold)" : file ? "var(--positive)" : "var(--border)"}`,
              borderRadius: 12,
              padding: 32,
              textAlign: "center",
              cursor: "pointer",
              background: isDragging
                ? "var(--gold-muted)"
                : file
                ? "var(--positive-bg)"
                : "var(--bg-main)",
              transition: "all 0.15s ease",
              marginBottom: 16,
            }}
          >
            <input
              id="csv-input"
              type="file"
              accept=".csv"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            {file ? (
              <>
                <FileText size={32} color="var(--positive)" style={{ margin: "0 auto 8px" }} />
                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--positive)" }}>
                  {file.name}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                  {(file.size / 1024).toFixed(1)} KB — Click to change
                </div>
              </>
            ) : (
              <>
                <Upload size={32} color="var(--text-muted)" style={{ margin: "0 auto 8px" }} />
                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>
                  Drop CSV here or click to browse
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                  Supports Blinkit review exports with rating + review_text columns
                </div>
              </>
            )}
          </div>
        ) : (
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 500,
                color: "var(--text-secondary)",
                marginBottom: 8,
              }}
            >
              <Link size={13} />
              {source === "play-store" ? "Play Store App ID or URL" : "App Store App ID or URL"}
            </label>
            <input
              className="input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={
                source === "play-store"
                  ? "e.g. com.blinkit.consumer"
                  : "e.g. 1436087296"
              }
            />
          </div>
        )}

        {/* Count */}
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 500,
              color: "var(--text-secondary)",
              marginBottom: 8,
            }}
          >
            Reviews to Analyze: <strong>{count}</strong>
          </label>
          <input
            type="range"
            min={50}
            max={500}
            step={50}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            style={{ width: "100%", accentColor: "var(--gold)" }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 11,
              color: "var(--text-muted)",
              marginTop: 4,
            }}
          >
            <span>50</span><span>500</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              padding: "10px 14px",
              background: "var(--negative-bg)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              borderRadius: 8,
              fontSize: 13,
              color: "var(--negative)",
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={isLoading}
          style={{ width: "100%", justifyContent: "center", height: 44 }}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Running AI Analysis... (this may take ~60s)
            </>
          ) : (
            <>
              <Upload size={16} />
              Start Analysis
            </>
          )}
        </button>
      </div>
    </div>
  );
}
