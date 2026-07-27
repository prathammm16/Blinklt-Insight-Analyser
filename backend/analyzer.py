# AI Review Analysis Module using Google Gemini
import os
import re
import json
import logging
from dotenv import load_dotenv
import google.generativeai as genai

# Setup logging
logger = logging.getLogger("Analyzer")
logger.setLevel(logging.INFO)

# Load environment variables
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    load_dotenv(os.path.join(backend_dir, ".env"))
    API_KEY = os.getenv("GEMINI_API_KEY")

if API_KEY:
    genai.configure(api_key=API_KEY)
else:
    logger.warning("GEMINI_API_KEY not found in environment or .env file.")

def get_generative_model():
    """
    Returns an instantiated GenerativeModel trying candidates in order.
    """
    candidates = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.0-flash"]
    for cand in candidates:
        try:
            return genai.GenerativeModel(cand)
        except Exception:
            continue
    return genai.GenerativeModel("gemini-1.5-flash")

def classify_sentiments(reviews: list[dict], batch_size: int = 50) -> list[dict]:
    """
    Classifies sentiments for all reviews in batches of batch_size using gemini-2.5-flash or fallback.
    Adds a 'sentiment' key ('positive', 'neutral', 'negative') to each review dictionary.
    """
    if not API_KEY:
        logger.error("Cannot classify sentiments: GEMINI_API_KEY is not set.")
        # Fallback to simple default sentiment for testing
        for r in reviews:
            r["sentiment"] = "neutral"
        return reviews
        
    logger.info(f"Classifying sentiments for {len(reviews)} reviews in batches of {batch_size}.")
    model = get_generative_model()
    
    classified_reviews = []
    
    # Process in batches
    for i in range(0, len(reviews), batch_size):
        batch = reviews[i:i+batch_size]
        batch_payload = [{"review_id": r["review_id"], "review_text": r["review_text"]} for r in batch]
        
        prompt = f"""
You are an expert sentiment classification agent. Your task is to analyze the sentiment of each customer review in the input list.
Classify each review as exactly one of: POSITIVE, NEUTRAL, or NEGATIVE.

Input JSON reviews list:
{json.dumps(batch_payload, indent=2)}

You MUST respond with a valid JSON array of objects containing only "review_id" and "sentiment" fields. E.g.:
[
  {{"review_id": "r1", "sentiment": "POSITIVE"}},
  {{"review_id": "r2", "sentiment": "NEGATIVE"}}
]
"""
        try:
            response = model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            
            # Parse the response
            results = json.loads(response.text)
            
            # Create mapping for fast lookup
            sentiment_map = {}
            for res in results:
                ref_id = res.get("review_id")
                sent_val = str(res.get("sentiment", "neutral")).lower().strip()
                if sent_val not in {"positive", "neutral", "negative"}:
                    sent_val = "neutral"
                sentiment_map[ref_id] = sent_val
                
            # Merge back into batch reviews
            for r in batch:
                r["sentiment"] = sentiment_map.get(r["review_id"], "neutral")
                classified_reviews.append(r)
                
            logger.info(f"Processed sentiment batch: {len(batch)} items.")
        except Exception as e:
            logger.error(f"Error classifying sentiment batch starting at index {i}: {str(e)}")
            # Fallback for failed batch
            for r in batch:
                r["sentiment"] = "neutral"
                classified_reviews.append(r)
                
    return classified_reviews

def verify_quote(quote: str, review_text: str) -> bool:
    """
    Strict evidence validation helper.
    Returns True if the quote is a verbatim substring of review_text, ignoring casing and extra whitespace.
    """
    if not quote or not review_text:
        return False
        
    # Standardize whitespace and casing
    q_norm = " ".join(quote.lower().strip().split())
    r_norm = " ".join(review_text.lower().strip().split())
    
    # Strip any enclosing punctuation or quote marks that Gemini might have wrapped around the substring
    for mark in ['"', "'", "“", "”", "‘", "’"]:
        if q_norm.startswith(mark):
            q_norm = q_norm[len(mark):]
        if q_norm.endswith(mark):
            q_norm = q_norm[:-len(mark)]
            
    q_norm = q_norm.strip()
    if not q_norm:
        return False
        
    return q_norm in r_norm

def validate_analysis_evidence(analysis_result: dict, raw_reviews: list[dict]) -> dict:
    """
    Scans the Gemini synthesis output, validates that all quotes exist in the source dataset,
    and drops any themes, behaviors, or insights that have zero valid backing evidence.
    """
    logger.info("Starting evidence validation process for AI analysis insights.")
    
    # Map review_id to review_text and platform for easy lookup
    reviews_map = {r["review_id"]: r for r in raw_reviews}
    
    sections = ["themes", "behaviors", "jtbd", "pain_points"]
    validated_result = {}
    
    for section in sections:
        items = analysis_result.get(section, [])
        validated_items = []
        
        for item in items:
            supporting = item.get("supporting_reviews", [])
            valid_supporting = []
            
            for sup in supporting:
                ref_id = sup.get("review_id")
                quote = sup.get("quote")
                
                # Check if review exists in source dataset
                if ref_id in reviews_map:
                    source_review = reviews_map[ref_id]
                    # Verify quote is a verbatim substring of source review
                    if verify_quote(quote, source_review["review_text"]):
                        # Inject source platform details for completeness
                        sup_validated = sup.copy()
                        sup_validated["platform"] = source_review.get("platform", "unknown")
                        sup_validated["source"] = source_review.get("source", "csv_upload")
                        valid_supporting.append(sup_validated)
                    else:
                        logger.warning(f"Discarding invalid quote in {section} reference for review ID {ref_id}: '{quote}'")
                else:
                    logger.warning(f"Discarding phantom review ID reference in {section}: {ref_id}")
                    
            if valid_supporting:
                validated_item = item.copy()
                validated_item["supporting_reviews"] = valid_supporting
                # Inject a dynamic size parameter tracking how many reviews support this theme/behavior
                if section == "themes":
                    validated_item["size"] = len(valid_supporting)
                validated_items.append(validated_item)
            else:
                logger.warning(f"Dropping entire {section} item due to zero valid supporting evidence: '{item.get('title') or item.get('issue') or item.get('jtbd_statement')}'")
                
        validated_result[section] = validated_items
        
    return validated_result

