# Processor module for validating, cleaning, deduplicating, and masking customer reviews.
import os
import re
import json
import logging
import hashlib
import unicodedata
from langdetect import detect, LangDetectException

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s - %(message)s")
logger = logging.getLogger("Processor")

# Compile PII Regex patterns
EMAIL_PATTERN = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b')
# Matches phone numbers like +91 98765 43210, 98765-43210, 011-23456789, +1-555-555-5555, or 10-12 digit numbers
PHONE_PATTERN = re.compile(r'\+?\b\d{1,4}[-.\s]?\(?\d{2,4}?\)?[-.\s]?\d{3,4}[-.\s]?\d{4}\b|\b\d{10,12}\b')
URL_PATTERN = re.compile(r'https?://(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)')

def validate_review(review: dict) -> bool:
    """
    Validates that a review dictionary conforms to the required unified review schema.
    """
    required_keys = {"review_id", "review_text", "rating", "source", "timestamp", "username", "platform"}
    if not isinstance(review, dict):
        logger.warning("Validation failed: Review is not a dictionary.")
        return False
        
    missing = required_keys - set(review.keys())
    if missing:
        logger.warning(f"Validation failed: Missing keys {missing} in review.")
        return False
        
    # Check types and basic validity
    if not review.get("review_id") or not isinstance(review["review_id"], str):
        logger.warning("Validation failed: Invalid or empty 'review_id'.")
        return False
    if not isinstance(review.get("review_text"), str):
        logger.warning("Validation failed: 'review_text' must be a string.")
        return False
    if not isinstance(review.get("rating"), int) or not (0 <= review["rating"] <= 5):
        logger.warning("Validation failed: 'rating' must be an integer between 0 and 5.")
        return False
    if not review.get("source") or not isinstance(review["source"], str):
        logger.warning("Validation failed: Invalid or empty 'source'.")
        return False
    if not review.get("timestamp") or not isinstance(review["timestamp"], str):
        logger.warning("Validation failed: Invalid or empty 'timestamp'.")
        return False
    if not isinstance(review.get("username"), str):
        logger.warning("Validation failed: 'username' must be a string.")
        return False
    if review.get("platform") not in {"android", "ios", "web", "unknown"}:
        logger.warning(f"Validation failed: Invalid platform '{review.get('platform')}'.")
        return False
        
    return True

def get_review_hash(text: str) -> str:
    """
    Generates a deterministic MD5 hash for a normalized version of the review text to identify duplicates.
    """
    normalized = re.sub(r'\s+', '', text).lower()
    return hashlib.md5(normalized.encode("utf-8")).hexdigest()

def mask_pii(text: str) -> str:
    """
    Masks personally identifiable information (PII) including email addresses, phone numbers, and URLs.
    """
    # 1. Mask URLs
    masked = URL_PATTERN.sub("[REDACTED_URL]", text)
    # 2. Mask Emails
    masked = EMAIL_PATTERN.sub("[REDACTED_EMAIL]", masked)
    # 3. Mask Phone Numbers
    # To prevent phone regex from destroying redacted tokens, we only apply phone masking outside redaction brackets
    masked = PHONE_PATTERN.sub("[REDACTED_PHONE]", masked)
    return masked

def strip_emojis(text: str) -> str:
    """
    Removes emojis and other non-math/non-currency symbols from the text using Unicode categories.
    """
    # Category "So" (Symbol, other) covers most emojis. We also strip variation selectors.
    return "".join(c for c in text if unicodedata.category(c) != "So" and c not in {'\ufe0e', '\ufe0f'})

def clean_text(text: str) -> str:
    """
    Cleans review text by masking PII, removing emojis, converting to lowercase, 
    normalizing whitespace, and preserving punctuation.
    """
    # 1. Mask PII (done on original text to preserve case-sensitive email/url matches)
    text = mask_pii(text)
    # 2. Strip emojis
    text = strip_emojis(text)
    # 3. Convert to lowercase
    text = text.lower()
    # 4. Normalize whitespace (newlines, tabs, multiple spaces -> single space)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def is_spam_or_noise(text: str) -> bool:
    """
    Filters out reviews that split into less than 3 words (meaningless)
    or contain exclusively redacted PII/URLs.
    """
    words = text.split()
    # Meaningless if less than 3 words
    if len(words) < 3:
        return True
        
    # Check if the text consists exclusively of redaction tokens or punctuation
    non_redacted_words = [w for w in words if w not in {"[redacted_url]", "[redacted_email]", "[redacted_phone]"}]
    if len(non_redacted_words) == 0:
        return True
        
    return False

def detect_review_language(text: str) -> str:
    """
    Detects the review language using langdetect. Returns language code or 'unknown' if detection fails.
    """
    # Strip redaction tokens before language detection as they confuse the classifier
    clean_for_lang = text.replace("[redacted_url]", "").replace("[redacted_email]", "").replace("[redacted_phone]", "").strip()
    if not clean_for_lang:
        return "unknown"
        
    try:
        return detect(clean_for_lang)
    except LangDetectException:
        return "unknown"

def preprocess_reviews(reviews_list: list[dict]) -> tuple[list[dict], dict]:
    """
    Transforms raw reviews into a clean dataset ready for AI analysis.
    Deduplicates, validates schema, filters spam, verifies English language, and cleans text.
    Saves outputs in data/processed/.
    """
    logger.info(f"Starting preprocessing pipeline for {len(reviews_list)} reviews.")
    
    stats = {
        "total_reviews": len(reviews_list),
        "valid_reviews": 0,
        "duplicate_reviews_removed": 0,
        "spam_removed": 0,
        "unsupported_languages": 0,
        "final_clean_reviews": 0
    }
    
    seen_hashes = set()
    processed_reviews = []
    
    for r in reviews_list:
        # 1. Validation check
        if not validate_review(r):
            continue
        stats["valid_reviews"] += 1
        
        raw_text = r["review_text"]
        
        # 2. Deduplication check
        text_hash = get_review_hash(raw_text)
        if text_hash in seen_hashes:
            stats["duplicate_reviews_removed"] += 1
            logger.debug(f"Filtered duplicate review ID: {r['review_id']}")
            continue
        seen_hashes.add(text_hash)
        
        # 3. Clean Text (PII masking, emoji removal, lowercase, whitespace normalization)
        cleaned = clean_text(raw_text)
        
        # 4. Spam check
        if is_spam_or_noise(cleaned):
            stats["spam_removed"] += 1
            logger.debug(f"Filtered spam/noise review ID: {r['review_id']}")
            continue
            
        # 5. Language check
        lang = detect_review_language(cleaned)
        if lang != "en":
            stats["unsupported_languages"] += 1
            logger.debug(f"Filtered unsupported language review ID: {r['review_id']} (lang: {lang})")
            continue
            
        # 6. Rebuild unified schema record with clean text
        cleaned_review = r.copy()
        cleaned_review["review_text"] = cleaned
        processed_reviews.append(cleaned_review)
        
    stats["final_clean_reviews"] = len(processed_reviews)
    
    # Define save paths relative to project root
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(backend_dir)
    processed_dir = os.path.join(project_root, "data", "processed")
    os.makedirs(processed_dir, exist_ok=True)
    
    reviews_save_path = os.path.join(processed_dir, "processed_reviews.json")
    stats_save_path = os.path.join(processed_dir, "preprocessing_stats.json")
    
    with open(reviews_save_path, "w", encoding="utf-8") as f:
        json.dump(processed_reviews, f, indent=2, ensure_ascii=False)
    logger.info(f"Saved processed reviews to {reviews_save_path}")
        
    with open(stats_save_path, "w", encoding="utf-8") as f:
        json.dump(stats, f, indent=2, ensure_ascii=False)
    logger.info(f"Saved preprocessing statistics to {stats_save_path}")
    
    logger.info(f"Preprocessing completed. Final reviews: {stats['final_clean_reviews']}/{stats['total_reviews']}")
    return processed_reviews, stats
