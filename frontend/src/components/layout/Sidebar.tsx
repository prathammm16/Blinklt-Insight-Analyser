"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Sparkles,
  TrendingUp,
  ShoppingCart,
  Target,
  GitBranch,
  Lightbulb,
  FileText,
  Database,
  Settings,
  HelpCircle,
  Zap,
} from "lucide-react";
import type { NavItem } from "@/types";

interface NavLinkDef {
  id: NavItem;
  label: string;
  icon: React.ReactNode;
  href: string;
}

const mainNavLinks: NavLinkDef[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={16} />,
    href: "/dashboard",
  },
  {
    id: "review-explorer",
    label: "Review Explorer",
    icon: <Search size={16} />,
    href: "/dashboard",
  },
  {
    id: "ai-discovery",
    label: "AI Discovery",
    icon: <Sparkles size={16} />,
    href: "/dashboard",
  },
  {
    id: "theme-analysis",
    label: "Theme Analysis",
    icon: <TrendingUp size={16} />,
    href: "/dashboard",
  },
  {
    id: "shopping-behaviour",
    label: "Shopping Behaviour",
    icon: <ShoppingCart size={16} />,
    href: "/dashboard",
  },
  {
    id: "jtbd",
    label: "JTBD",
    icon: <Target size={16} />,
    href: "/jtbd",
  },
  {
    id: "root-cause",
    label: "Root Cause Analysis",
    icon: <GitBranch size={16} />,
    href: "/dashboard",
  },
  {
    id: "opportunity-finder",
    label: "Opportunity Finder",
    icon: <Lightbulb size={16} />,
    href: "/opportunity-finder",
  },
];

const workspaceNavLinks: NavLinkDef[] = [
  {
    id: "reports",
    label: "Reports",
    icon: <FileText size={16} />,
    href: "/dashboard",
  },
  {
    id: "data-sources",
    label: "Data Sources",
    icon: <Database size={16} />,
    href: "/dashboard",
  },
  {
    id: "settings",
    label: "Settings",
    icon: <Settings size={16} />,
    href: "/dashboard",
  },
];

function getActiveItem(pathname: string): NavItem {
  if (pathname.startsWith("/jtbd")) return "jtbd";
  if (pathname.startsWith("/opportunity-finder")) return "opportunity-finder";
  return "dashboard";
}

export default function Sidebar() {
  const pathname = usePathname();
  const activeItem = getActiveItem(pathname);

  return (
    <aside
      style={{
        width: "var(--sidebar-width)",
        minHeight: "100vh",
        background: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "20px 20px 16px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: 36,
              height: 36,
              background: "var(--gold)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Zap size={20} color="#1C1C1C" fill="#1C1C1C" />
          </div>
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 16,
                color: "var(--text-primary)",
                lineHeight: 1.2,
              }}
            >
              Insight AI
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                fontWeight: 400,
              }}
            >
              Product Research
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 2 }}>
          {mainNavLinks.map((link) => {
            const isActive = activeItem === link.id;
            return (
              <li key={link.id}>
                <Link
                  href={link.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    borderRadius: 8,
                    fontSize: 13.5,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "#1C1C1C" : "var(--text-secondary)",
                    background: isActive ? "var(--gold)" : "transparent",
                    textDecoration: "none",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLAnchorElement).style.background =
                        "var(--bg-main)";
                      (e.currentTarget as HTMLAnchorElement).style.color =
                        "var(--text-primary)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLAnchorElement).style.background =
                        "transparent";
                      (e.currentTarget as HTMLAnchorElement).style.color =
                        "var(--text-secondary)";
                    }
                  }}
                >
                  <span style={{ opacity: isActive ? 1 : 0.7 }}>{link.icon}</span>
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Workspace section */}
        <div style={{ marginTop: 20 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.1em",
              color: "var(--text-muted)",
              padding: "0 12px",
              marginBottom: 6,
            }}
          >
            WORKSPACE
          </div>
          <ul
            style={{
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {workspaceNavLinks.map((link) => (
              <li key={link.id}>
                <Link
                  href={link.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    borderRadius: 8,
                    fontSize: 13.5,
                    fontWeight: 400,
                    color: "var(--text-secondary)",
                    background: "transparent",
                    textDecoration: "none",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "var(--bg-main)";
                    (e.currentTarget as HTMLAnchorElement).style.color =
                      "var(--text-primary)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "transparent";
                    (e.currentTarget as HTMLAnchorElement).style.color =
                      "var(--text-secondary)";
                  }}
                >
                  <span style={{ opacity: 0.7 }}>{link.icon}</span>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Help Center */}
      <div style={{ padding: "12px 8px", borderTop: "1px solid var(--border)" }}>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            borderRadius: 8,
            fontSize: 13.5,
            fontWeight: 500,
            color: "var(--text-secondary)",
            background: "var(--bg-main)",
            border: "none",
            cursor: "pointer",
            width: "100%",
            transition: "all 0.15s ease",
          }}
        >
          <HelpCircle size={16} />
          Help Center
        </button>
      </div>
    </aside>
  );
}