def analyze_reviews(reviews_list: list[dict]) -> dict:
    """
    Synthesizes the reviews using gemini-2.5-flash to extract themes, behaviors, JTBD, and pain points.
    Runs post-validation on quotes and saves output results to data/processed/.
    """
    if not API_KEY:
        raise RuntimeError("Cannot perform AI review analysis: GEMINI_API_KEY is not set.")
        
    # Ensure reviews have sentiment classification
    if not any("sentiment" in r for r in reviews_list):
        reviews_list = classify_sentiments(reviews_list)
        
    logger.info(f"Sending {len(reviews_list)} reviews to Gemini for growth synthesis.")
    
    # Prepare compact reviews payload to stay within output token sizes while ensuring full context
    reviews_payload = []
    for r in reviews_list:
        reviews_payload.append({
            "review_id": r["review_id"],
            "review_text": r["review_text"],
            "rating": r["rating"],
            "sentiment": r.get("sentiment", "neutral"),
            "source": r.get("source", "csv_upload"),
            "platform": r.get("platform", "unknown")
        })
        
    prompt = f"""
You are a Lead Growth Product Manager at Blinkit, an ultra-fast grocery delivery app.
Your objective is to analyze customer reviews to understand category loyalty, shopping behaviors, and barriers to cross-category discovery.

Given the following list of customer reviews:
{json.dumps(reviews_payload, indent=2)}

You MUST analyze these reviews and return a single structured JSON response containing:
1. "themes": Dynamic customer discussion themes identified in the dataset. Each must contain:
   - "theme_id": unique string ID (e.g. "theme_1", "theme_2")
   - "title": descriptive, professional theme title (e.g. "catalog trust issues", "poor recommendation relevancy")
   - "description": 1-2 sentence description explaining the theme
   - "supporting_reviews": list of review references, each containing:
     - "review_id": exact matching review ID
     - "quote": a verbatim substring from that review representing this theme
2. "behaviors": Common shopping habits/behaviors (e.g., category loyalty, search-first, price-sensitive). Each must contain:
   - "behavior_type": E.g. "Category Loyalty" or "Search-First Behavior"
   - "description": Short description
   - "supporting_reviews": list of review references with review_id and verbatim quote
3. "jtbd": Jobs-To-Be-Done statements. E.g. "When I need groceries, I want to..." Each must contain:
   - "jtbd_statement": the JTBD sentence
   - "supporting_reviews": list of review references with review_id and verbatim quote
4. "pain_points": Specific customer friction points and their root causes. Each must contain:
   - "issue": E.g. "Missing checkout bundles"
   - "root_cause": underlying product/operational friction
   - "supporting_reviews": list of review references with review_id and verbatim quote

CRITICAL REQUIREMENT:
Every quote in the output MUST be a verbatim case-insensitive substring of the review's "review_text". 
Do NOT edit, paraphrase, or hallucinate quotes. Do not include phantom review IDs that are not present in the input.

Return your response strictly as a single JSON object.
"""
    model = get_generative_model()
    
    try:
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        # Parse output JSON
        raw_analysis = json.loads(response.text)
        
        # Validate quotes and review ID associations
        validated_analysis = validate_analysis_evidence(raw_analysis, reviews_list)
        
        # Save output results
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(backend_dir)
        processed_dir = os.path.join(project_root, "data", "processed")
        os.makedirs(processed_dir, exist_ok=True)
        
        save_path = os.path.join(processed_dir, "analysis_results.json")
        with open(save_path, "w", encoding="utf-8") as f:
            json.dump(validated_analysis, f, indent=2, ensure_ascii=False)
            
        logger.info(f"Successfully saved validated analysis results to {save_path}")
        return validated_analysis
        
    except Exception as e:
        logger.error(f"Error during Gemini review analysis: {str(e)}")
        try:
            backend_dir = os.path.dirname(os.path.abspath(__file__))
            project_root = os.path.dirname(backend_dir)
            save_path = os.path.join(project_root, "data", "processed", "analysis_results.json")
            if os.path.exists(save_path):
                logger.info(f"Fallback to pre-existing analysis results due to Gemini error: {save_path}")
                with open(save_path, "r", encoding="utf-8") as f:
                    return json.load(f)
        except Exception as fe:
            logger.error(f"Failed to load fallback analysis results: {str(fe)}")
        raise RuntimeError(f"Review analysis synthesis failed: {str(e)}")
