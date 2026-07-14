# 🔍 Blinkit Insight AI — Edge Case Analysis

> **Document Type:** Edge Cases & Mitigation Strategies  
> **Project:** Blinkit Insight Analyser (AI-Native Discovery Engine)  
> **Status:** Active / Operational Guide  
> **Target Audience:** Growth Product Managers, AI Engineers

---

## 1. Executive Summary

As an AI-native Discovery Engine, Blinkit Insight AI relies heavily on user-generated text inputs (Play Store scraping, community forums, CSV files) and Large Language Models (LLM). This environment introduces typical edge cases ranging from structural data formatting errors to semantic interpretation challenges (sarcasm, mixed languages, hallucinations).

This document identifies all known edge cases, estimates their business/operational impact, and defines specific mitigation strategies embedded in the AI workflow.

---

## 2. Ingestion & Collection Edge Cases (Phase 1)

| # | Edge Case Scenario | Business & System Impact | Mitigation Strategy |
|---|---|---|---|
| **1.1** | **Play Store API Rate Limiting / CAPTCHA** | Automated scraping fails; pipeline halts. | Implement auto-retry with exponential backoff. If scraping is fully blocked, prompt the PM immediately to download the reviews via a backup method and upload via the manual CSV path. |
| **1.2** | **App Not Found / Invalid App ID** | Scraping returns empty or 404 errors. | Validate the App ID format before sending network requests. Fall back gracefully to check alternative country stores if not found in the default region. |
| **1.3** | **Malformed CSV Formats** | CSV parsing crashes due to semicolon/tab delimiters or double-quote issues. | Use a smart sniffer (`csv.Sniffer()`) to detect delimiters automatically. Support fallback parsing via Pandas with multiple encoding types (e.g., `utf-8`, `latin1`, `utf-16`). |
| **1.4** | **Extremely Small Datasets (< 10 Reviews)** | AI clustering and theme detection are statistically insignificant; report looks empty. | If the dataset has fewer than 15 reviews, bypass the clustering phase entirely. Analyze the reviews as a single list, focusing on individual qualitative feedback rather than group trends. |
| **1.5** | **Extremely Large Datasets (> 10,000 Reviews)** | Exceeds LLM context windows, leading to high cost or truncated analysis. | Implement stratified sampling: sample reviews across ratings (1-5) and dates to build a representative subset of max 2,000 reviews for detailed thematic synthesis. |

---

## 3. Data Validation & Preprocessing Edge Cases (Phase 2)

