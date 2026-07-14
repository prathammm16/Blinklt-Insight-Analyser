# 🛒 Blinkit Insight AI — Problem Statement

> **Document Type:** Product Problem Statement  
> **Project:** Blinkit Insight Analyser  
> **Team:** Growth Product  
> **Last Updated:** 2026-07-14  
> **Status:** Active

---

## Overview

Blinkit has become a core part of millions of users' weekly shopping routines by delivering groceries, snacks, beverages, and household essentials at ultra-fast speed. However, as users grow comfortable with the platform, their purchasing behavior becomes **increasingly repetitive** — they stick to familiar categories and rarely explore Blinkit's broader catalog, which spans:

| Domain | Examples |
|---|---|
| Food & Grocery | Staples, Fresh Produce, Snacks |
| Personal & Baby Care | Skincare, Baby Food, Diapers |
| Home & Kitchen | Cleaning Supplies, Kitchen Essentials |
| Lifestyle | Pet Supplies, Electronics, Sports |
| Beverages | Juices, Soft Drinks, Water |

This **category loyalty problem** limits cross-sell opportunities, suppresses revenue diversity, and reduces long-term **Customer Lifetime Value (CLTV)**.

---

## 🎯 Business Goal

> **Increase the percentage of Monthly Active Customers (MAC) who purchase from at least one new category every month.**

### Example Cross-Category Journeys

- Grocery buyers → Personal Care
- Snack buyers → Beverages
- Household Essentials buyers → Baby Care
- Grocery users → Pet Supplies
- Existing customers → Kitchen Essentials

---

## 🧩 Problem Being Solved

The Growth Product team needs to understand:

1. **Why** do customers repeatedly shop from the same categories?
2. **What barriers** prevent exploration of new categories?
3. **How** do users currently discover new products?
4. **What information** do customers need before trying something new?
5. **Which user segments** are most likely to experiment?
6. **What frustrations** appear repeatedly across platforms?

Currently, answering these questions requires **manual review of hundreds or thousands of customer feedback entries** across multiple platforms — a process that is slow, inconsistent, and unscalable.

---

## 💡 Proposed Solution

Build **Blinkit Insight AI** — an AI-powered Product Discovery and Review Intelligence system that automatically analyzes customer feedback at scale, surfaces recurring pain points, behaviors, and opportunities, and delivers structured, evidence-backed PM insights.

> Instead of manually reading reviews, Product Managers receive ready-to-use, structured insights directly supporting product decisions and growth initiatives.

---

## 🛠️ System Responsibilities

### 1. Data Collection
- Collect customer reviews from public sources
- Support **manual CSV upload** for MVP
- Future: direct API integrations

### 2. Data Cleaning
- Remove duplicate reviews
- Filter spam and irrelevant content
- Normalize review text
- Handle multilingual reviews

### 3. Sentiment Analysis
Classify reviews into:
- ✅ Positive
- ➖ Neutral
- ❌ Negative

Generate overall sentiment distribution across the dataset.

### 4. Theme Detection *(AI-driven, not rule-based)*
Automatically surface recurring discussion topics, e.g.:
- Shopping habits & routines
- Product discovery experience
- Recommendation quality
- Delivery experience
- Pricing concerns
- Trust and brand unfamiliarity
- Product availability
- Search experience

> The system must **discover themes dynamically** using AI — not rely on predefined categories.

### 5. Theme Clustering
Group similar reviews into meaningful patterns.

**Example:**

| Raw Reviews | Clustered Theme |
|---|---|
| "Recommendations are irrelevant" | **Poor Recommendation Quality** |
| "Suggestions don't match my needs" | **Poor Recommendation Quality** |
| "I always ignore recommendations" | **Poor Recommendation Quality** |

### 6. Shopping Behaviour Detection
Identify common customer behaviors:
- Repeat purchasing
- Mission-driven shopping (open app → buy → close)
- Search-first behavior
- Low browsing / exploration activity
- Category loyalty
- Price-sensitive shopping

### 7. Jobs-To-Be-Done (JTBD) Extraction
Extract the underlying job behind shopping behavior.

**Example JTBD:**
> *"When I open Blinkit, I want to complete my weekly grocery shopping as quickly as possible without wasting time exploring products."*

### 8. Root Cause Analysis
Identify **why** observed behaviors exist:
- Customers prioritize speed over exploration
- Lack of trust in unknown brands
- Information overload
- Poor personalization
- Limited contextual recommendations

### 9. Opportunity Identification
Surface product opportunities that could increase category discovery:
- AI-powered personalized recommendations
- Mission-aware suggestions
- Smart shopping bundles
- Lifestyle-based recommendations
- Educational product cards
- Trust-building recommendation explanations

### 10. PM Insight Generation
Generate structured product insights supported by **real customer evidence**.

Each insight must include:

| Field | Description |
|---|---|
| **Insight Title** | A concise, actionable title |
| **Supporting Reviews** | Direct quotes from customers |
| **Business Impact** | Effect on growth/revenue |
| **User Impact** | Effect on user experience |
| **Confidence Level** | High / Medium / Low |

> ⚠️ The system must **never generate unsupported conclusions**.

---

## 📊 Output: PM Research Report

The Discovery Engine generates a structured Product Management research report containing:

1. Dataset Summary
2. Source Distribution
3. Sentiment Analysis
4. Top Themes & Theme Frequency
5. User Pain Points
6. Shopping Behaviors
7. Jobs-To-Be-Done
8. Root Causes
9. Opportunity Areas
10. Product Recommendations
11. Executive Summary

---

## 📡 Data Sources

| Source | Type | MVP Status |
|---|---|---|
| Google Play Store Reviews | App Reviews | ✅ Supported |
| Apple App Store Reviews | App Reviews | ✅ Supported |
| Reddit Discussions | Community Forums | ✅ Supported |
| Community Forums | Misc. Forums | ✅ Supported |
| Social Media Conversations | Twitter/X, etc. | 🔄 Where available |
| Product Review Platforms | 3rd party sites | 🔄 Future |

The system is designed to be flexible enough to support **additional data sources in future versions**.

---

## 👥 Primary Users

| Role | Use Case |
|---|---|
| **Growth Product Managers** | Identify opportunities to increase category discovery |
| **Product Analysts** | Deep-dive on specific themes and user behaviors |
| **UX Researchers** | Supplement qualitative research with quantitative signals |
| **Customer Experience Teams** | Monitor recurring pain points |
| **Leadership Teams** | Executive-level summaries and opportunity prioritization |

---

## ✅ Success Criteria

Blinkit Insight AI will be considered successful if it can:

- [ ] Analyze hundreds to thousands of customer reviews automatically
- [ ] Meaningfully reduce manual research effort for PMs
- [ ] Identify recurring themes with high accuracy
- [ ] Generate actionable, evidence-backed product insights
- [ ] Support the Growth team in identifying opportunities to increase cross-category purchases

---

## 🚫 Non-Goals (MVP)

The MVP will **not**:

- Generate personalized recommendations for individual customers
- Modify Blinkit's production systems
- Replace primary user research (surveys, interviews)
- Make autonomous product decisions
- Predict customer behavior using historical transaction data

> It serves exclusively as a **research intelligence system** for Product Managers.

---

## 🔭 Future Scope

| Feature | Description |
|---|---|
| Real-time review monitoring | Continuous ingestion of new reviews |
| Direct Play Store integration | Automated Google Play data pull |
| Reddit API integration | Live Reddit thread analysis |
| Trend detection | Identify rising/falling themes over time |
| Competitor comparison | Benchmark against competitor reviews |
| Automated weekly reports | Scheduled insight digests |
| Dashboard visualization | Interactive PM dashboard |
| Slack / Email notifications | Alert PMs on emerging patterns |
| RAG-based knowledge retrieval | Query past insights conversationally |
| AI-powered experimentation suggestions | Recommend A/B tests based on insights |

---

## 📈 Expected Business Impact

By enabling faster and more reliable customer insight generation, Blinkit Insight AI will help the Growth team:

- 📦 **Increase cross-category purchases** among Monthly Active Customers
- 🎯 **Improve recommendation relevance** through behavioral insights
- 🔍 **Identify unmet customer needs** surfaced from real feedback
- ⚡ **Reduce manual research effort** from days to minutes
- 🏆 **Prioritize high-impact product opportunities** with evidence
- 💎 **Improve customer lifetime value** through better discovery experiences

---

*This document serves as the foundational problem context for the Blinkit Insight AI project. All product decisions should be traceable back to the goals and constraints defined here.*
