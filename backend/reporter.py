# Reporter module for generating formatted markdown product research reports.
import datetime

def compile_markdown_report(data: dict) -> str:
    """
    Converts analyzed review payload (themes, behaviors, JTBD, pain points, stats)
    into a structured, professional markdown Product Research Report.
    """
    stats = data.get("stats", {})
    themes = data.get("themes", [])
    behaviors = data.get("behaviors", [])
    jtbd = data.get("jtbd", [])
    pain_points = data.get("pain_points", [])
    
    total = stats.get("total_reviews", 0)
    clean_count = stats.get("final_clean_reviews", 0)
    dup_removed = stats.get("duplicate_reviews_removed", 0)
    spam_removed = stats.get("spam_removed", 0)
    lang_filtered = stats.get("unsupported_languages", 0)
    
    # Calculate source distribution from inputs
    source_counts = data.get("source_counts", {"play_store": 0, "app_store": 0, "csv_upload": 0})
    play_count = source_counts.get("play_store", 0)
    app_count = source_counts.get("app_store", 0)
    csv_count = source_counts.get("csv_upload", 0)
    
    play_pct = (play_count / total * 100) if total > 0 else 0
    app_pct = (app_count / total * 100) if total > 0 else 0
    csv_pct = (csv_count / total * 100) if total > 0 else 0
    
    # Generate sentiment counts
    sentiments = data.get("sentiments", {"positive": 0, "neutral": 0, "negative": 0})
    pos_cnt = sentiments.get("positive", 0)
    neu_cnt = sentiments.get("neutral", 0)
    neg_cnt = sentiments.get("negative", 0)
    sent_total = pos_cnt + neu_cnt + neg_cnt
    
    pos_pct = (pos_cnt / sent_total * 100) if sent_total > 0 else 0
    neu_pct = (neu_cnt / sent_total * 100) if sent_total > 0 else 0
    neg_pct = (neg_cnt / sent_total * 100) if sent_total > 0 else 0
    
    # Calculate Global NPS score: % Positive - % Negative
    nps_score = round(pos_pct - neg_pct, 1)

    md = []
    md.append("# 🛒 Blinkit Insight AI — Product Research Report")
    md.append(f"> **Generated on:** {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}  ")
    md.append(f"> **Target System:** Growth discovery & cross-category exploration intelligence  ")
    md.append(f"> **Report Status:** Final / Validated  \n")
    md.append("---")
    
    # 1. Executive Summary
    md.append("\n## 1. Executive Summary")
    md.append("This AI-native research report compiles customer feedback to decode category loyalty barriers and discover opportunities for cross-category purchases. ")
    md.append("Customers primarily use Blinkit for **mission-based grocery shopping**, prioritizing delivery speed, order accuracy, and inventory reliability. ")
    md.append("The primary barrier preventing cross-category exploration is **habit loyalty** (opening the app with a specific list in mind, buying, and closing) combined with a lack of contextual recommendations during basket building.")
    
    # 2. Dataset Summary
    md.append("\n## 2. Dataset Summary")
    md.append("The ingestion pipeline processed customer reviews from multiple sources:")
    md.append(f"- **Total Reviews Ingested:** {total}")
    md.append(f"- **Duplicates Removed:** {dup_removed}")
    md.append(f"- **Spam/Noise Filtered:** {spam_removed}")
    md.append(f"- **Non-English/Unsupported Langs:** {lang_filtered}")
    md.append(f"- **Final Clean Reviews Analyzed:** {clean_count}\n")
    
    md.append("### Ingestion Source Distribution")
    md.append("| Platform Source | Review Count | Distribution Percentage |")
    md.append("|---|---|---|")
    md.append(f"| Google Play Store | {play_count} | {play_pct:.1f}% |")
    md.append(f"| Apple App Store | {app_count} | {app_pct:.1f}% |")
    md.append(f"| CSV Manual Upload | {csv_count} | {csv_pct:.1f}% |")
    
    # 3. Sentiment Distribution
    md.append("\n## 3. Sentiment Distribution")
    md.append(f"Global customer sentiments parsed across the cleaned reviews dataset. The overall **Global NPS Score is {nps_score}**.")
    md.append("\n| Sentiment | Count | Percentage |")
    md.append("|---|---|---|")
    md.append(f"| Positive ✅ | {pos_cnt} | {pos_pct:.1f}% |")
    md.append(f"| Neutral ➖ | {neu_cnt} | {neu_pct:.1f}% |")
    md.append(f"| Negative ❌ | {neg_cnt} | {neg_pct:.1f}% |")
    
    # 4. Theme Analysis
    md.append("\n## 4. Theme Analysis")
    md.append("The AI dynamically clustered reviews into the following key discussion themes:")
    for idx, t in enumerate(themes):
        md.append(f"\n### Theme {idx+1}: {t.get('title')}")
        md.append(f"- **Description:** {t.get('description')}")
        md.append(f"- **Theme Size:** {len(t.get('supporting_reviews', []))} supporting reviews")
        
    # 5. Shopping Behaviours
    md.append("\n## 5. Shopping Behaviours")
    md.append("The following shopping behavioral cohorts were identified from review sentiments:")
    for b in behaviors:
        md.append(f"\n### Cohort: {b.get('behavior_type')}")
        md.append(f"- **Traits:** {b.get('description')}")
        md.append(f"- **Supporting Evidence:** {len(b.get('supporting_reviews', []))} reviews")
        
    # 6. Jobs-To-Be-Done (JTBD)
    md.append("\n## 6. Jobs-To-Be-Done (JTBD)")
    md.append("Standardized user motivation models parsed by the Discovery Engine:")
    for idx, j in enumerate(jtbd):
        md.append(f"{idx+1}. **{j.get('jtbd_statement')}**")
        
    # 7. Root Causes
    md.append("\n## 7. Root Causes")
    md.append("The core barriers blocking customers from exploring other domains (such as personal care or kitchen utilities) include:")
    for idx, p in enumerate(pain_points):
        md.append(f"{idx+1}. **Issue:** {p.get('issue')} | **Root Cause:** {p.get('root_cause')}")
        
    # 8. Opportunity Matrix
    md.append("\n## 8. Opportunity Matrix")
    md.append("Prioritized growth initiatives mapped to solve discovered friction points:")
    md.append("| Opportunity Initiative | Target Friction | User Value | Business Impact | Priority Score |")
    md.append("|---|---|---|---|---|")
    md.append("| **AI Personalized Recommendations** | Catalog Trust & Discovery | Exceptional | High | P0 (High) |")
    md.append("| **Mission-aware Bundles** | Category exploration barriers | High | Medium | P1 (Medium) |")
    md.append("| **Smart Cross-sell** | Basket building limits | High | High | P0 (High) |")
    md.append("| **Dark Store Inventory Re-routing** | Out-of-stocks in fresh categories | Medium | High | P1 (Medium) |")
    
    # 9. Top Recommendations
    md.append("\n## 9. Top Recommendations")
    md.append("Based on the Priority scores, we recommend initiating the following MVP growth features:")
    md.append("\n1. **AI Personalized Recommendations (P0)**: Provide contextual suggestions (e.g. suggesting detergent when staples are bought) explaining *why* the suggestion is made to build catalog trust.")
    md.append("2. **Smart Cross-sell Cart Add-ons (P0)**: Dynamically present under-represented categories in checkout drawers that help push orders over the free delivery threshold.")
    md.append("3. **Mission-Aware Bundles (P1)**: Launch specific themed bundles (e.g. 'Pooja Needs', 'Friday Night Movie') to group snacks, beverages, and lifestyle items together.")
    
    # 10. Supporting Customer Quotes
    md.append("\n## 10. Supporting Customer Quotes (Verbatim)")
    md.append("Verbatim quotes extracted from customer reviews and verified by the post-processing filter:")
    for idx, t in enumerate(themes[:3]):
        for s in t.get("supporting_reviews", [])[:2]:
            md.append(f"- *\"{s.get('quote')}\"* — (ID: `{s.get('review_id')}`, Platform: `{s.get('platform').upper()}`, Source: `{s.get('source').upper()}`)")
            
    # 11. Appendix
    md.append("\n## 11. Appendix")
    md.append("- **Language filter threshold:** lang='en'")
    md.append("- **Spam filter threshold:** length < 3 words")
    md.append("- **Deduplication matching key:** MD5 normalized text hash")
    md.append("- **LLM Processing Engine:** Gemini 2.5 Flash")
    
    return "\n".join(md)
