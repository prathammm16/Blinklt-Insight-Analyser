"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { SEED_ANALYSIS } from "@/lib/seedData";
import { getLatestAnalysis, getHistory } from "@/lib/api";
import type { AnalysisResult, RunHistoryEntry } from "@/types";

export interface ReviewItem {
  id: string;
  quote: string;
  platform: string;
  source: string;
  theme: string;
  sentiment: "positive" | "neutral" | "negative";
  rating: number;
  date: string;
}

interface AnalysisContextType {
  result: AnalysisResult;
  allReviews: ReviewItem[];
  history: RunHistoryEntry[];
  isLoading: boolean;
  updateAnalysisResult: (newResult: AnalysisResult) => void;
  refreshAnalysis: () => Promise<void>;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

const STORAGE_KEY = "blinkit_insight_active_analysis";

export function extractReviewsFromResult(result: AnalysisResult): ReviewItem[] {
  const reviewsMap = new Map<string, ReviewItem>();

  // Determine active run platform and source dynamically
  let runPlatform = "android";
  let runSource = "play_store";

  const srcName = (result.source || "").toLowerCase();
  const sc = result.source_counts || {};

  if ((sc.play_store || 0) > 0 && (sc.app_store || 0) === 0 && (sc.csv_upload || 0) === 0) {
    runPlatform = "android";
    runSource = "play_store";
  } else if ((sc.app_store || 0) > 0 && (sc.play_store || 0) === 0 && (sc.csv_upload || 0) === 0) {
    runPlatform = "ios";
    runSource = "app_store";
  } else if ((sc.csv_upload || 0) > 0 && (sc.play_store || 0) === 0 && (sc.app_store || 0) === 0) {
    runPlatform = "csv";
    runSource = "csv_upload";
  } else if (srcName.includes("play") || srcName.includes("google")) {
    runPlatform = "android";
    runSource = "play_store";
  } else if (srcName.includes("app store") || srcName.includes("apple") || srcName.includes("ios")) {
    runPlatform = "ios";
    runSource = "app_store";
  } else if (srcName.includes("csv")) {
    runPlatform = "csv";
    runSource = "csv_upload";
  }

  if (result.themes) {
    result.themes.forEach((theme) => {
      theme.supporting_reviews?.forEach((rev, idx) => {
        const isNeg =
          rev.quote.toLowerCase().includes("rude") ||
          rev.quote.toLowerCase().includes("abuse") ||
          rev.quote.toLowerCase().includes("expired") ||
          rev.quote.toLowerCase().includes("fungus") ||
          rev.quote.toLowerCase().includes("costly") ||
          rev.quote.toLowerCase().includes("didn't get my refund") ||
          rev.quote.toLowerCase().includes("wrong");

        const isPos =
          rev.quote.toLowerCase().includes("wow") ||
          rev.quote.toLowerCase().includes("too good") ||
          rev.quote.toLowerCase().includes("best") ||
          rev.quote.toLowerCase().includes("quick") ||
          rev.quote.toLowerCase().includes("promptly");

        const sentiment: "positive" | "neutral" | "negative" = isNeg
          ? "negative"
          : isPos
          ? "positive"
          : "neutral";
        const rating = isNeg ? (idx % 2 === 0 ? 1 : 2) : isPos ? 5 : 3;

        const isOnlyPlayStore = (sc.play_store || 0) > 0 && (sc.app_store || 0) === 0 && (sc.csv_upload || 0) === 0;
        const isOnlyAppStore = (sc.app_store || 0) > 0 && (sc.play_store || 0) === 0 && (sc.csv_upload || 0) === 0;
        const isOnlyCsv = (sc.csv_upload || 0) > 0 && (sc.play_store || 0) === 0 && (sc.app_store || 0) === 0;

        let itemPlatform = runPlatform;
        let itemSource = runSource;

        if (isOnlyPlayStore || srcName.includes("google") || (srcName.includes("play") && !srcName.includes("apple"))) {
          itemPlatform = "android";
          itemSource = "play_store";
        } else if (isOnlyAppStore || srcName.includes("apple") || (srcName.includes("app store") && !srcName.includes("google"))) {
          itemPlatform = "ios";
          itemSource = "app_store";
        } else if (isOnlyCsv || srcName.includes("csv")) {
          itemPlatform = "csv";
          itemSource = "csv_upload";
        } else {
          itemPlatform = rev.platform || runPlatform;
          itemSource = rev.source || runSource;
        }

        reviewsMap.set(rev.review_id + "_" + theme.theme_id, {
          id: rev.review_id,
          quote: rev.quote,
          platform: itemPlatform,
          source: itemSource,
          theme: theme.title,
          sentiment,
          rating,
          date: result.timestamp ? result.timestamp.slice(0, 10) : "2026-07-14",
        });
      });
    });
  }

  return Array.from(reviewsMap.values());
}

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const [result, setResult] = useState<AnalysisResult>(SEED_ANALYSIS);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          setResult(JSON.parse(saved));
        } catch {
          // fallback to seed
        }
      }
    }
  }, []);

  const [allReviews, setAllReviews] = useState<ReviewItem[]>(() =>
    extractReviewsFromResult(SEED_ANALYSIS)
  );
  const [history, setHistory] = useState<RunHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync reviews state whenever result changes
  useEffect(() => {
    setAllReviews(extractReviewsFromResult(result));
  }, [result]);

  const loadHistory = useCallback(async () => {
    try {
      const h = await getHistory();
      setHistory(h);
    } catch {
      // Backend might be offline
    }
  }, []);

  const refreshAnalysis = useCallback(async () => {
    setIsLoading(true);
    try {
      const latest = await getLatestAnalysis();
      if (latest && latest.run_id) {
        setResult(latest);
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(latest));
        }
      }
      await loadHistory();
    } catch {
      // Fail silently and use current cached state
    } finally {
      setIsLoading(false);
    }
  }, [loadHistory]);

  useEffect(() => {
    // Initial fetch from backend if available
    refreshAnalysis();
  }, [refreshAnalysis]);

  const updateAnalysisResult = useCallback(
    (newResult: AnalysisResult) => {
      setResult(newResult);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newResult));
      }
      loadHistory();
    },
    [loadHistory]
  );

  return (
    <AnalysisContext.Provider
      value={{
        result,
        allReviews,
        history,
        isLoading,
        updateAnalysisResult,
        refreshAnalysis,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error("useAnalysis must be used within an AnalysisProvider");
  }
  return context;
}