| # | Edge Case Scenario | Business & System Impact | Mitigation Strategy |
|---|---|---|---|
| **2.1** | **Review Text is Emoji-Only or Blank** | Leads to empty strings after processing, causing LLM errors or meaningless "empty" reviews. | Identify reviews containing zero alphanumeric characters during preprocessing. Filter them out and count them under a "Non-textual Feedback" metadata counter. |
| **2.2** | **Hinglish / Multilingual / Code-Mixed Input** | Traditional translation tools fail; standard English LLMs might miss nuance (e.g., "delivery boy call *nahi* utha raha"). | Utilize a translation step optimized for colloquial code-mixed language (using Gemini's translation capability or specialized dictionary maps) before running thematic mapping. |
| **2.3** | **PII Redaction Over-masking (False Positives)** | Redacts useful product nouns (e.g., redacting "I want to buy Safal peas" because "Safal" looks like a name). | Train/fine-tune custom regex patterns specifically to avoid redacting category terms, brand names (e.g., Blinkit, Grofers), and common grocery words. |
| **2.4** | **Non-Standard PII Formats** | User posts their phone number as words (e.g., "nine eight double seven...") to bypass standard filters. | Implement semantic PII checks via a lightweight LLM cleaning step or advanced regex that matches word-number variations. |
| **2.5** | **HTML / Javascript Injection in Reviews** | Corrupts report generation or creates rendering exploits on markdown output. | Apply strict HTML sanitization, stripping tags (e.g., `<script>`, `<div>`) and escaping markdown characters (`#`, `*`, `|`) before saving. |

---

## 4. AI Analysis & Semantic Synthesis Edge Cases (Phase 3)

| # | Edge Case Scenario | Business & System Impact | Mitigation Strategy |
|---|---|---|---|
| **3.1** | **Sarcasm and Sentiment Mismatch** | A review saying "Amazing service, took only 3 hours to deliver milk!" with a 1-star rating gets classified as "Positive" due to words like "Amazing". | Combine text sentiment scores with the numerical rating. If rating is < 3 but sentiment is positive, flag the review for LLM verification to detect sarcasm. |
| **3.2** | **Clustering Hallucinations & Ghost Themes** | LLM invents a trend that does not exist (e.g., claiming "Many users complain about rotten apples" based on a single review). | Enforce strict threshold rules: A theme is only valid if it contains at least 3 distinct reviews from different users. Output the exact review IDs associated with the theme to verify logic. |
| **3.3** | **Unclear/Vague Reviews ("Outlier" Group Expansion)** | A massive percentage of reviews are vague ("bad app", "worst") and cluster together as a generic "App Issues" theme. | Implement a secondary LLM routing pass. Separate vague complaints into a "General Frustrations" bin and focus the main report on specific, actionable product complaints (e.g., payment failures, recommendation complaints). |
| **3.4** | **Conflicting Review Contexts** | A review states "I like the new UI, but the deliveries are always late". It belongs to both "UI updates" (Positive) and "Delivery issues" (Negative). | Allow multi-label theme assignment. The analysis pipeline should split complex reviews into sentence-level clauses before clustering them. |

---

## 5. Opportunity Discovery & PM Report Edge Cases (Phases 4 & 5)

| # | Edge Case Scenario | Business & System Impact | Mitigation Strategy |
|---|---|---|---|
| **4.1** | **Hallucinated Supporting Evidence** | The AI outputs a solid opportunity but uses fake/invented quotes that the user never wrote. | Force strict system prompt constraints: Gemini must extract quotes *verbatim* from the source text. Cross-reference generated quotes programmatically against the source dataset before publishing the report. |
| **4.2** | **Contradictory PM Opportunities** | One opportunity states "Simplify the search screen by removing category bubbles" while another suggests "Add more category bubbles to improve discovery". | The AI agent should recognize opposing feedback trends, cluster them as a "Split User Preference" insight, and suggest A/B testing rather than choosing one. |
| **4.3** | **JSON Parsing Errors on LLM Output** | LLM returns malformed JSON (truncated due to token limits or missing commas), crashing the report compiler. | 1. Use Gemini's strict Structured Outputs parameter (`response_schema`).  <br>2. Implement a JSON repair library (like `json_repair`) as a parser fallback. <br>3. Request a retry from the LLM with a shorter batch size if parsing fails twice. |
| **4.4** | **Escaping Markdown Syntax** | Reviews containing pipe characters (`|`) break generated markdown tables in the final report. | Sanitize all text fields before injection into the report by escaping markdown table syntax, backticks, and formatting markers. |

---

## 6. Execution & Runtime Edge Cases (Phase 6)

### 6.1 API Key Expiration / Rate Limits
- **Impact:** System stops generating reports mid-run.
- **Mitigation:** Execute API check at launch. Save local analysis checkpoints so that if a run crashes at Phase 4, the PM can resume the analysis from the cached output of Phase 3 without re-spending tokens.

### 6.2 Schema Drift in Play Store Scraper
- **Impact:** Google updates the Play Store HTML/API structure, breaking the automated scraper.
- **Mitigation:** The ingestion service must test the scraper monthly. If scraper tests fail, the engine must switch to CSV-only ingestion and alert the developer immediately.

### 6.3 Empty or Inconsistent Sentiment Classification
- **Impact:** Reporting dashboard shows incorrect or empty sentiment stats.
- **Mitigation:** Force default sentiment to "Neutral" if the LLM output is null, blank, or unrecognizable.

---

## 7. Edge Case Validation Checkpoints

Use the following checks during Phase 6 validation:

- [ ] **Test Case A: Zero Alphanumeric Input**
  - *Input:* CSV containing reviews like `:)`, `!!!`, `👍`.
  - *Expected Result:* Records filtered out, zero runtime crashes, report flags 0 reviews analyzed.
- [ ] **Test Case B: Hinglish Translation**
  - *Input:* `"Blinkit se dahi order kiya par delivery partner ne cancel kar diya bina bataye"`
  - *Expected Result:* Classified as Negative Sentiment, categorized under "Delivery/Order Cancellation" theme.
- [ ] **Test Case C: Malformed JSON Repair**
  - *Input:* Run a mock LLM output that is cut off (missing closing brackets).
  - *Expected Result:* JSON repair utility successfully closes the brackets, parses the partial data, and generates the report.
- [ ] **Test Case D: Over-limit Review Payload**
  - *Input:* Ingest a dataset of 12,000 reviews.
  - *Expected Result:* Script downsamples the dataset to 2,000 reviews, runs the engine successfully, and reports the downsampling in the dataset summary.
Cwd:
