# 📅 Blinkit Insight AI — Phase-wise Implementation Plan (Production Web App)

> **Document Type:** Project Implementation Plan & PRD Alignment  
> **Project:** Blinkit Insight Analyser (Multi-Source AI Discovery Engine)  
> **Dependencies:** [Problem Statement](file:///d:/PM%20Fellowship%20(Projects)/1_Grad_Project/BlinkIt%20Insight%20Analyser/Docs/problemStatement.md)  
> **Context:** Optimized for PM Fellowship deliverables, describing a production-ready web application with high business impact and zero unnecessary machine learning infrastructure overhead.

---

## 🗺️ Roadmap Overview

The implementation of **Blinkit Insight AI** is designed around an AI-native agentic backend exposed via a FastAPI REST API and visualised on a Next.js/Tailwind CSS frontend web application. Rather than a single Play Store review analyzer, Blinkit Insight AI is built as a **Multi-Source AI Discovery Engine** capable of parsing diverse customer inputs.

```mermaid
gantt
    title Production-Ready Multi-Source AI Discovery Engine Schedule
    dateFormat  YYYY-MM-DD
    section Project Setup
    Phase 0: Project Setup & Init               :active, p0, 2026-07-15, 2d
    section Processing & Ingestion
    Phase 1: Multi-Source Review Ingestion      : p1, after p0, 4d
    Phase 2: Validation & Preprocessing Pipeline : p2, after p1, 4d
    section AI Processing
    Phase 3: AI Review Analysis & Validation     : p3, after p2, 5d
    Phase 4: Opportunity Discovery & Scoring     : p4, after p3, 4d
    Phase 5: PM Report Generation Service        : p5, after p4, 3d
    section Product Delivery
    Phase 6: AI-Native MVP Development (Fullstack): p6, after p5, 5d
    Phase 7: Deployment & Cloud Validation       : p7, after p6, 3d
```

---

## ⚙️ Phase 0: Project Setup & Initialization

### 🎯 Objective
Initialize the production repository, define the client-server scaffolding, configure environment variables, and establish dependencies.

### 🛠️ Tasks
1. **Scaffold Web Application Directory:**
   - Organize project folders:
     - `/backend` (FastAPI, Python scripts, LLM analyzer logic)
       - `main.py` (App entrypoint & API endpoints)
       - `config.py` (API keys, CORS settings, threshold limits)
       - `collector.py` (Multi-Source review scrapers & file ingestion parsers)
       - `processor.py` (Cleaning, deduplication, PII masking)
       - `analyzer.py` (Gemini API schema parsing, thematic clustering, analysis)
       - `reporter.py` (Markdown compiler)
     - `/frontend` (Next.js, React components, Tailwind CSS styling)
       - `/src/app` (Next.js App Router views)
       - `/src/components` (Dashboard widgets, upload dialogs, insight view elements)
     - `/Docs` (Product requirement documents, implementation plans, and architecture)
2. **Environment Configuration:**
   - Define a backend configuration module (`config.py`) to manage API keys, database paths, and CORS configuration.
   - Configure a frontend configuration block to target the production FastAPI server.
3. **Dependency Initialization:**
   - Create `/backend/requirements.txt` containing `fastapi`, `uvicorn`, `google-generativeai`, `pandas`, `langdetect`, `python-dotenv`, `google-play-scraper`, `app-store-scraper`.
   - Setup `/frontend/package.json` with `next`, `react`, `tailwindcss`, `lucide-react`, `recharts`, `axios`.

### 📦 Deliverables
- Fully scaffolded directory structure.
- Initialized Backend (`requirements.txt`) and Frontend (`package.json`) dependencies.
- Project environment setup configuration files (`.env.example`).

### 🧪 Validation Checkpoints
- [ ] Backend runs locally on port `8000` with basic healthcheck endpoint.
- [ ] Frontend boots on port `3000` showing boilerplate index page.
- [ ] Environment variables load successfully without exceptions.

---

## 📥 Phase 1: Multi-Source Review Ingestion

### 🎯 Objective
Build a unified ingestion layer capable of automatically gathering Multi-Source Customer Feedback across multiple formats, establishing reliable primary scraper paths (Google Play & Apple App Store) and a manual CSV fallback.

### 🛠️ Ingestion Methods Support Matrix
- **Primary Sources (MVP - Active Support):**
  - Google Play Store Reviews (auto-collected via App ID or URL)
  - Apple App Store Reviews (auto-collected via App ID or URL)
- **Fallback (MVP - Active Support):**
  - CSV File Upload (graceful fallback if automatic collection fails or is offline)
- **Future Sources (Extensible Architecture):**
  - Reddit Discussions
  - Community Forums
  - Social Media Conversations
  - Product Reviews

### 🛠️ Tasks
1. **Google Play Store Collector:**
   - Accept Google Play Store URL or App ID (e.g., `com.grofers.customerapp`).
   - Fetch public reviews automatically.
   - Normalize review structure to match the unified schema.
2. **Apple App Store Collector:**
   - Accept Apple App Store URL or App ID.
   - Fetch public reviews automatically.
   - Normalize review structure to match the unified schema.
3. **CSV Upload Ingestion (MVP Fallback):**
   - Support manual review uploads when automatic collectors fail or are restricted.
   - Parse CSV contents and validate schema formatting before ingestion.
4. **Review Normalization Engine:**
   - Convert all feedback from all sources into a unified review schema dictionary:
     ```json
     {
       "review_id": "str",
       "review_text": "str",
       "rating": "int",
       "source": "str",       // e.g. "play_store", "app_store", "csv_upload"
       "timestamp": "str",
       "username": "str",
       "platform": "str"       // e.g. "android", "ios", "web", "unknown"
     }
     ```

### 📦 Deliverables
- Collection module `collector.py` supporting URL/App ID scraping for Google Play & App Store, and manual CSV upload fallback.
- Standardized parser mapping inputs to the unified normalization schema.
- Test CSV file matching the required validation structure.

### 🧪 Validation Checkpoints
- [ ] Play Store reviews can be successfully fetched and normalized.
- [ ] App Store reviews can be successfully fetched and normalized.
- [ ] CSV upload works properly when automatic ingestion is skipped or fails.
- [ ] All ingestion sources (Play Store, App Store, CSV) produce the same normalized schema structure.

---

## 🧼 Phase 2: Data Validation & Preprocessing

### 🎯 Objective
Verify the integrity of input reviews and perform text cleaning to strip noise, redact PII, remove emojis, and standardize text layout.

### 🛠️ Tasks
1. **Deduplication:**
   - Compare hashes of review texts to identify and remove duplicates.
2. **Spam & Noise Filtering:**
   - Discard reviews that fall below 3 words (e.g., "nice", "ok app", "good").
   - Filter reviews containing exclusively spam URLs, promotions, or generic code sequences.
3. **Language Detection & Text Normalization:**
   - Detect non-English strings using `langdetect`.
   - Remove emojis, strip excess whitespaces, and convert text to lowercase.
4. **PII Masking:**
   - Apply regex patterns to mask sensitive data, substituting emails, phone numbers, and address patterns with standard tokens (e.g., `[REDACTED_EMAIL]`).

### 📦 Deliverables
- Preprocessing utility file `processor.py`.
- Automated test scripts validating PII masking and spam rejection thresholds.

### 🧪 Validation Checkpoints
- [ ] Duplicate comments are resolved to a single record.
- [ ] Emojis are successfully removed without corrupting surrounding words.
- [ ] Sensitive identifiers are masked out of test inputs.

---

## 🧠 Phase 3: AI Review Analysis

### 🎯 Objective
Leverage Google Gemini to extract customer insights, classify sentiments, identify behaviors, cluster themes, and validate supporting evidence.

### 🛠️ Tasks
1. **Sentiment Classification:**
   - Score clean reviews into Positive, Neutral, or Negative buckets.
2. **Dynamic Theme Detection & Semantic Clustering:**
   - Utilize Gemini's large context window to process batches of reviews.
   - Direct the AI to dynamically identify recurring themes based on feedback patterns, assigning unique Theme IDs and tracking theme sizes.
3. **Shopping Behaviour & JTBD Extraction:**
   - Program the LLM to identify specific shopping behaviors (e.g., category loyalty, search-first, speed-prioritization).
   - Formulate clear, user-centric Jobs-To-Be-Done (JTBD) statements.
4. **Pain Point & Root Cause Identification:**
   - Instruct the AI to analyze cluster complaints to discover underlying friction points and root causes.
5. **Evidence Validation (Critical Constraint):**
   - Enforce a strict validation rule: every theme, behavior, and pain point must be backed by original **Review IDs**, **verbatim Customer Quotes**, and **Origin Source Platform**.
   - Implement post-processing rules to verify that quoted strings exist in the raw dataset. The AI must never generate unsupported conclusions.

### 📦 Deliverables
- Analytics orchestration script `analyzer.py`.
- Prompt templates for multi-stage review analysis.
- Validation function that asserts quotes exist in the input dataset.

### 🧪 Validation Checkpoints
- [ ] Discovered themes are dynamically generated based on review text.
- [ ] All generated insights include valid, verified review ID and source references.
- [ ] No phantom quotes or unsupported conclusions are output.

---

## 💡 Phase 4: Opportunity Discovery

### 🎯 Objective
Translate discovered pain points and user behaviors into prioritized product growth opportunities with structured impact scores.

### 🛠️ Tasks
1. **Growth PM Opportunity Synthesis:**
   - Feed the synthesized themes, root causes, and behaviors to Gemini with a structured prompt.
   - Instruct the AI to act as a Lead Growth Product Manager, generating concrete product solutions that address category exploration barriers.
2. **Structured Prioritization Scoring:**
   - For every product opportunity generated, the AI must calculate:
     - **User Value:** Impact on user experience (High/Medium/Low).
     - **Business Impact:** Impact on cross-category MAC and CLTV (High/Medium/Low).
     - **Confidence Level:** Data backing quality (High/Medium/Low).
     - **Implementation Effort:** Complexity to build (High/Medium/Low).
     - **Priority Score:** A calculated score based on `(User Value + Business Impact) / Implementation Effort`.
3. **Top 3 Recommendations Selection:**
   - Filter and rank all opportunities by Priority Score.
   - Explicitly highlight the **Top 3 opportunities** recommended for the MVP.

### 📦 Deliverables
- Opportunity scoring module in `analyzer.py`.
- Standardized prompt templates for opportunity generation and prioritizing.

### 🧪 Validation Checkpoints
- [ ] Each opportunity maps to a structured JSON output with all 5 metrics scored.
- [ ] Top 3 recommendations are clearly separated and ranked at the head of the output list.

---

## 📄 Phase 5: PM Report Generation

### 🎯 Objective
Synthesize all analyzed customer patterns and opportunities into a professional, readable, publication-ready research report.

### 🛠️ Tasks
1. **Compile Product Research Report:**
   - Write formatting rules in `reporter.py` to compile analyzed JSON payloads into Markdown format.
   - The output report must strictly follow this structure:
     - **Executive Summary:** Overview of results, primary categories to target, and top takeaways.
     - **Dataset Summary:** Review counts, source distributions, and date ranges. **Must explicitly include:**
       - Total Reviews
       - Play Store Review Count
       - App Store Review Count
       - CSV Review Count
       - Source Distribution (Percentage breakdown)
     - **Sentiment Distribution:** Quantitative summary table of user sentiment.
     - **Theme Analysis:** Ranked list of dynamic themes with counts.
     - **Shopping Behaviours:** Behavioral traits matched with customer exploration habits.
     - **Jobs-To-Be-Done (JTBD):** Standardized JTBD lists.
     - **Root Causes:** Core barriers blocking category migration.
     - **Opportunity Matrix:** Prioritized opportunities with User Value, Business Impact, Effort, and Priority Scores.
     - **Top Recommendations:** In-depth breakdown of the Top 3 recommended MVP initiatives.
     - **Supporting Customer Quotes:** Clean index of quotes mapped to review IDs and origin source reference (e.g. Play Store, App Store, CSV).
     - **Appendix:** System parameters, prompt metadata, and runtime details.
2. **File Export Service:**
   - Save reports to `/Docs/productResearchReport.md`.

### 📦 Deliverables
- Formatting engine `reporter.py`.
- Formatted markdown report output.

### 🧪 Validation Checkpoints
- [ ] The generated report contains all 11 required structural sections.
- [ ] Dataset Summary accurately counts and lists Play Store, App Store, and CSV inputs.
- [ ] Insights and quotes clearly identify which platform source they originated from.

---

## 💻 Phase 6: AI-Native MVP Development

### 🎯 Objective
Develop the production-ready fullstack application, building APIs, connecting frontend modules with backend endpoints, and integrating error handlers.

### 🛠️ Tasks
1. **FastAPI Backend Server Implementation:**
   - Set up API routes in `main.py`:
     - `POST /api/analyze/scrape/play-store`: Initiates analysis using Google Play Store App ID / URL.
     - `POST /api/analyze/scrape/app-store`: Initiates analysis using Apple App Store ID / URL.
     - `POST /api/analyze/upload`: Initiates analysis using manual CSV file upload.
     - `GET /api/history`: Returns historical run metrics.
     - `GET /api/report/{run_id}`: Returns the compiled markdown research report.
2. **Google Gemini API Integration:**
   - Connect the AI analysis service to the production Gemini API, enforcing JSON schemas for output parsing.
3. **Next.js & Tailwind CSS Frontend Implementation:**
   - Implement landing interface featuring:
     - URL/App ID inputs for Play Store and App Store + drag-and-drop CSV upload card.
     - Interactive sentiment metrics dashboard with source breakdowns.
     - Prioritized opportunity cards showcasing the Opportunity Matrix and Top 3 Recommendations.
     - Report viewer tab rendering the markdown document.
4. **E2E Integration & Error Handling:**
   - Implement error middleware to catch and return helpful messages for API rate limits, invalid input files, and processing timeout errors.
   - Establish loading UI spinners in the Next.js frontend during backend analysis.

### 📦 Deliverables
- Working backend code exposing REST APIs.
- Next.js frontend integrated with the backend API endpoints.
- Integration tests simulating client-server analysis runs.

### 🧪 Validation Checkpoints
- [ ] Backend API endpoints process data and return structured outputs.
- [ ] Frontend triggers analysis and renders cards based on the REST API response.
- [ ] API exceptions (such as expired keys or empty datasets) are caught and shown to the user without crashing the server.

---

## 🚀 Phase 7: Deployment & Cloud Validation

### 🎯 Objective
Deploy the web application to cloud platforms and run E2E validation against real-world datasets to ensure production readiness.

### 🛠️ Tasks
1. **Deployment Architecture Setup:**
   - **Frontend:** Build and deploy the Next.js app to **Vercel**.
   - **Backend:** Host the FastAPI app on **Railway**, configuring a live worker service.
2. **Configure Environment Variables:**
   - In **Vercel** dashboard, configure:
     - `NEXT_PUBLIC_API_URL` (URL of the Railway backend service)
   - In **Railway** dashboard, configure:
     - `GEMINI_API_KEY` (Production API token)
     - `ALLOWED_ORIGINS` (Vercel deployment URL)
3. **Deployment Validation Check:**
   - Run a live automated test by scraping a public app (e.g., Blinkit Play Store ID: `com.grofers.customerapp` or App Store equivalent).
   - Validate API performance, latency, and page loads on production URLs.
4. **Public Workflow Reference:**
   - Document the public Antigravity workflow linking the deployed frontend with the background analysis engine.

### 📦 Deliverables
- Live Railway Backend URL.
- Live Vercel Frontend URL.
- Working Cloud AI Discovery Engine.
- Public Antigravity workflow link.

### 🧪 Validation Checkpoints
- [ ] Railway backend is live and accepts incoming requests from the frontend.
- [ ] Next.js app successfully displays scraped reviews and generates opportunities in production.
- [ ] Both URLs are verified public and load successfully.

---

## 📊 Success Metrics

The performance and impact of the Blinkit Insight AI engine will be monitored using the following framework:

### 1. North Star Metric
- **Category Migration Rate:** Percentage of Monthly Active Customers (MAC) who purchase from at least one new category every month.

### 2. Supporting Metrics
- **Theme Detection Accuracy:** Match rate between AI-generated theme labels and manual PM audit checks (target: >85%).
- **Insight Confidence:** Average confidence score output by the LLM (target: >0.80).
- **Report Generation Time:** Total seconds to run the E2E pipeline for 500 reviews (target: <45 seconds).
- **Analysis Completion Rate:** Percentage of started runs that complete successfully without errors (target: >98%).
- **API Response Time:** Average latency for API requests (target: <2.5 seconds for UI elements, <30 seconds for full runs).

### 3. Guardrail Metrics
- **Failed Analysis Rate:** Frequency of runs that abort due to parsing, token limit, or rate limit failures (target: <2%).
- **Invalid Insight Rate:** Generated opportunities lacking valid supporting quotes or review IDs (target: 0%).
- **Processing Errors:** Percentage of raw reviews discarded due to formatting issues (target: <5%).
- **API Failure Rate:** Count of failed connection attempts to external services (target: <1%).
Cwd:
