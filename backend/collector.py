# Collector module for scraping reviews from Google Play Store, App Store, and parsing CSVs.
import re
import datetime
import hashlib
import io
import os
import json
import requests
import pandas as pd
from urllib.parse import urlparse, parse_qs
from google_play_scraper import reviews, Sort

class DateTimeEncoder(json.JSONEncoder):
    """
    Custom JSON encoder to handle python datetime objects in raw Play Store reviews.
    """
    def default(self, obj):
        if isinstance(obj, (datetime.datetime, datetime.date)):
            return obj.isoformat()
        return super().default(obj)

def save_raw_reviews(data, filename: str):
    """
    Saves raw reviews to the data/raw/ directory.
    Constructs absolute path relative to the project root.
    """
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(backend_dir)
    raw_dir = os.path.join(project_root, "data", "raw")
    os.makedirs(raw_dir, exist_ok=True)
    file_path = os.path.join(raw_dir, filename)
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, cls=DateTimeEncoder, indent=2, ensure_ascii=False)

def extract_play_store_id(input_string: str) -> str:
    """
    Extract Play Store package ID (e.g., com.grofers.customerapp) from URL or ID string.
    """
    input_string = input_string.strip()
    if "play.google.com" in input_string:
        parsed_url = urlparse(input_string)
        query_params = parse_qs(parsed_url.query)
        if "id" in query_params:
            return query_params["id"][0]
        # Regex fallback
        match = re.search(r"[?&]id=([^&]+)", input_string)
        if match:
            return match.group(1)
    # Check for basic app ID structure (at least one dot, no spaces)
    if "." in input_string and " " not in input_string:
        return input_string
    raise ValueError(f"Invalid Google Play URL or App ID: {input_string}")

def extract_app_store_info(input_string: str) -> tuple[int, str, str]:
    """
    Extract Apple App Store app_id, app_name, and country from URL or ID.
    Returns: (app_id, app_name, country)
    """
    input_string = input_string.strip()
    
    # Check for URL
    if "apps.apple.com" in input_string:
        # Regex pattern: apps.apple.com/{country}/app/{app_name}/id{app_id}
        # or apps.apple.com/{country}/app/id{app_id}
        match = re.search(r"apps\.apple\.com/([a-z]{2})/app/(?:([^/]+)/)?id(\d+)", input_string)
        if match:
            country = match.group(1) or "in"
            app_name = match.group(2) or "app"
            app_id = int(match.group(3))
            return app_id, app_name, country
        
        # simpler match fallback
        match_id = re.search(r"id(\d+)", input_string)
        if match_id:
            app_id = int(match_id.group(1))
            return app_id, "app", "in"
            
    # If it is only digits, treat as app ID with defaults
    if input_string.isdigit():
        return int(input_string), "app", "in"
        
    raise ValueError(f"Invalid App Store ID or URL: {input_string}")

def scrape_play_store(app_id_or_url: str, count: int = 100) -> list[dict]:
    """
    Scrapes reviews from Google Play Store and normalizes them to the unified schema.
    Saves raw reviews to data/raw/play_store_raw.json.
    """
    app_id = extract_play_store_id(app_id_or_url)
    
    try:
        results, _ = reviews(
            app_id,
            lang='en',
            country='in',  # Default country filter to India since Blinkit operates in India
            sort=Sort.NEWEST,
            count=count
        )
    except Exception as e:
        raise RuntimeError(f"Error scraping Google Play Store app '{app_id}': {str(e)}")
        
    # Save raw reviews to data/raw
    save_raw_reviews(results, "play_store_raw.json")
    
    normalized = []
    for r in results:
        dt = r.get("at")
        timestamp_str = dt.isoformat() if isinstance(dt, datetime.datetime) else str(dt)
        
        normalized.append({
            "review_id": str(r.get("reviewId")),
            "review_text": str(r.get("content", "")),
            "rating": int(r.get("score", 0)),
            "source": "play_store",
            "timestamp": timestamp_str,
            "username": str(r.get("userName", "Anonymous")),
            "platform": "android"
        })
    return normalized

def scrape_app_store(app_id_or_url: str, count: int = 100) -> list[dict]:
    """
    Scrapes reviews from Apple App Store RSS feed and normalizes them to the unified schema.
    Saves raw reviews to data/raw/app_store_raw.json.
    """
    app_id, app_name, country = extract_app_store_info(app_id_or_url)
    
    normalized = []
    raw_entries = []
    page = 1
    # Each RSS page contains up to 50 entries
    max_pages = (count + 49) // 50
    
    while len(normalized) < count and page <= min(max_pages, 10):
        url = f"https://itunes.apple.com/{country}/rss/customerreviews/page={page}/id={app_id}/sortby=mostrecent/json"
        try:
            r = requests.get(url, timeout=10)
            
            # Fallback to "us" region if "in" or custom region returns 404/no results on page 1
            if r.status_code == 404 and country != "us" and page == 1:
                url = f"https://itunes.apple.com/us/rss/customerreviews/page={page}/id={app_id}/sortby=mostrecent/json"
                r = requests.get(url, timeout=10)
                
            if r.status_code != 200:
                break
                
            data = r.json()
            feed = data.get("feed", {})
            entries = feed.get("entry", [])
            
            if isinstance(entries, dict):
                entries = [entries]
                
            if not entries:
                break
                
            raw_entries.extend(entries)
            
            for entry in entries:
                if len(normalized) >= count:
                    break
                    
                # Skip application info entry (must have 'author' key to be a review)
                if "author" not in entry:
                    continue
                    
                review_id = str(entry.get("id", {}).get("label", ""))
                title = str(entry.get("title", {}).get("label", ""))
                content = str(entry.get("content", {}).get("label", ""))
                text = f"{title}: {content}" if title else content
                
                try:
                    rating = int(entry.get("im:rating", {}).get("label", "0"))
                except ValueError:
                    rating = 0
                    
                timestamp = str(entry.get("updated", {}).get("label", ""))
                username = str(entry.get("author", {}).get("name", {}).get("label", "Anonymous"))
                
                # Normalize timestamp if possible to match play store YYYY-MM-DDTHH:MM:SS
                try:
                    # e.g., 2026-07-13T05:56:12-07:00 -> 2026-07-13T05:56:12
                    if "-" in timestamp and "T" in timestamp:
                        dt_part = timestamp.split("-")
                        if len(dt_part) >= 4:  # contains timezone offset
                            timestamp = "-".join(dt_part[:-1])
                except Exception:
                    pass
                
                normalized.append({
                    "review_id": review_id,
                    "review_text": text,
                    "rating": rating,
                    "source": "app_store",
                    "timestamp": timestamp,
                    "username": username,
                    "platform": "ios"
                })
                
            page += 1
        except Exception as e:
            if not normalized:
                raise RuntimeError(f"Error scraping Apple App Store: {str(e)}")
            break
            
    # Save raw reviews to data/raw
    if raw_entries:
        save_raw_reviews(raw_entries, "app_store_raw.json")
        
    return normalized

def parse_csv_reviews(file_path_or_buffer) -> list[dict]:
    """
    Flexible CSV reviews parser that maps heterogeneous headers into a normalized format.
    Accepts a file path string or bytes buffer.
    """
    try:
        if isinstance(file_path_or_buffer, bytes):
            if len(file_path_or_buffer.strip()) == 0:
                raise ValueError("Empty CSV content")
            try:
                decoded = file_path_or_buffer.decode("utf-8")
            except UnicodeDecodeError:
                decoded = file_path_or_buffer.decode("latin-1")
            df = pd.read_csv(io.StringIO(decoded))
        elif isinstance(file_path_or_buffer, str):
            if os.path.exists(file_path_or_buffer) and os.path.getsize(file_path_or_buffer) == 0:
                raise ValueError("Empty CSV file")
            df = pd.read_csv(file_path_or_buffer)
        else:
            df = pd.read_csv(file_path_or_buffer)
    except Exception as e:
        raise ValueError(f"Failed to parse CSV: {str(e)}")
        
    # Helper to find column matching patterns
    def find_column(options, df_cols):
        for opt in options:
            for col in df_cols:
                if col.lower().strip() == opt.lower():
                    return col
        return None

    df_cols = list(df.columns)
    text_col = find_column(["review_text", "review text", "review", "text", "content", "body", "comments", "comment"], df_cols)
    rating_col = find_column(["rating", "score", "stars", "rating_value", "rating value"], df_cols)
    time_col = find_column(["timestamp", "date", "created_at", "created at", "time", "at", "datetime"], df_cols)
    user_col = find_column(["username", "user name", "user", "author", "name", "reviewer"], df_cols)
    platform_col = find_column(["platform", "os", "device", "source_device"], df_cols)
    
    if not text_col:
        raise ValueError("CSV must contain a review text column (e.g., 'review_text', 'review', 'text', 'content').")
        
    normalized = []
    for idx, row in df.iterrows():
        text = str(row[text_col]).strip() if pd.notna(row[text_col]) else ""
        if not text:
            continue
            
        rating = 0
        if rating_col and pd.notna(row[rating_col]):
            try:
                rating = int(float(row[rating_col]))
            except ValueError:
                pass
                
        username = "Anonymous"
        if user_col and pd.notna(row[user_col]):
            username = str(row[user_col]).strip()
            
        timestamp_str = datetime.datetime.now().isoformat()
        if time_col and pd.notna(row[time_col]):
            raw_time = str(row[time_col]).strip()
            try:
                pd_time = pd.to_datetime(raw_time)
                timestamp_str = pd_time.isoformat()
            except Exception:
                timestamp_str = raw_time
                
        platform = "unknown"
        if platform_col and pd.notna(row[platform_col]):
            platform = str(row[platform_col]).lower().strip()
            
        # Check if review_id is provided in the CSV
        review_id_col = find_column(["review_id", "review id", "id"], df_cols)
        if review_id_col and pd.notna(row[review_id_col]):
            review_id = str(row[review_id_col]).strip()
        else:
            hash_input = f"{username}_{timestamp_str}_{text}_{idx}"
            review_id = hashlib.md5(hash_input.encode("utf-8")).hexdigest()
            
        normalized.append({
            "review_id": review_id,
            "review_text": text,
            "rating": rating,
            "source": "csv_upload",
            "timestamp": timestamp_str,
            "username": username,
            "platform": platform
        })
        
    if not normalized:
        raise ValueError("CSV contains no review records.")
        
    return normalized
